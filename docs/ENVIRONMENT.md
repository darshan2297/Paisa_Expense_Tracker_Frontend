# Frontend — Environment Variables

Expo only exposes environment variables prefixed `EXPO_PUBLIC_` to client code (by
design — anything else is a build-time-only secret, and there shouldn't be any real
secrets in a mobile/web client bundle regardless). Copy `.env.example` to `.env` to get
started.

| Variable              | Default (`.env.example`)       | Notes                                                                                                                                             |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL the Axios client (`src/api/client.ts`) targets. Point this at the Render backend URL in production (Vercel project environment variable) |

Nothing else is configured yet — auth tokens are handled via `expo-secure-store` at
runtime (not env vars), wired for real starting in Feature F1.
