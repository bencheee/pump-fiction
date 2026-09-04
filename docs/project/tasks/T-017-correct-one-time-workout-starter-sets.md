# T-017 — Correct one-time workout starter sets

- **Feature:** `F-007`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-04T09:00:13+02:00`
- **Updated:** `2026-09-04T09:06:26+02:00`
- **Started:** `2026-09-04T09:00:13+02:00`
- **Review started:** `2026-09-04T09:06:26+02:00`
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** User reviews exact correction `8d5779258505bb94383368e13eff97a4346320ca`; regression tests remain prohibited until explicit approval.

## Scope

Correct `start_workout(...)` so each exercise selected for a one-time workout receives exactly one empty workout-local starter set row without a prescription. Synchronize canonical workout/domain documentation with accepted handoff decision `OD-001` and add focused approval-gated regression coverage.

## Out of scope

- Split-workout planned set creation
- Today, one-time builder, or active-workout UI
- Any other workout behavior or historical correction

## Acceptance criteria

- [x] Every selected one-time exercise atomically receives exactly one empty set row at position 1.
- [x] The starter row has no prescription semantics and remains fully workout-local.
- [x] Split workouts continue to receive exactly their prescribed set count.
- [x] Canonical product and domain documentation explicitly records accepted OD-001 behavior.

## Traceability

- MVP criteria: supporting `MVP-TOD-003`, `MVP-WRK-001`–`002`
- Decisions: accepted external-handoff `OD-001`, identified by the [frozen handoff manifest](../../design/T-004-v0.4-frozen/README.md); [ADR-0002](../../decisions/0002-template-snapshot-history-model.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-014` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: workout behavior, domain snapshot guidance, durability guidance, this Task, parent Feature, registry, dashboard, milestone, and project-state projections
- Documentation that should remain unchanged: split prescription behavior, History, weight/body, and UI design

## Execution checklist

- [x] Add one empty starter set per one-time workout exercise in the atomic start transaction.
- [x] Extend pgTAP and repository integration assertions without running them.
- [x] Synchronize canonical behavior and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Passed on 2026-09-04 with Node.js `24.20.0`, npm `11.19.0`, Supabase CLI `2.116.0`, and local PostgreSQL `17`: `npm run check` passed formatting, ESLint, strict TypeScript, the 13-route production build, asset checksums, Markdown lint across 87 files, and all 650 internal links. The focused migration applied locally; generated public types remained unchanged; database lint reported no errors; strict declarative convergence found no schema changes; and `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, clean-reset the exact delivery and run focused pgTAP plus real repository integration proving one empty starter set per selected one-time exercise and unchanged split prescription counts.
- **Authorized commit:** None
- **Results:** Not run; approval required.

## Delivery commit

- **Delivery commit SHA:** `8d5779258505bb94383368e13eff97a4346320ca`
- **Subject:** `T-017: correct one-time workout starter sets`
- **Committed scope:** Add exactly one empty workout-local starter set for every selected one-time exercise; synchronize workout/domain/durability documentation; add the focused migration and unexecuted pgTAP/repository regression assertions; record the required F-007 Task dependency.

## Review

- **Reviewer:** User
- **Reviewed at:** Pending
- **Outcome:** Pending
- **Findings:** Pending

## Approval

- **Approved commit:** Pending
- **Approved by:** Pending
- **Approved at:** Pending
- **Approval note:** Pending

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner's continuation direction and prior OD-001 confirmation establish readiness

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required decisions are current
- [ ] Authorized feature tests passed
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Isolate the accepted OD-001 behavior omitted from canonical workout documentation and T-014 implementation |
| `2026-09-04T09:00:13+02:00` | User / Owner | `Backlog` | `Ready` | Prior OD-001 confirmation plus the explicit direction to continue makes the correction ready |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the narrow behavior and documentation correction before T-015 |
| `2026-09-04T09:05:38+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed the starter-row correction, canonical documentation, migration, and unexecuted regression assertions; all static checks passed |
| `2026-09-04T09:06:26+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created exact correction `8d5779258505bb94383368e13eff97a4346320ca`; static checks passed and regression tests remain unexecuted |
