# Architecture constraints

## Current technical posture

The runtime is Next.js `16.3.3` with App Router, React `19.2.8`, strict TypeScript `5.9.3`, and Node.js `24.20.0` LTS; see [ADR-0017](../decisions/0017-nextjs-app-router-runtime.md) and the exact baseline in [`local-technical-architecture.md`](local-technical-architecture.md). Persistence uses Supabase PostgreSQL, declarative SQL schemas, versioned migrations, and server-only `@supabase/supabase-js` access; see [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md). The single-app module boundaries and durable active-workout command flow are defined in [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md). Mobile UI, charting, and quality tooling are defined in [ADR-0020](../decisions/0020-mobile-ui-charting-and-quality-tooling.md). The application is deployed to Vercel against a hosted Supabase project carrying the same migration history as local development.

The local data model and workflow use PostgreSQL semantics and the same versioned migration history the hosted project runs. Private-app protection is decided by [ADR-0031](../decisions/0031-shared-password-protects-the-hosted-application.md): one shared password gates the hosted application, and the hosted database is closed by table and function grants rather than by Row Level Security, so the public API keys are refused everywhere. There is no authentication or authorization beyond that gate, because there is no user record to authorize; see [ADR-0001](../decisions/0001-private-mobile-only-app.md). Credentials live only in the Vercel project environment and in ignored local files.

## Product-driven constraints

- Single-user and private; no local-phase account or login system.
- Phone-only UI; no desktop design requirement.
- One resumable active workout at a time.
- Active workout data and timer state survive reload/reopen.
- Acknowledged workout state is canonical in PostgreSQL; pending browser commands are temporary durability records, not a second authoritative history.
- Client code cannot import the Supabase client, repositories, database row types, or server secrets.
- Template edits never rewrite workout snapshots.
- Historical edits recalculate derived statistics without changing rotation.
- Band direction and strength remain explicit and are not converted to kilograms.
- Local calendar rules use the configured time zone.

## Decisions intentionally deferred

PWA details, backup/export UX and format, estimated 1RM, RIR/RPE, a rest timer, warm-up sets, accidental-workout-closure protection, and the final application name are undecided. Do not introduce them without an explicit product decision. The production protection method is decided by ADR-0031.

## Documentation maintenance

- Update the canonical behavior document in the same change as any behavior change.
- Record every architectural decision as an ADR; put a small non-architectural local decision in its existing canonical topic.
- An architectural change is not complete while its ADR or affected canonical documentation is missing or stale.
- Never treat an open question as an accepted decision.
- If implementation and documentation conflict, report the mismatch and resolve it explicitly rather than silently choosing one.
- Document currently agreed behavior, not speculative or aspirational features.
- Do not add features without a user decision.
- Keep one canonical home for each rule. Other documents may link to it or give a clearly attributed short summary.
- Do not erase decision history. If an accepted ADR changes, create or link the replacement and mark the old ADR `Superseded`.
