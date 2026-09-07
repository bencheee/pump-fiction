# Architecture and delivery constraints

## Current technical posture

Implementation has started through `T-005`. The locked runtime is Next.js `16.3.3` with App Router, React `19.2.8`, strict TypeScript `5.9.3`, and Node.js `24.20.0` LTS; see [ADR-0017](../decisions/0017-nextjs-app-router-runtime.md) and the exact baseline in [`local-technical-architecture.md`](local-technical-architecture.md). Local persistence uses the Supabase CLI stack and PostgreSQL, declarative SQL schemas, versioned migrations, and server-only `@supabase/supabase-js` access; see [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md). The single-app module boundaries and durable active-workout command flow are accepted in [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md). Mobile UI, charting, static checks, and future test tools are accepted in [ADR-0020](../decisions/0020-mobile-ui-charting-and-quality-tooling.md). The application was developed and run locally before the Vercel and hosted-Supabase production phase; see [ADR-0004](../decisions/0004-local-first-development.md). That phase began on `2026-09-07`: the application is deployed to Vercel against a hosted Supabase project carrying the same migration history.

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

The canonical unresolved-decision list is in [`PROJECT_STATE.md`](../PROJECT_STATE.md#open-questions). Do not select a PWA mechanism, backup format, or unresolved product capability merely to begin coding. The production protection method is no longer among them; ADR-0031 decides it.

## Documentation maintenance

- Documentation is a required part of every relevant change, as accepted by [ADR-0005](../decisions/0005-documentation-as-system-of-record.md). Follow the canonical workflow in [`development-governance.md`](../process/development-governance.md).
- Update the canonical behavior document in the same task as any behavior change.
- Record every architectural decision as an ADR; put a small non-architectural local decision in its existing canonical topic.
- An architectural change is not complete while its ADR or affected canonical documentation is missing or stale.
- Never treat an open question as an accepted decision.
- If implementation and documentation conflict, report the mismatch and resolve it explicitly rather than silently choosing one.
- Document currently agreed behavior, not speculative or aspirational features.
- Do not add features without a user decision.
- Keep one canonical home for each rule. Other documents may link to it or give a clearly attributed short summary.
- Do not erase decision history. If an accepted ADR changes, create or link the replacement and mark the old ADR `Superseded`.

## Delivery sequence

The delivery sequence is:

1. lock MVP acceptance criteria — completed;
2. define and accept the project-management system — completed;
3. decide the local technical architecture — completed;
4. initialize implementation — in progress through `T-005`.

Feature testing additionally follows the approval gate in [ADR-0006](../decisions/0006-approval-gated-feature-testing.md).

Current completion state is maintained in [`PROJECT_STATE.md`](../PROJECT_STATE.md).
