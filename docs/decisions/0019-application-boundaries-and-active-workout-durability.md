# ADR-0019: Application boundaries and active-workout durability

- **Status:** Accepted

## Context

The Next.js App Router application needs a predictable structure that keeps routing, UI interaction, business rules, and persistence separate without monorepo overhead. The active-workout screen is unusually mutation-heavy and must preserve confirmed sets, edits, ordering, notes, and timer state across reloads or mobile-browser interruption.

PostgreSQL is the canonical store, but relying only on an in-flight network request can lose the most recent browser edit if the page is suspended or closed before the server acknowledges it. Conversely, introducing a general offline-first replica would exceed the accepted MVP scope. The architecture therefore needs a narrow durability mechanism for pending active-workout changes.

## Decision

### Repository and package management

Use one repository containing one Next.js application; do not introduce a monorepo or workspace split. Use `npm` as the package manager and commit `package-lock.json`. Clean and automated installs use the locked dependency graph through `npm ci`.

Keep configuration, `public/`, and `supabase/` at the repository root. Put application source under `src/` with these top-level responsibilities:

- `src/app/` — App Router routes, layouts, loading/error boundaries, Server Action adapters, and Route Handlers; keep this layer thin;
- `src/features/` — feature-specific domain logic, validation contracts, application operations, interactive UI, and client controllers;
- `src/server/` — server-only Supabase client construction, repository implementations, and cross-feature server infrastructure;
- `src/shared/` — genuinely shared UI primitives, types, and utilities that do not belong to one feature.

Do not add a shared abstraction pre-emptively. Move code to `shared` only after it has a demonstrated cross-feature responsibility.

Use one root layout. Organize the four-destination mobile shell and focused active-workout shell with nested App Router route groups/layouts so the grouping does not alter URLs and navigation does not require separate root layouts.

### Server and client boundaries

Pages and layouts are Server Components by default. They read through application query services and pass serializable, domain-shaped view data into the smallest practical Client Component islands.

Use Client Components only where state, event handlers, browser APIs, drag-and-drop, live timer display, or other direct interaction requires them. A `use client` module must not import the Supabase client, repositories, server secrets, or generated database row types.

Mark database and repository modules with the `server-only` boundary. Data flows through this dependency path:

`route adapter → application command/query service → repository → Supabase`

Keep validation and business rules in application/domain modules so a Server Action and a Route Handler cannot implement different behavior.

Use thin Server Actions for ordinary first-party form mutations. Use a dedicated `POST` Route Handler for active-workout auto-save commands because its client controller needs explicit FIFO ordering, retry, idempotency keys, acknowledgement data, and conflict responses. Neither adapter contains database queries or domain behavior itself.

### Active-workout durability

PostgreSQL remains authoritative for acknowledged workout state. Enforce at the database level that at most one resumable active or paused workout exists.

Each active-workout change is represented as a typed command containing at least a unique command ID, workout ID, expected workout revision, operation, payload, and client creation time. Discrete actions such as confirming a set, reordering, adding/removing, changing mode, and timer transitions enqueue immediately.

Before sending a command, persist it transactionally in a narrow browser IndexedDB outbox. The client controller then sends pending commands to the Route Handler in FIFO order. The server validates and applies each command in a PostgreSQL transaction, records or otherwise enforces command-ID idempotency, checks the expected revision, and returns the resulting revision. Only a successful acknowledgement removes the command from the outbox.

The interactive UI may update optimistically, but it must expose `Saving`, `Saved`, and `Save failed` states. It must never present an unacknowledged or failed mutation as durably saved.

On load or reopen, fetch the canonical current workout from the server, load pending commands from the outbox, and replay them in order. Duplicate delivery must not duplicate effects. A revision conflict must stop automatic overwrite, refresh authoritative state, and present a recoverable error instead of silently discarding either version.

IndexedDB stores pending active-workout commands only. It is not the canonical workout database, a general application cache, or a promise that the entire application works offline. General offline behavior remains out of scope unless separately accepted.

Persist timer transitions, not per-second ticks. Store accumulated active duration and the current active-segment start timestamp as already required by the domain model; calculate the live display from those values. Start, pause, continue, finish, and incomplete-completion commands use the same transactional mutation path as other workout changes.

## Consequences

- The repository remains easy to navigate without adding package/workspace coordination.
- Route files compose behavior but do not become a second business-logic layer.
- Server-only imports make accidental browser exposure of database code and secrets fail early.
- Ordinary mutations retain App Router's native Server Action model, while the high-frequency workout flow has explicit transport semantics.
- A persisted outbox protects changes that were created before a browser suspension or network interruption, without making browser storage authoritative.
- Command IDs and revisions add schema and implementation complexity, but provide deterministic retries and prevent silent overwrite or duplicate effects.
- Multi-tab conflicts are detected through revisions even though simultaneous multi-tab editing is not a supported workflow.
- The app does not claim general offline support; non-workout reads and starting a fresh session may still require the server.
- Exact input coalescing rules and save-status presentation may be local implementation details, but they cannot weaken immediate persistence or the acknowledgement semantics above.

## Related documents

- [`../architecture/local-technical-architecture.md`](../architecture/local-technical-architecture.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../product/workouts.md`](../product/workouts.md)
- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../project/tasks/T-001-define-local-technical-architecture.md`](../project/tasks/T-001-define-local-technical-architecture.md)
- [`0017-nextjs-app-router-runtime.md`](0017-nextjs-app-router-runtime.md)
- [`0018-local-supabase-postgres-and-server-data-access.md`](0018-local-supabase-postgres-and-server-data-access.md)

## Official references

- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js data mutations](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [npm clean installs](https://docs.npmjs.com/cli/commands/npm-ci/)
- [MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
