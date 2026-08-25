# Local technical architecture

- **Status:** Accepted

This is the canonical summary of accepted local technical architecture. Each cross-cutting choice links to its ADR; undecided sections remain explicitly open.

## Accepted foundation

### Framework and runtime

- Next.js `16.x` Active LTS with App Router
- React `19.x` aligned with the chosen Next.js release
- TypeScript with strict type checking
- Node.js `24.x` LTS
- Exact compatible security-patched versions and dependency lockfile selected at implementation initialization
- Major upgrades require an explicit Task and documentation update

Canonical decision: [ADR-0017](../decisions/0017-nextjs-app-router-runtime.md).

### Persistence, schema, and data access

- Supabase CLI local stack with PostgreSQL from the first implementation phase
- Docker-compatible container runtime as a local-development prerequisite
- No hosted Supabase dependency during the local MVP
- Declarative SQL under `supabase/schemas/` as the single schema source of truth
- Reviewed, timestamped migrations under `supabase/migrations/`, versioned with the schema change
- `@supabase/supabase-js` as the initial data client, without an ORM
- TypeScript database types generated from the local schema and committed with schema changes
- All database access confined to server-only repository/service modules; no browser or Client Component database clients
- Hosted Supabase later receives the same migration history; production credentials, authentication, RLS, and access protection remain a separate pre-deployment decision

Canonical decision: [ADR-0018](../decisions/0018-local-supabase-postgres-and-server-data-access.md).

### Application structure and boundaries

- One repository and one Next.js application; no monorepo
- `npm` with committed `package-lock.json`; locked clean installs use `npm ci`
- Root configuration, `public/`, and `supabase/`; application source under `src/`
- `src/app/` for thin routing and transport adapters
- `src/features/` for feature behavior, contracts, application operations, UI, and client controllers
- `src/server/` for server-only database/repository infrastructure
- `src/shared/` only for demonstrated cross-feature UI, types, and utilities
- One root layout with nested route groups/layouts for the main mobile shell and focused workout shell
- Server Components by default; smallest practical Client Component islands for interaction and browser APIs
- Reads through query services, ordinary mutations through thin Server Actions, and active-workout commands through a dedicated `POST` Route Handler
- `server-only` enforcement around database clients, repositories, and secrets

### Active-workout durability

- PostgreSQL is authoritative for acknowledged state and enforces at most one resumable workout
- Typed commands carry unique IDs and expected workout revisions
- Pending active-workout commands are transactionally placed in a narrow IndexedDB outbox before network delivery
- FIFO delivery, transactional server application, idempotency, revision checks, and explicit acknowledgements
- Reload/reopen restores the server snapshot and replays pending commands without duplicating effects
- Conflicts never silently overwrite data; the UI exposes recoverable failure
- Visible `Saving`, `Saved`, and `Save failed` states; optimistic state is not mislabeled as durable
- IndexedDB is neither the canonical store nor general offline support
- Timer persistence records state transitions and timestamps, not one write per displayed second

Canonical decision: [ADR-0019](../decisions/0019-application-boundaries-and-active-workout-durability.md).

### Mobile UI and charting

- Tailwind CSS stable `4.x` with application-owned CSS-variable design tokens
- Phone layouts only, with adaptation among phone widths/orientations, safe-area support, accessible touch targets, visible focus, contrast, and reduced motion
- Application-owned primitives under `src/shared/ui`; semantic native HTML first
- Stable `radix-ui` adopted incrementally and wrapped only for complex accessible behaviors
- No complete styled component kit and no CSS-in-JS runtime for the MVP
- Recharts stable `3.x` in feature-owned, route-local Client Components
- Query/domain services own all calculations and return neutral serializable chart series
- Responsive charts never carry important information without a textual summary and/or accessible data list

### Quality boundaries

- Static checks: ESLint flat config with Next.js/TypeScript rules, Prettier with Tailwind ordering, `tsc --noEmit`, Next.js production build, `markdownlint-cli2`, and Lychee internal-link validation
- `npm run check` aggregates static checks only and can run before approval
- External-link validation remains a separate best-effort static check
- Future tests: Vitest, React Testing Library with `user-event`, local Supabase/PostgreSQL integration tests, and Playwright Mobile Safari/WebKit plus Mobile Chrome/Chromium
- Real-browser Playwright scenarios own IndexedDB outbox and reload/retry/conflict verification
- Test commands remain separate from checks, lifecycle scripts, hooks, and pre-approval automation
- No test or manual feature validation runs before the user approves the exact Task commit SHA

Canonical decision: [ADR-0020](../decisions/0020-mobile-ui-charting-and-quality-tooling.md).

## Explicitly deferred beyond local architecture

- Production authentication, authorization, RLS, credentials, and private-app access protection
- PWA implementation details
- Backup/export format and priority
- Product questions retained in [`PROJECT_STATE.md`](../PROJECT_STATE.md#open-questions)

Do not initialize implementation inside `T-001`. Initialization begins only through a separately ready implementation Task after this architecture commit is reviewed and approved.
