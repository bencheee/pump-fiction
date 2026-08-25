# ADR-0018: Local Supabase Postgres and server-only data access

- **Status:** Accepted

## Context

The local MVP needs durable relational persistence for a snapshot-heavy domain model, immediate workout saves, transactions, constraints, and derived historical queries. The local architecture must avoid a later database-engine migration when the application moves toward the anticipated hosted Supabase production environment.

The project also needs one authoritative schema representation. Adding an ORM-managed schema beside a Supabase-managed SQL schema would create two sources of truth, while adopting a release-candidate ORM would add unnecessary foundational risk. Production authentication and access protection are intentionally deferred and must not be inferred from the local setup.

## Decision

Use the Supabase CLI local stack and its PostgreSQL database from the first implementation phase. A Docker-compatible container runtime is a local-development prerequisite. Local data remains local; no hosted Supabase project is required during the local MVP.

Use Supabase declarative SQL files under `supabase/schemas/` as the single source of truth for database structure. Generate timestamped SQL migrations under `supabase/migrations/` with the Supabase CLI, review every generated migration, and version the schema and migration together. Do not treat changes made directly through Supabase Studio, a SQL editor, or a live database as canonical schema changes.

Use `@supabase/supabase-js` as the initial database-access client and generate its TypeScript database types from the local schema. Do not add an ORM or a second schema definition for the MVP. Exact stable, security-patched package and CLI versions are selected and locked during implementation initialization.

All application database access is server-only and passes through repository/service modules owned by the application. Client Components and browser code do not instantiate a database client or query Supabase directly. UI code consumes application operations and domain-shaped results rather than Supabase query builders or generated row types.

The local server may use local Supabase credentials that never enter browser bundles. Production credentials, authentication, authorization, Row Level Security, and private-app protection require an explicit pre-deployment decision; local privilege choices do not silently become the production security model.

When production is approved, provision hosted Supabase PostgreSQL, link it explicitly, preview pending migrations, and apply the same versioned migration history. The database engine, schema authority, application data boundary, and query API therefore remain unchanged; environment configuration and the separately accepted production-access model change.

## Consequences

- Local development exercises the same PostgreSQL semantics intended for production instead of relying on SQLite or an in-memory substitute.
- Moving to hosted Supabase does not require a logical data migration caused by changing database engines.
- Schema review remains SQL-visible and auditable, with one canonical declarative representation and an ordered deployment history.
- The full local Supabase stack costs more startup time and requires a Docker-compatible runtime.
- Avoiding an ORM reduces dependencies and schema duplication, but complex queries may require explicit SQL or Supabase query composition inside the repository layer.
- Generated TypeScript database types must be refreshed whenever the schema changes and committed with the same Task.
- Server-only repositories isolate the UI from future authentication, RLS, connection, or data-client changes.
- Schema application/reset and database-backed verification remain subject to the project's commit-approval testing gate when performed as feature verification.

## Related documents

- [`../architecture/local-technical-architecture.md`](../architecture/local-technical-architecture.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../project/tasks/T-001-define-local-technical-architecture.md`](../project/tasks/T-001-define-local-technical-architecture.md)
- [`0004-local-first-development.md`](0004-local-first-development.md)
- [`0006-approval-gated-feature-testing.md`](0006-approval-gated-feature-testing.md)

## Official references

- [Supabase local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase declarative database schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Supabase database migrations](https://supabase.com/docs/guides/local-development/database-migrations)
- [Generating TypeScript types](https://supabase.com/docs/guides/api/rest/generating-types)
