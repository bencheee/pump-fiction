# T-007 — Build server data and application boundaries

- **Feature:** `F-004`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 3
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T11:43:22+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for the approved schema and generated types from `T-006`.

## Scope

Implement the server-only Supabase client, repository interfaces and implementations, application command/query boundaries, shared validation/error contracts, and thin App Router mutation adapters required by later feature Tasks.

## Out of scope

- Feature-specific screen completion
- Active-workout IndexedDB outbox and FIFO command controller
- Production authentication, RLS, and hosted configuration

## Acceptance criteria

- [ ] Browser and Client Component code cannot import database clients, row types, repositories, or secrets.
- [ ] Data flow follows route adapter → application service → repository → Supabase.
- [ ] Ordinary mutations are transactional where required and expose the accepted generic failure/retry contract.
- [ ] Domain-shaped serializable results shield UI code from Supabase query builders and database row types.

## Traceability

- MVP criteria: foundational support for `MVP-REL-001`–`004`
- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md)

## Dependencies and blockers

- Dependencies: `T-006` Done
- Blockers: Dependency not complete
- Blocked from status: Not blocked; remains planned in `Backlog`

## Documentation impact

- Documents to create or update: application-boundary guidance, this Task, and project projections
- Documentation that should remain unchanged: feature UX and visual design

## Execution checklist

- [ ] Implement server-only client and import guards.
- [ ] Define application/repository contracts and error mapping.
- [ ] Add thin mutation/query adapters without feature UI.
- [ ] Prepare boundary and repository tests without executing before approval.

## Static-check plan and results

- Planned checks: ESLint dependency boundaries, strict TypeScript, production build, formatting, documentation links, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run server boundary/unit tests and local database repository integration tests for the delivered infrastructure.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-007: build server data boundaries`
- **Committed scope:** Not created

## Review

- **Reviewer:** User
- **Reviewed at:** Not reviewed
- **Outcome:** Not reviewed
- **Findings:** None recorded

## Approval

- **Approved commit:** Not approved
- **Approved by:** Not approved
- **Approved at:** Not approved
- **Approval note:** Not approved

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [ ] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [ ] Owner confirms transition to `Ready`

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Authorized feature tests passed
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Establish accepted server and application boundaries before feature delivery |
