FROM python:3.13-slim

# Python behaviour inside containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# psycopg[binary] ships its own libpq, so no build toolchain is needed.
# curl is kept for the compose healthcheck.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Paths are relative to the REPOSITORY ROOT, which is the build context for
# both docker-compose and Railway. Railway's CLI uploads the whole repo and
# ignores per-service root directories, so the context cannot be ./backend.
COPY backend/requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY backend /app

# Normalise line endings in case the image is built from a Windows checkout,
# otherwise the shebang breaks with /bin/sh^M: bad interpreter.
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

# Railway injects $PORT and expects the process to bind it; locally it is
# unset and this falls back to 8000, which is what compose maps.
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-3} --timeout 60 --access-logfile -"]
