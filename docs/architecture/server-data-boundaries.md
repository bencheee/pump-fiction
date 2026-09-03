# Server data and application boundaries

- **Status:** Implemented foundation

This document records the concrete `T-007` boundary implementation under the accepted architecture in [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md) and [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md).

## Dependency direction

Data flows in one direction:

`App Router adapter → application operation → repository contract → server repository → Supabase`

- `src/app/` contains thin Server Action, Route Handler, page, and layout adapters. Adapters parse transport input and call an application operation; they do not query Supabase or implement business rules.
- `src/features/` owns domain-shaped serializable models, repository contracts, validation, and application operations. Feature code cannot import `src/server/`.
- `src/server/` owns environment access, the typed Supabase client, repository implementations, and composition functions. Every server entry imports `server-only`.
- `src/shared/application/operation-result.ts` is the client-safe success/failure envelope used across adapter boundaries. It never contains a Supabase client, query builder, generated row type, secret, or raw persistence error.

ESLint rejects imports of `src/server/database/` from app, feature, and shared code. The broader feature-to-server restriction and `server-only` poison package prevent browser and Client Component dependency paths from reaching database clients, repositories, or secrets. Server adapters import only server composition functions and serializable contracts.

## Server environment

Copy [`.env.example`](../../.env.example) to `.env.local` and populate the local service-role key from the local Supabase status output. The committed example contains no credential.

```sh
npm run db:start
npm exec supabase status -o env
```

The server client reads only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Both are validated lazily when a server operation first needs the database, so static builds do not require a running local stack or credentials. The service-role key must never use a `NEXT_PUBLIC_` name.

## Contracts and failure behavior

Repository interfaces return feature-owned domain shapes. Supabase implementations alone map generated database rows into those shapes. The initial `app_settings` vertical slice demonstrates both a query and an ordinary mutation without claiming a user-facing Settings feature.

Application operations validate input before persistence and return a serializable `OperationResult<T>`:

- validation and missing-record failures are not retryable;
- conflicts tell the caller to refresh and retry;
- database/network failures expose only the generic retryable load/save message;
- raw PostgREST error messages and database row types never cross into UI code.

The singleton time-zone update is one atomic PostgreSQL statement. A later feature operation that writes multiple rows must expose one repository method backed by one transactional database function; route adapters must never coordinate partial writes.

`T-008` adds the first dedicated active-workout Route Handler and transactional multi-table command function without changing this dependency direction. Its specialized acknowledgement, retry, and conflict contract is canonical in [`active-workout-durability.md`](active-workout-durability.md).

`T-010` applies the same ordinary-operation boundary to the Exercise Library. Feature-owned validation and repository contracts live under `src/features/exercises`; server composition and the Supabase implementation remain under `src/server`; thin Server Actions expose only serializable inputs and `OperationResult` values. Creating or editing a definition and its allowed-mode rows uses one PostgreSQL function so partial definitions cannot be acknowledged. Queries hydrate neutral exercise shapes with explicit modes and split-usage counts without leaking generated row types.

`T-012` applies the ordinary-operation boundary to Programs and Splits under `src/features/programs`. Program and split queries hydrate neutral ordered aggregates, while server-only composition and Supabase row/RPC handling remain under `src/server`. Multi-row lifecycle, prescription, reorder, pointer, archival-successor, and proposed-completion rotation changes cross one repository call and one PostgreSQL transaction. Thin Server Actions expose only validated serializable inputs and `OperationResult` values; the rotation-advance operation remains server-only for the later workout-finish transaction.

`T-014` adds feature-owned Today/current-workout aggregates and start validation under `src/features/active-workout`. Read functions return nested JSON that the server repository exposes only as domain shapes. The thin start Server Action calls one transactional snapshot function. All in-session edits and terminal outcomes continue through the dedicated command Route Handler, and raw PostgreSQL failures remain mapped to validation, not-found, conflict, retry, or acknowledgement contracts.

## Approval-gated verification

Vitest is configured for Node-based application tests. Prepared tests are separate from `npm run check` and must not run before approval of the exact delivery commit.

```sh
npm run test:unit
npm run db:start
# Export SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from `supabase status -o env`.
npm run test:repository
```

The repository test reads the migration-owned singleton and performs an idempotent update to its current time zone. Start from a clean local database when executing the approved integration test.
