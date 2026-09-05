# T-020 — Derive per-set load from the exercise definition

- **Feature:** `F-011`
- **Status:** `Backlog`
- **Horizon:** `Now`
- **Order:** 3
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
- **Next action:** Owner confirms `Ready` after `T-019` is approved.

## Scope

Remove the per-set load-mode dropdown from the active workout. Each set renders the fields of its exercise's base mode. When the snapshot permits the one optional modifier, the set offers a small explicit control to apply it, and the applied modifier is the one the exercise defines rather than a menu of choices.

Rendered behavior per snapshotted base type:

| Base type | Set fields | Optional control |
| --- | --- | --- |
| `weights` | kg and reps | `Add resistance band` when the snapshot permits it |
| `bodyweight` | reps | `Add weight` or `Add resistance` according to the snapshot's single permitted modifier |
| `assisted` | assistance kg and reps, or band strength and reps | None; the definition already fixed the single mode |

Applying a modifier switches only that set to the permitted mode and can be undone, returning the set to its base mode and clearing values that do not carry over.

## Out of scope

- The exercise definition model itself, delivered by `T-019`
- Set validation, confirmation, and durability rules, which stay as accepted
- Other active-workout screen corrections, delivered by `T-023`

## Acceptance criteria

- [ ] No set row renders a load-mode dropdown or mode sheet.
- [ ] A weights set shows kg and reps, plus the resistance-band control only when the snapshot permits it.
- [ ] A bodyweight set shows reps, plus a single control that applies exactly the modifier its snapshot permits.
- [ ] An assisted set shows only the fields of its single defined mode.
- [ ] Applying and removing a modifier updates only that set, keeps reps, clears fields that do not carry over, and returns the set to unconfirmed.
- [ ] `MVP-WRK-003` and `workouts.md` describe set entry as definition-derived.

## Traceability

- MVP criteria: revises the control wording of `MVP-WRK-003`; must not weaken `MVP-WRK-004`, `MVP-EXE-005`
- ADRs: `ADR-0023` from `T-019`; [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `T-019` must be `Done`
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: workout set-entry behavior, the revised criterion, active-workout screen decisions, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: durability commands, snapshot model, History eligibility

## Execution checklist

- [ ] Replace the set-row mode sheet with base-mode fields plus the optional modifier control.
- [ ] Keep the existing `update_set` command contract; only the control that selects the mode changes.
- [ ] Update active-workout component tests without running them.
- [ ] Synchronize canonical documentation and project-management projections.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** active-workout component scenarios for each base type, including applying and undoing a modifier; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-020: derive per-set load from the exercise definition`
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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 7 recorded on 2026-09-05 |
