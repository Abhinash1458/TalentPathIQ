import { defineRailway, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "us-west2" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "us-west2", sizeMB: 5000 });
  const web = service("web", {
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    healthcheck: "/",
    healthcheckTimeout: 120,
    replicas: { "us-west2": 1 },
    env: {
      PORT: preserve(),
      VITE_API_BASE_URL: preserve(),
      // The TPIQ-56/57 pages call same-origin "/api" instead of reading
      // VITE_API_BASE_URL, so nginx must proxy that through to the API.
      // Railway's private network is IPv6-only, so this goes out via the
      // backend's public domain. The Host header has to name the backend:
      // Railway's edge routes by Host, so forwarding this service's own
      // host would loop the request straight back here.
      BACKEND_URL: "https://backend-production-deef5b47.up.railway.app",
      BACKEND_HOST: "backend-production-deef5b47.up.railway.app",
      // Docker's embedded resolver does not exist on Railway.
      DNS_RESOLVER: "1.1.1.1 8.8.8.8",
    },
  });
  const backend = service("backend", {
    // Both services upload the whole repo as the build context, so the
    // backend must name its Dockerfile by path or it would build the
    // frontend image sitting at the repo root.
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "backend/Dockerfile" },
    healthcheck: "/api/courses/",
    healthcheckTimeout: 300,
    replicas: { "us-west2": 1 },
    env: {
      CORS_ALLOWED_ORIGINS: preserve(),
      DATABASE_URL: preserve(),
      DJANGO_DEBUG: preserve(),
      DJANGO_SECRET_KEY: preserve(),
      DJANGO_SUPERUSER_EMAIL: preserve(),
      DJANGO_SUPERUSER_PASSWORD: preserve(),
      DJANGO_SUPERUSER_USERNAME: preserve(),
      PORT: preserve(),
      SEED_COURSES: preserve(),
      // Railway's healthcheck calls the container on an internal hostname,
      // which Django rejects with 400 unless it is allowed. A leading dot
      // matches the domain and any subdomain.
      DJANGO_ALLOWED_HOSTS: ".railway.app,.railway.internal,localhost,127.0.0.1",
      // TLS is terminated at Railway's edge; redirecting internally would
      // bounce the plain-HTTP healthcheck instead of answering it.
      SECURE_SSL_REDIRECT: "False",
    },
  });

  return project("talentpath-iq", {
    variables: { managed: true },
    resources: [web, Postgres, backend, postgresVolume],
  });
});
