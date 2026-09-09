# ADR-0004: Local-first development before production

- **Status:** Fulfilled; production direction completed by [ADR-0031](0031-shared-password-protects-the-hosted-application.md)

## Context

This decision was made before implementation, while product behavior and technical choices were still being refined.

## Decision

Develop and run the application locally first. Production deployment begins only when the app is ready. Vercel plus Supabase was the anticipated production direction.

Keep the local logical data model compatible with a future PostgreSQL/Supabase path.

## Consequences

- MVP acceptance criteria and local architecture are decided before framework initialization.
- No production deployment is needed during the initial local phase.
- Local persistence choices must avoid data shapes that make later PostgreSQL migration needlessly difficult.
- Production authentication/protection and migration details remain explicit future decisions.
- The anticipated stack cannot be treated as accepted merely because it is documented as direction.

## Subsequent refinements

- [ADR-0017](0017-nextjs-app-router-runtime.md) accepts the framework and runtime that were still open when this decision was made.
- [ADR-0018](0018-local-supabase-postgres-and-server-data-access.md) accepts local Supabase PostgreSQL, the schema/migration workflow, and the server-only data-access boundary.
- [ADR-0031](0031-shared-password-protects-the-hosted-application.md) records the deployed Vercel/hosted-Supabase architecture and its access protection.

## Related documents

- [`../architecture/domain-model.md`](../architecture/domain-model.md)
- [`../architecture/constraints.md`](../architecture/constraints.md)
