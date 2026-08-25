# T-001 — Define and document local technical architecture

- **Feature:** [`F-001`](../features/F-001-local-technical-architecture.md)
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-25T15:43:40+02:00`
- **Updated:** `2026-08-25T16:15:43+02:00`
- **Started:** `2026-08-25T15:48:00+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not applicable unless scope changes
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Create the bootstrap delivery commit, then record its full SHA and transition to `In Review` through an evidence commit.

## Scope

Define one coherent local technical architecture package, record every accepted cross-cutting choice as an ADR, update canonical architecture/project documentation, and prepare an implementation-ready technical boundary in one delivery commit. Under the one-time [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md) bootstrap exception, this first delivery commit also establishes the complete user-approved repository documentation baseline accumulated before `T-001` existed.

## Out of scope

- Framework or application initialization
- Dependency installation
- Database creation, schema migration, or seed data
- Feature implementation
- Feature tests or manual application validation
- Deployment
- Changes to locked product behavior

## Acceptance criteria

- [x] Final framework/runtime and version policy are explicitly accepted and documented
- [x] Repository/application structure and local development workflow are explicitly accepted and documented
- [x] Local persistence, data-access layer, migration strategy, and future PostgreSQL/Supabase compatibility are explicitly accepted and documented
- [x] Active-workout auto-save and restore architecture is explicitly accepted and documented
- [x] UI/styling, charting, static-check, and future test-tool boundaries are explicitly accepted and documented
- [x] All cross-cutting decisions have ADRs and affected canonical documents are synchronized
- [x] No application code, dependencies, database, migrations, tests, or deployment artifacts are introduced
- [x] The first-commit documentation bootstrap exception and non-recursive evidence model are explicitly accepted and documented

## Traceability

- MVP criteria: [`MVP-REL-003`](../../product/mvp-acceptance-criteria.md#mvp-rel-003--persistent-canonical-history), [`MVP-REL-004`](../../product/mvp-acceptance-criteria.md#mvp-rel-004--no-silent-data-reinterpretation), [`MVP-WRK-004`](../../product/mvp-acceptance-criteria.md#mvp-wrk-004--immediate-persistence), [`MVP-WRK-005`](../../product/mvp-acceptance-criteria.md#mvp-wrk-005--restore-one-current-workout)
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0004](../../decisions/0004-local-first-development.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md)
- Canonical documents: [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../architecture/constraints.md`](../../architecture/constraints.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../PROJECT_STATE.md`](../../PROJECT_STATE.md), [`../../../PROJECT.md`](../../../PROJECT.md)

## Dependencies and blockers

- Dependencies: Locked MVP criteria and accepted project-management system
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: technical architecture document(s), new ADRs for every accepted cross-cutting choice, architecture constraints/domain model as affected, project state, this Task, parent rollups, registry, and dashboard
- Documentation that should remain unchanged: locked product behavior unless an explicit conflict is discovered and reported

## Execution checklist

- [x] Discuss and accept framework/runtime and version policy
- [x] Discuss and accept local persistence, data access, and migration path
- [x] Discuss and accept application structure and active-workout persistence approach
- [x] Discuss and accept UI/styling, charting, quality, and future test tooling
- [x] Record every cross-cutting decision in ADRs
- [x] Consolidate the canonical local architecture
- [x] Correct the commit-evidence model and document the T-001 bootstrap exception
- [x] Update project records and prepare the bootstrap documentation delivery commit

## Static-check plan and results

- Planned checks: Markdown-link validation, documentation structure review, and cross-document contradiction review after the architecture documentation is complete
- Results:
  - `2026-08-25T16:08:48+02:00` — Codex primary agent — passed — local Ruby read-only validation resolved every local path and heading anchor across 47 Markdown files
  - `2026-08-25T16:08:48+02:00` — Codex primary agent — passed — repository structure scan found no non-Markdown implementation, dependency, database, migration, test, or deployment artifacts
  - `2026-08-25T16:08:48+02:00` — Codex primary agent — passed — targeted contradiction scan found no accepted technical choice still listed as an open architecture item
  - `markdownlint-cli2` and Lychee were not locally installed and were not downloaded in this documentation-only Task; the equivalent required local-link check was performed by the read-only script above
  - `2026-08-25T16:15:43+02:00` — Codex primary agent — passed — repeated local path/anchor validation resolved all links across 48 Markdown files after ADR-0021
  - `2026-08-25T16:15:43+02:00` — Codex primary agent — passed — repeated structure and contradiction scans found no non-Markdown artifacts and no resolved workflow/technical choices left open

## Test plan and results

- **Test required:** `no`
- **No-test reason:** Documentation-only architecture Task with no executable application behavior
- **Planned tests:** None
- **Authorized commit:** Not applicable
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-001: define local technical architecture`
- **Committed scope:** Accepted documentation baseline plus local technical architecture under the one-time ADR-0021 bootstrap exception; not created yet

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
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
- [x] Scope fits one independently reviewable delivery commit under the accepted one-time bootstrap exception
- [x] Owner confirms transition to `Ready`

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Approved no-test reason is recorded
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-25T15:43:40+02:00` | Codex primary agent / Executor | — | `Backlog` | Allocated `T-001` from the accepted template |
| `2026-08-25T15:43:40+02:00` | User / Owner | `Backlog` | `Ready` | Explicitly approved creation and `Ready` status |
| `2026-08-25T15:48:00+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | User authorized starting the architecture work |
