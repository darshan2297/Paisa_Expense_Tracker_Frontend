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

| Variable              | Dev (`.env.example`)           | Prod                                                        |
| --------------------- | ------------------------------ | ----------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8001/api/v1` | `https://paisa-expense-tracker-backend.onrender.com/api/v1` |

Auth tokens are handled via `expo-secure-store` at runtime (not env vars).

## Push notifications

Device push uses Expo's push service (no Firebase keys in the client). After login
on a physical iOS/Android device, the app requests notification permission and
registers an `ExponentPushToken[…]` with `POST /push-tokens`.

- **Web / simulators:** registration is skipped (Expo push is native-only).
- **EAS production builds:** set `extra.eas.projectId` in `app.json` (or via EAS)
  so `getExpoPushTokenAsync` can resolve the project. Expo Go works without it.
- **Standalone Android APK:** see [`ANDROID_BUILD.md`](./ANDROID_BUILD.md). Link
  free Firebase FCM credentials in the Expo project for reliable device push.
- **Backend:** Celery Beat jobs create in-app notifications and call Expo's push
  API; the worker needs outbound HTTPS to `exp.host`.

## Running against prod API locally

```bash
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1 npm start
```

Or copy `.env.production.example` to `.env.production` and use it for release builds.
