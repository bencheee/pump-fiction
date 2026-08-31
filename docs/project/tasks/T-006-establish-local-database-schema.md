# T-006 — Establish local database schema and generated types

- **Feature:** `F-004`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T14:19:48+02:00`
- **Started:** `2026-08-31T14:19:48+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Read the accepted domain and persistence specifications, then translate them into the declarative local schema and baseline migration without running database-backed tests.

## Scope

Create the declarative local Supabase/PostgreSQL schema, reviewed baseline migration, constraints, seed-independent generated TypeScript database types, and local schema workflow for the accepted MVP domain.

## Out of scope

- Repository/query implementations and UI behavior
- Hosted Supabase, production credentials, authentication, RLS, or deployment
- Derived aggregate tables not accepted by the domain model

## Acceptance criteria

- [ ] Declarative SQL models all accepted persistent entities with database-generated UUID identities and required invariants.
- [ ] A reviewed versioned migration corresponds to the declarative schema.
- [ ] Generated TypeScript database types match the schema and are committed.
- [ ] Local schema/setup commands are documented without making live Studio edits canonical.

## Traceability

- MVP criteria: `MVP-REL-001`, `MVP-REL-002`
- ADRs: [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md)

## Dependencies and blockers

- Dependencies: `T-005` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: local database setup/schema workflow, this Task, and project projections
- Documentation that should remain unchanged: visual design and product behavior

## Execution checklist

- [ ] Translate the logical model into one declarative SQL schema.
- [ ] Generate and review the baseline migration.
- [ ] Generate database types and document the repeatable workflow.
- [ ] Prepare integration tests without running them before approval.

## Static-check plan and results

- Planned checks: SQL formatting/static inspection, generated-type diff, TypeScript check, documentation links, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After exact-commit approval, apply/reset the local schema and verify constraints and generated-type compatibility against local Supabase.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-006: establish local database schema`
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
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready`

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
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Required database foundation after runtime initialization |
| `2026-08-31T14:19:48+02:00` | User / Owner | `Backlog` | `Ready` | Approved exact `T-005` delivery after the prior instruction to continue directly into implementation |
| `2026-08-31T14:19:48+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began accepted-domain review and declarative schema implementation |
