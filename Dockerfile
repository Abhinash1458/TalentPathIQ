# ---------- build stage ----------
FROM node:24-alpine AS build

WORKDIR /app

# package-lock.json is committed, so npm ci gives a reproducible install.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Empty by default: the app then uses relative /api paths, which nginx
# proxies to the backend. On Railway the two services have different
# domains, so this is set to the backend's public URL at build time.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---------- serve stage ----------
FROM nginx:1.29-alpine

# The nginx image renders /etc/nginx/templates/*.template with envsubst
# into /etc/nginx/conf.d/ before starting.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Defaults for local compose; Railway overrides PORT (and BACKEND_URL).
ENV PORT=80 \
    BACKEND_URL=http://backend:8000

EXPOSE 80

# Probe 127.0.0.1 explicitly: "listen" binds IPv4 only, while "localhost"
# inside the container resolves to ::1 first and would be refused.
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=5 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1

CMD ["nginx", "-g", "daemon off;"]
