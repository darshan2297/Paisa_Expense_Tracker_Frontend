# Frontend — Docker Guide

## What This Image Is (and isn't) For

The `Dockerfile` builds the **web** export (`npx expo export --platform web`) and
serves the static output. It exists for local full-stack `docker-compose` development
and as a possible self-hosted fallback — it is **not** what runs in production. The
production web deploy goes through Vercel, which builds directly from source (see the
workspace `docs/DEPLOYMENT_GUIDE.md` for why). Mobile builds (iOS/Android) don't go
through Docker at all — they're Expo/EAS builds, separate from this image entirely.

## Building Locally

```bash
docker build -t paisa-frontend:local .
docker run --rm -p 8081:8081 paisa-frontend:local
```

## Via docker-compose

From the workspace root: `docker compose up --build` — brings up this web build
alongside the backend and Postgres. See the workspace `docker-compose.yml`.

## Web Export Details

`app.json`'s `web.output` is set to `"single"` (a client-side-only SPA bundle) rather
than Expo's `"static"` prerendering mode — `"static"` tries to prerender each route at
build time in a Node environment, which breaks because the TanStack Query
AsyncStorage persister touches `window` at import time (a browser-only API). `"single"`
is also the simpler match for this Dockerfile's plain static-file-serving approach.
