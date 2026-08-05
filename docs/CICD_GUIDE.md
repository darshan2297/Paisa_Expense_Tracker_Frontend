# Frontend — CI/CD Guide

Two workflows in `.github/workflows/`:

## `ci.yml` — every PR and every push to `dev`/`uat`

```
lint  → npm run lint (ESLint) + npm run typecheck (tsc --noEmit)
test  → npm test (Jest — added starting from the first feature with real logic to test)
build → docker build (not pushed — validates the web-export Dockerfile builds cleanly)
```

## `release.yml` — every push to `main`

```
release-please → scans Conventional Commits, opens/updates a Release PR
[on Release PR merge] → tags vX.Y.Z, publishes a GitHub Release
build-and-push (fallback image, not the prod deploy path)
                → builds/pushes ghcr.io/.../paisa-frontend:{vX.Y.Z,latest}
eas-build       → Android APK via EAS (`docs/ANDROID_BUILD.md`); iOS needs Apple Developer
deploy          → vercel pull / vercel build / vercel deploy --prebuilt --prod
                  (builds from source — this is the actual production path)
```

**Required GitHub Actions secrets for this repo:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
`VERCEL_PROJECT_ID`. See the workspace `docs/DEPLOYMENT_GUIDE.md` for one-time Vercel
project setup (`vercel link` locally to obtain the org/project IDs).
