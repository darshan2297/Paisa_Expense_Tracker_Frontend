# Frontend — Troubleshooting

**`node --version` still shows an old version after `nvm use --lts`**
On some shells, sourcing `nvm.sh` and calling `nvm use` chained with `&&` silently
short-circuits if `nvm.sh`'s own exit code is non-zero, leaving the system Node active.
Run them as separate statements (`. "$NVM_DIR/nvm.sh"` then `nvm use --lts` on its own
line) and re-check `node --version` before running any `npm`/`npx`/`expo` command.

**`expo export --platform web` crashes with `ReferenceError: window is not defined`**
This happens if `app.json`'s `web.output` is changed back to `"static"` — Expo's
static prerendering runs in a Node environment without `window`, and the TanStack
Query AsyncStorage persister (`src/api/queryClient.ts`) touches `window` at import
time. Keep `web.output: "single"` (see `docs/DOCKER_GUIDE.md`).

**ESLint/TypeScript pass locally but fail in CI**
Confirm your local Node version matches CI's (`22` — see `.github/workflows/ci.yml`).
A different major Node version can resolve slightly different transitive dependency
versions and produce different lint/type results.

**The app can't reach the backend**
Check `EXPO_PUBLIC_API_URL` in `.env` — for a physical device via Expo Go,
`localhost` refers to the _device_, not your development machine; use your machine's
LAN IP (or the docker-compose service name if both are in the same Docker network).

**Commit rejected by commitlint**
Your commit message doesn't follow Conventional Commits — see the workspace
`docs/COMMIT_NAMING.md` for the format and examples.

**Vercel deploy fails in CI**
Confirm the three secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) are
set on the repo and that `vercel link` was run once locally to establish the project —
see the workspace `docs/DEPLOYMENT_GUIDE.md`.
