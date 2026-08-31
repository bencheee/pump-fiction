# Pump Fiction (working repository name)

This repository specifies a private, single-user, mobile-only web application for tracking gym workouts, exercise progress, weight, and body measurements. The final user-facing application name remains open.

The functional specification, mobile-wireframe decisions, local-MVP acceptance criteria, development governance, repository-native project-management workflow, local technical architecture, and frozen mobile design handoff are accepted. Application implementation has started with the runtime and static-quality baseline.

Project documentation starts at [`docs/INDEX.md`](docs/INDEX.md). Codex and other contributors should first read [`AGENTS.md`](AGENTS.md), then use the index to load only the context relevant to the current task.

Current phase, accepted boundaries, and unresolved decisions are tracked in [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md).

## Local prerequisites

- Node.js `24.20.0` (the exact version is recorded in [`.nvmrc`](.nvmrc))
- npm `11.19.0`, included with that Node.js release
- Lychee `0.24.2` or another compatible `0.24.x` release for documentation-link checks

On macOS with Homebrew, install Lychee with `brew install lychee`. Use a Node version manager to select the `.nvmrc` version before installing dependencies.

## Setup and static checks

```sh
npm ci
npm run dev
```

`npm run dev` starts the local development server; it is not part of the pre-approval static-check workflow. Independently runnable static commands are:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run docs:lint
npm run links:internal
npm run check
```

`npm run check` aggregates only formatting, linting, type checking, compilation, Markdown linting, and offline internal-link validation. The optional `npm run links:external` command performs network-dependent external-link validation. No test command, lifecycle hook, or install hook is defined.

## Source boundaries

- `src/app/` contains thin App Router route and transport adapters.
- `src/features/` contains feature-owned behavior and UI.
- `src/server/` contains server-only infrastructure and repositories.
- `src/shared/` contains only demonstrated cross-feature code.

The full accepted structure and dependency rules are canonical in [`docs/architecture/local-technical-architecture.md`](docs/architecture/local-technical-architecture.md).
