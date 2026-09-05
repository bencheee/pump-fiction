# T-020 — Derive per-set load from the exercise definition

- **Feature:** `F-011`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 3
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T12:39:28+02:00`
- **Started:** `2026-09-05T12:33:15+02:00`
- **Review started:** `2026-09-05T12:36:44+02:00`
- **Approval requested:** `2026-09-05T12:39:15+02:00`
- **Approved:** `2026-09-05T12:39:15+02:00`
- **Testing started:** `2026-09-05T12:39:15+02:00`
- **Completed:** `2026-09-05T12:39:28+02:00`
- **Canceled:** Not reached
- **Next action:** None; Task complete. Continue `F-011` with `T-021`.

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

- [x] No set row renders a load-mode dropdown or mode sheet.
- [x] A weights set shows kg and reps, plus the resistance-band control only when the snapshot permits it.
- [x] A bodyweight set shows reps, plus a single control that applies exactly the modifier its snapshot permits.
- [x] An assisted set shows only the fields of its single defined mode.
- [x] Applying and removing a modifier updates only that set, keeps reps, clears fields that do not carry over, and returns the set to unconfirmed.
- [x] `MVP-WRK-003` and `workouts.md` describe set entry as definition-derived.

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

- [x] Replace the set-row mode sheet with base-mode fields plus the optional modifier control.
- [x] Keep the existing `update_set` command contract; only the control that selects the mode changes.
- [x] Update active-workout component tests without running them.
- [x] Synchronize canonical documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Passed on `2026-09-05T12:36:27+02:00` with Node.js `24.20.0` and npm `11.19.0`. `npm run check` passed Prettier, ESLint, strict TypeScript, the 19-route production build, UI asset checksums, Markdown lint across 96 files, and all 731 internal links. `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** active-workout component scenarios for each base type, including applying and undoing a modifier; must not run before Owner approval of the exact commit
- **Authorized commit:** `c48cbdcaf0bc348888ef2e1eff7193269a6f049c`
- **Results:** Passed against exact approved commit `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` on `2026-09-05T12:39:28+02:00` with Node.js `24.20.0`, npm `11.19.0`, and Vitest `4.1.11`. The unit and component suites passed 64/64 across 13 files and the shared UI suites passed 4/4. The active-workout scenarios cover the absent mode control, removing the addition from a bodyweight set while keeping its reps and naming the cleared field, applying the addition to one weights set only with its band chip group appearing and the other two sets unchanged, and the unchanged confirmation, removal, reorder, note, timer, and restore behavior.

## Delivery commit

- **Delivery commit SHA:** `c48cbdcaf0bc348888ef2e1eff7193269a6f049c`
- **Subject:** `T-020: derive per-set load from the exercise definition`
- **Committed scope:** The active-workout set row without its load-mode sheet, rendering the snapshot's implied mode and one apply/remove control for the single permitted addition; the now-unreachable null-mode branches removed; component fixtures and scenarios rewritten for both directions of the control on a bodyweight and a weights exercise; and revised `MVP-WRK-003` with the workout, screen-decision, and UI-foundation documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T12:39:15+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded; the User reviewed the definition-derived set entry and the revised criterion.

## Approval

- **Approved commit:** `c48cbdcaf0bc348888ef2e1eff7193269a6f049c`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T12:39:15+02:00`
- **Approval note:** The User answered `odobravam` to the request to approve this exact commit, authorizing the component verification for its scope.

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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 7 recorded on 2026-09-05 |
| `2026-09-05T12:33:15+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed the per-set control placement on 2026-09-05 and directed execution after `T-019` |
| `2026-09-05T12:33:15+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the active-workout set-entry change |
| `2026-09-05T12:36:44+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` with static checks passed and no feature test run |
| `2026-09-05T12:39:15+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact commit |
| `2026-09-05T12:39:15+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Running the authorized component scenarios against `c48cbdcaf0bc348888ef2e1eff7193269a6f049c` |
| `2026-09-05T12:39:28+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | Authorized unit and component suites passed 64/64 and shared UI 4/4 against the approved commit |
