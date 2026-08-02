# Paisa Frontend

Expo + Expo Router + TypeScript app for the Paisa personal finance tracker — one
codebase targeting iOS, Android, and Web. Part of a two-repo project — see the
[workspace docs](../docs/ARCHITECTURE.md) (in the local development workspace, one
level up from this repo) for the full system architecture, feature roadmap, and
engineering philosophy.

## Quick Start

```bash
npm install
cp .env.example .env
npx expo start
```

Scan the QR code with Expo Go, or press `w` for web, `i`/`a` for iOS/Android
simulators.

See `docs/INSTALLATION.md` for full setup and `docs/DEVELOPMENT_GUIDE.md` for
day-to-day workflow.

## Docs in this repo

| Doc                         | Covers                                                  |
| --------------------------- | ------------------------------------------------------- |
| `docs/INSTALLATION.md`      | First-time local setup                                  |
| `docs/ENVIRONMENT.md`       | Environment variables                                   |
| `docs/DEVELOPMENT_GUIDE.md` | Day-to-day dev workflow, adding a feature               |
| `docs/DOCKER_GUIDE.md`      | Building/running the web-export Docker image            |
| `docs/CICD_GUIDE.md`        | What the GitHub Actions pipelines do                    |
| `docs/CODING_STANDARDS.md`  | Lint/format/type rules and layering conventions         |
| `docs/COMPONENT_GUIDE.md`   | Design tokens, shared components, when to add a new one |
| `docs/TROUBLESHOOTING.md`   | Common local-dev problems                               |

Shared architecture, the feature roadmap, git workflow, and deployment guide live in
the workspace-level `docs/` folder alongside this repo.
