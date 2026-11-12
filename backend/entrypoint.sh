#!/bin/sh
set -e

# Wait for Postgres to accept connections. compose already gates us behind a
# healthcheck, but this keeps the image usable on its own and survives a
# database restart.
echo "[entrypoint] waiting for postgres at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432} ..."
python - <<'PY'
import os, sys, time
import psycopg

# Railway supplies DATABASE_URL; compose supplies the discrete variables.
url = os.environ.get("DATABASE_URL", "").strip()

if url:
    connect = lambda: psycopg.connect(url, connect_timeout=3)
else:
    connect = lambda: psycopg.connect(
        host=os.environ.get("POSTGRES_HOST", "db"),
        port=os.environ.get("POSTGRES_PORT", "5432"),
        dbname=os.environ.get("POSTGRES_DB", "talentpath_iq"),
        user=os.environ.get("POSTGRES_USER", "postgres"),
        password=os.environ.get("POSTGRES_PASSWORD", ""),
        connect_timeout=3,
    )

deadline = time.time() + 60
last = None
while time.time() < deadline:
    try:
        connect().close()
        print("[entrypoint] postgres is up")
        sys.exit(0)
    except Exception as exc:
        last = exc
        time.sleep(1)

print(f"[entrypoint] postgres unreachable after 60s: {last}", file=sys.stderr)
sys.exit(1)
PY

echo "[entrypoint] applying migrations ..."
python manage.py migrate --noinput

echo "[entrypoint] collecting static files ..."
python manage.py collectstatic --noinput --clear

# Seed the course catalogue. The command upserts, so this is safe on every boot.
if [ "${SEED_COURSES:-1}" = "1" ]; then
  echo "[entrypoint] seeding courses ..."
  python manage.py seed_courses
fi

# Optional convenience superuser for /admin/ in local development.
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  echo "[entrypoint] ensuring superuser '${DJANGO_SUPERUSER_USERNAME}' ..."
  python manage.py createsuperuser --noinput || true
fi

echo "[entrypoint] starting: $*"
exec "$@"
