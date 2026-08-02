# Frontend — Coding Standards

## Tooling (enforced via Husky pre-commit/commit-msg hooks and CI)

| Tool                          | Purpose                                      | Command                         |
| ----------------------------- | -------------------------------------------- | ------------------------------- |
| ESLint (`eslint-config-expo`) | Linting                                      | `npm run lint`                  |
| Prettier                      | Formatting                                   | `npm run format`                |
| TypeScript (`strict: true`)   | Static typing                                | `npm run typecheck`             |
| commitlint                    | Conventional Commits on every commit message | enforced by `.husky/commit-msg` |

`lint-staged` (in `package.json`) runs ESLint + Prettier on staged files via the
`.husky/pre-commit` hook — install hooks once with `npm run prepare` (also runs
automatically on `npm install` via Husky's own postinstall).

## Layering Rule

```
app/ (routes)  →  src/features/<name>/  →  src/api | src/components | src/hooks
```

- Route files under `app/` are thin: call a feature's hook, render. No direct API
  calls or business logic in a route file.
- A feature folder never imports another feature folder's internals — share through
  `src/components`, `src/hooks`, or `src/api`.

## Naming

- Files exporting a single component: `PascalCase.tsx` (`Button.tsx`). Files exporting
  hooks/utilities: `camelCase.ts` (`useDebounce.ts`, `currency.ts`).
- Classes/components: `PascalCase`. Constants: `UPPER_SNAKE_CASE`.

## State: Server vs. Client

Server state (anything from the API) goes through TanStack Query — never duplicate it
into a Zustand store "for convenience." Zustand is reserved for genuinely client-only
state (session/auth flags, app-lock state, UI toggles that don't come from the
backend). Blurring this line tends to reinvent caching/refetching logic TanStack Query
already provides.

## Comments

Default to none. A comment is only worth writing when it explains a non-obvious
constraint (see `docs/DOCKER_GUIDE.md`'s note on `web.output: "single"` for an example
of the kind of thing worth documenting this way).
