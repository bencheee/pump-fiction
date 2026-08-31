# T-007 — Build server data and application boundaries

- **Feature:** `F-004`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T15:49:04+02:00`
- **Started:** `2026-08-31T15:26:48+02:00`
- **Review started:** `2026-08-31T15:40:58+02:00`
- **Approval requested:** `2026-08-31T15:43:23+02:00`
- **Approved:** `2026-08-31T15:43:23+02:00`
- **Testing started:** `2026-08-31T15:49:04+02:00`
- **Completed:** `2026-08-31T15:49:04+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-007` is complete, and `T-008` remains in `Backlog` by explicit Owner direction.

## Scope

Implement the server-only Supabase client, repository interfaces and implementations, application command/query boundaries, shared validation/error contracts, and thin App Router mutation adapters required by later feature Tasks.

## Out of scope

- Feature-specific screen completion
- Active-workout IndexedDB outbox and FIFO command controller
- Production authentication, RLS, and hosted configuration

## Acceptance criteria

- [x] Browser and Client Component code cannot import database clients, row types, repositories, or secrets.
- [x] Data flow follows route adapter → application service → repository → Supabase.
- [x] Ordinary mutations are transactional where required and expose the accepted generic failure/retry contract.
- [x] Domain-shaped serializable results shield UI code from Supabase query builders and database row types.

## Traceability

- MVP criteria: foundational support for `MVP-REL-001`–`004`
- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md)

## Dependencies and blockers

- Dependencies: `T-006` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: application-boundary guidance, this Task, and project projections
- Documentation that should remain unchanged: feature UX and visual design

## Execution checklist

- [x] Implement server-only client and import guards.
- [x] Define application/repository contracts and error mapping.
- [x] Add thin mutation/query adapters without feature UI.
- [x] Prepare boundary and repository tests without executing before approval.

## Static-check plan and results

- Planned checks: ESLint dependency boundaries, strict TypeScript, production build, formatting, documentation links, `git diff --check`
- Results: Passed on 2026-08-31 with Node.js `24.20.0`: `npm run check` passed Prettier, ESLint dependency boundaries, strict TypeScript, the Next.js production build without database environment variables, Markdown lint across 77 files, and all 539 internal links; `git diff --check` passed. No unit or repository integration tests ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run `npm run test:unit`; start/reset local Supabase, export the local `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and run `npm run test:repository` against the migration-owned settings singleton.
- **Authorized commit:** `14d97227734c812d8b0cd875c372b1ffa0ebdea0`
- **Results:** Passed against exact approved delivery `14d97227734c812d8b0cd875c372b1ffa0ebdea0` on 2026-08-31 with Node.js `24.20.0`, Vitest `4.1.11`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: `npm run test:unit` passed 3/3 validation, domain-result, and generic-retry assertions; a clean local database reset succeeded; `npm run test:repository` passed 1/1 real Data API read/idempotent-update integration assertion. Vitest emitted a forward-looking warning about a planned future native config loader, but the locked version loaded the configuration and both suites passed.

## Delivery commit

- **Delivery commit SHA:** `14d97227734c812d8b0cd875c372b1ffa0ebdea0`
- **Subject:** `T-007: build server data boundaries`
- **Committed scope:** Server-only environment/client infrastructure; import enforcement; serializable operation/error contracts; app-settings repository, query, mutation, composition, and thin Server Action vertical slice; Vitest `4.1.11` setup with unexecuted unit and repository integration tests; canonical server-boundary guidance and synchronized project records.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-08-31T15:43:23+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `14d97227734c812d8b0cd875c372b1ffa0ebdea0`
- **Approved by:** User
- **Approved at:** `2026-08-31T15:43:23+02:00`
- **Approval note:** User explicitly reviewed and approved the exact delivery commit, authorizing only the recorded `T-007` tests and directing that `T-008` must not start.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready`

## Definition of Done

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Establish accepted server and application boundaries before feature delivery |
| `2026-08-31T15:26:48+02:00` | User / Owner | `Backlog` | `Ready` | Approved the completed `T-006` dependency after the prior instruction to continue directly through implementation |
| `2026-08-31T15:26:48+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began accepted boundary review and server data-layer implementation |
| `2026-08-31T15:40:58+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery commit `14d97227734c812d8b0cd875c372b1ffa0ebdea0`; all planned static checks passed and prepared feature tests were not run |
| `2026-08-31T15:43:23+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `14d97227734c812d8b0cd875c372b1ffa0ebdea0` with no findings and recommended approval |
| `2026-08-31T15:43:23+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved the exact delivery and authorized only its recorded tests; explicitly directed that `T-008` not start |
| `2026-08-31T15:49:04+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began unit and local repository verification in an isolated worktree at exact delivery `14d97227734c812d8b0cd875c372b1ffa0ebdea0` |
| `2026-08-31T15:49:04+02:00` | Codex primary agent / Tester | `Testing` | `Done` | Unit tests passed 3/3, clean database reset passed, and real repository integration passed 1/1; `T-008` remains unstarted |
