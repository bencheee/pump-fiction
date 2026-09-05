# T-019 — Simplify the exercise load-mode model

- **Feature:** `F-011`
- **Status:** `Backlog`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T11:41:11+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Blocked on `T-018` delivery order; Owner confirms `Ready` when `T-018` is approved.

## Scope

Replace the current load-mode model with the model the Owner accepted on `2026-09-05`, across the database, domain, application boundary, Exercise Library UI, and canonical specification. `ADR-0023` records the decision and the criteria it changes.

Accepted model:

| Base type | Always allowed, never shown as a choice | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | The resistance band is a single optional addition |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band` | At most one of the two may be selected |
| `assisted` | none | `assistance_weight`, `assistance_band` | Exactly one of the two must be selected |

Removed entirely: the `band` base type, the `resistance_band` load mode, and the `bodyweight_assistance_band` load mode. Assistance bands remain available through the `assisted` type, which is where they belong.

The Owner accepted a clean local database reset, so the migration removes the retired enum values without converting existing rows.

## Out of scope

- Active-workout set entry, which `T-020` derives from this model
- Archiving and deletion behavior (`T-021`, `T-022`)
- Band direction and strength semantics, which stay as accepted in `MVP-EXE-005`

## Acceptance criteria

- [ ] The exercise form never renders a mode the user cannot change; a weights exercise offers only the resistance-band addition and a bodyweight exercise offers only added weight or a resistance band.
- [ ] A bodyweight exercise cannot save both added weight and a resistance band.
- [ ] An assisted exercise cannot save zero or both of assistance weight and assistance band.
- [ ] The `band` base type is not offered anywhere and no longer exists in the database.
- [ ] The database rejects every retired combination, independently of the UI.
- [ ] `MVP-EXE-001`, `MVP-EXE-003`, and `MVP-EXE-004` describe the accepted model, and `exercises.md` matches it.

## Traceability

- MVP criteria: revises `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004`; must not weaken `MVP-EXE-002`, `MVP-EXE-005`
- ADRs: creates `ADR-0023`; respects [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `T-018` for delivery order only
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: `ADR-0023`
- Documents to update: exercise product behavior, revised MVP criteria, domain model, database workflow notes, screen decisions, decisions index, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: band identity semantics, History comparison rules, programs and splits

## Execution checklist

- [ ] Record `ADR-0023` with the accepted model, the clean-reset decision, and the criteria it revises.
- [ ] Update the declarative schema: enum values, exercise and snapshot load-mode checks, and the per-exercise exclusivity rule.
- [ ] Generate the migration and regenerate database types.
- [ ] Update domain constants, validation, application operations, and presentation labels.
- [ ] Rebuild the Allowed per-set modes section of the exercise form around optional choices only.
- [ ] Extend pgTAP and unit assertions without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** exercise validation unit tests, exercise-form component tests, exercise repository integration tests, and pgTAP constraint tests for every retired and permitted combination; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-019: simplify the exercise load-mode model`
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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 2 recorded on 2026-09-05 |
