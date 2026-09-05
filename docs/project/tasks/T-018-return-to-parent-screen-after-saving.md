# T-018 — Return to the parent screen after saving

- **Feature:** `F-011`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T12:01:13+02:00`
- **Started:** `2026-09-05T11:54:40+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Record the delivery commit SHA through an evidence commit and request review.

## Scope

Make every definition form close on a successful save: show a success toast and navigate to the screen the user came from, while a failure keeps the form open and reports the failure as a toast. In the same change, make the save status report `Unsaved changes` only when the form differs from the state it opened with, instead of the current `Not saved yet` shown immediately on open.

Creating a program keeps its existing rule that splits are added after the program exists, so a new program now returns to the Programs list and its splits are added by reopening it.

Affected forms and their parent screens:

| Form | Parent screen |
| --- | --- |
| New and Edit Exercise | `/exercises` |
| New and Edit Program | `/programs` |
| New and Edit Split | `/programs/{programId}/edit` |

## Out of scope

- Deletion, archiving, and activation actions, including their toasts (`T-021`, `T-022`)
- The one-time workout builder, which already navigates into the started workout
- Active-workout auto-save, which has no explicit save action
- Any database, domain, or application-boundary change

## Acceptance criteria

- [ ] Saving a new exercise, program, or split navigates to its parent screen and shows a success toast there.
- [ ] Saving an edited exercise, program, or split behaves identically to creation.
- [ ] A failed save keeps the form mounted with its entered values, shows a failure toast, and still renders field-level validation errors.
- [ ] An unchanged form shows no unsaved-changes text.
- [ ] A form changed from its opening state shows `Unsaved changes` until it is saved or reset.
- [ ] `Saving…`, failure, and retry save-status behavior is otherwise unchanged.

## Traceability

- MVP criteria: supporting `MVP-UX-001`; no criterion text changes
- ADRs: [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md)
- Canonical documents: [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Dependencies and blockers

- Dependencies: None
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: shared save/toast interaction contract in the mobile UI foundation, screen decisions for Exercises, Programs, and Splits, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: product behavior for exercises, programs, splits, workouts, and History

## Execution checklist

- [x] Add a shared dirty-state and save-outcome helper to the mobile UI foundation rather than duplicating it per form.
- [x] Apply it to the exercise, program, and split forms with their parent destinations.
- [x] Replace the `idle` save-status text with dirty-state-driven copy.
- [x] Update the affected component tests without running them.
- [x] Synchronize canonical UI documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Passed on `2026-09-05T12:01:13+02:00` with Node.js `24.20.0`, npm `11.19.0`. `npm run check` passed Prettier formatting, ESLint, strict TypeScript, the production build of all 19 routes, UI asset checksums, Markdown lint across 95 files, and all 724 internal links across 147 unique targets. `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** existing exercise-form, programs, and Today component suites plus new assertions for save navigation, success and failure toasts, and dirty-state save status; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Recorded by the following evidence commit
- **Subject:** `T-018: return to the parent screen after saving`
- **Committed scope:** Shell-owned toast provider and `useToast`; `useSaveOutcome` and `useSavedSnapshot` helpers; `SaveStatus` states `clean`/`unsaved`/`saving`/`failure`; exercise, program, and split forms returning to their parent screens with toasts and dirty-state save status; removal of the `?saved=1` round trip from the three edit routes; updated component tests; and the save-contract sections in the mobile UI foundation and wireframe decisions.

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
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 1 and 4 recorded on 2026-09-05 |
| `2026-09-05T11:54:40+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed the `F-011` plan and directed execution |
| `2026-09-05T11:54:40+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the save-and-return and unsaved-changes correction |
