# Frontend — Development Guide

## Daily Workflow

```bash
npx expo start        # dev server; w/i/a for web/iOS/Android
npm run typecheck
npm run lint
npm run format
```

## Adding a New Feature

Following `FEATURE_ROADMAP.md` (workspace `docs/`), mirroring the backend module that
lands in the same phase:

1. Create `src/features/<name>/` with `api.ts` (calls into `src/api/client.ts`),
   `hooks.ts` (TanStack Query hooks wrapping `api.ts`), `store.ts` (only if the feature
   needs client-only UI state beyond server state — most won't), `types.ts`, and
   `components/` for feature-specific UI.
2. Add route file(s) under `app/` — screens stay thin: they call a feature's hooks and
   render, they don't contain API calls or business logic directly.
3. Use `src/components/` primitives (`Button`, `Card`, `StatTile`, ...) and
   `src/theme/` tokens rather than ad-hoc styles — see `docs/COMPONENT_GUIDE.md`.
4. Forms go through React Hook Form; shared/reusable validation schemas live in
   `src/forms/`.
5. Never import one feature folder's internals from another feature folder — share via
   `src/components`, `src/hooks`, or `src/api`.

## Project Layout Recap

```
app/                     Expo Router routes — thin screens only
src/features/<name>/     one per backend module — api/hooks/store/types/components
src/api/                 axios client + TanStack Query client (with offline persistence)
src/components/          shared UI primitives
src/theme/               colors/typography/spacing tokens (ported from the product design mockup)
src/stores/              global Zustand stores (session, app-lock)
src/forms/               shared React Hook Form + validation schemas
src/utils/               currency (₹, lakh/crore) and date (en-IN) formatting helpers
```

## Auth (once F1 ships)

`src/api/client.ts` already has request/response interceptor stubs (reading a token
from `expo-secure-store`, handling 401s) with `TODO` comments — F1 wires these to the
real login/refresh flow and `src/stores/sessionStore.ts`.

## Offline Support

`src/api/queryClient.ts` sets up TanStack Query with an AsyncStorage-backed persister
— cached data survives app restarts and works offline-first for reads. Write
(mutation) queuing while offline is added per-feature as needed, not built
speculatively ahead of any feature that requires it.
