# T-028 — Merge assisted exercises into bodyweight options

- **Feature:** `F-014`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:28:05+02:00`
- **Updated:** `2026-09-05T20:24:07+02:00`
- **Started:** `2026-09-05T20:24:07+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Owner confirms the transition to `Ready` when `F-013` is delivered.

## Scope

Reduce the exercise types to `weights` and `bodyweight`, and express assistance as a bodyweight option instead of a separate type.

| Base type | Implied mode | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | Unchanged |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band`, `assistance_weight`, `assistance_band` | At most one, as the Owner accepted on `2026-09-05` |

The `assisted` base type disappears. The two assistance modes keep their identity, their values, and their statistics meaning; only the type that offers them changes. Assistance stays a positive value and is never negative weight, so `MVP-EXE-005` and the History comparison rules are untouched.

The local database holds no rows after the `2026-09-05` verification reset, so the migration removes the retired type without converting data.

## Out of scope

- Set confirmation, delivered by `T-029`
- Band direction and strength semantics
- History and statistics screens

## Acceptance criteria

- [ ] The library offers exactly two types, and no screen mentions an assisted type.
- [ ] A bodyweight exercise offers the four options and can save at most one of them.
- [ ] An assistance option produces the same set fields it produces today: assistance kilograms and reps, or assistance-band strength and reps.
- [ ] The database rejects the retired type and any second option, independently of the UI.
- [ ] `MVP-EXE-001`, `MVP-EXE-003`, and `MVP-EXE-004` describe the two-type model, and `exercises.md` matches it.

## Traceability

- MVP criteria: revises `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004`; must not weaken `MVP-EXE-002`, `MVP-EXE-005`
- ADRs: creates one superseding the type table in [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md); respects [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `F-013` delivers first by the Owner's chosen order
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: the superseding ADR
- Documents to update: exercise product behavior, revised MVP criteria, workout set-entry examples, domain model, screen decisions, decisions index, this Task, `F-014`, registry, dashboard, and project state
- Documentation that should remain unchanged: band identity, History comparison rules, programs and splits

## Execution checklist

- [ ] Record the superseding ADR with the two-type table and the single-option rule.
- [ ] Update the declarative schema: the base-type enum, the exercise and snapshot mode checks, and the definition trigger.
- [ ] Generate the migration and regenerate database types.
- [ ] Update domain constants, validation, and presentation labels, including `Assist with weight` and `Assist with band`.
- [ ] Update the exercise form and every type-dependent screen.
- [ ] Extend pgTAP, unit, and component assertions without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** exercise validation unit tests, exercise-form component tests for the two types and the four options, repository integration tests, and pgTAP constraint tests for the retired type and the single-option rule; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-028: merge assisted exercises into bodyweight options`
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
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
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
| `2026-09-05T19:28:05+02:00` | User / Owner | None | `Backlog` | Requested two exercise types with assistance offered under bodyweight |
| `2026-09-05T20:24:07+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed readiness after `F-013` was delivered and confirmed |
| `2026-09-05T20:24:07+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the exercise-type merge |
