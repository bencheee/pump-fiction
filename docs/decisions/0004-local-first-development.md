# ADR-0004: Local-first development before production

- **Status:** Accepted

## Context

The product behavior is still being refined and implementation has not begun. Selecting and deploying the complete production architecture now would prematurely lock unresolved technical choices.

## Decision

Develop and run the application locally first. Production deployment begins only when the app is ready. Vercel plus Supabase is the anticipated production direction, not a fully selected implementation stack.

Keep the local logical data model compatible with a future PostgreSQL/Supabase path. React/Next.js is likely but remains undecided, as do the local database, data-access layer, and development workflow.

## Consequences

- MVP acceptance criteria and local architecture are decided before framework initialization.
- No production deployment is needed during the initial local phase.
- Local persistence choices must avoid data shapes that make later PostgreSQL migration needlessly difficult.
- Production authentication/protection and migration details remain explicit future decisions.
- The anticipated stack cannot be treated as accepted merely because it is documented as direction.

## Subsequent refinements

- [ADR-0017](0017-nextjs-app-router-runtime.md) accepts the framework and runtime that were still open when this decision was made.
- [ADR-0018](0018-local-supabase-postgres-and-server-data-access.md) accepts local Supabase PostgreSQL, the schema/migration workflow, and the server-only data-access boundary. Production authentication and protection remain open.

## Related documents

- [`../architecture/constraints.md`](../architecture/constraints.md)
- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../PROJECT_STATE.md`](../PROJECT_STATE.md)
