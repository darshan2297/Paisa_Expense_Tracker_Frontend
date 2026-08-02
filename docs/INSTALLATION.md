# Frontend — Installation

## Prerequisites

- Node.js 20+ (the scaffold was built and verified on Node 22). The system default
  Node on some machines may be much older — if `node --version` shows anything below
  18, install a current version via `nvm install --lts` and `nvm use --lts` (note:
  on some shells `nvm.sh` doesn't chain reliably with `&&` — source it and run `nvm use`
  as separate statements if `node --version` still shows the old version afterward).
- Expo Go app on your phone (for the fastest local iteration), or Xcode/Android Studio
  simulators if you want native simulators instead of/in addition to a physical device.

## Setup

```bash
npm install
cp .env.example .env     # sets EXPO_PUBLIC_API_URL — point it at your running backend
npx expo start
```

- Press `w` to open the web version in a browser.
- Press `i` / `a` for iOS/Android simulators (if installed).
- Scan the printed QR code with the Expo Go app for a physical device.

## Verifying the Setup

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # expo lint (ESLint)
npm run format       # prettier --write .
```

## Full Stack via Docker Compose

From the **workspace root** (one directory up, containing both `backend/` and
`frontend/`): `docker compose up --build` brings up Postgres, the backend, and this
app's static web export together. See `docs/DOCKER_GUIDE.md` and the workspace's
`docs/ARCHITECTURE.md`.
