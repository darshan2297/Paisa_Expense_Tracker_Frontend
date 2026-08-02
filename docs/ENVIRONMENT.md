# Frontend — Environment Variables

Expo only exposes environment variables prefixed `EXPO_PUBLIC_` to client code (by
design — anything else is a build-time-only secret, and there shouldn't be any real
secrets in a mobile/web client bundle regardless). Copy `.env.example` to `.env` to get
started.

## Dev vs prod files

| File                      | Committed? | Purpose                                            |
| ------------------------- | ---------- | -------------------------------------------------- |
| `.env.example`            | Yes        | Local **dev** template                             |
| `.env.production.example` | Yes        | **Prod** template — set in Vercel/EAS before build |
| `.env`                    | No         | Active local dev config                            |
| `.env.production`         | No         | Optional — prod API URL for local testing          |

Switching to production requires **only env changes** + rebuild — no code changes.

**Local ports:** Expo dev server **8081** (`npm start`); backend API **8001** (`EXPO_PUBLIC_API_URL`).

## Variables

| Variable              | Dev (`.env.example`)           | Prod                                       |
| --------------------- | ------------------------------ | ------------------------------------------ |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8001/api/v1` | `https://your-backend.onrender.com/api/v1` |

Auth tokens are handled via `expo-secure-store` at runtime (not env vars).

## Running against prod API locally

```bash
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1 npm start
```

Or copy `.env.production.example` to `.env.production` and use it for release builds.
