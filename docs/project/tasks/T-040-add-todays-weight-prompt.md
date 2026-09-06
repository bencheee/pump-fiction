# T-040 — Add today's weight prompt to Today

- **Feature:** `F-009`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 3
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T12:22:31+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for `T-038` and `T-039` to be `Done` and for the Owner's answer to `F-009` readiness question 3; only then may the Owner move this Task to `Ready`.

## Scope

Add the `MVP-TOD-004` weight surface to Today on the `T-038` operations, without changing workout start, split selection, restore, or rotation behavior.

`S01` Today:

- when the local date has no weight entry, a **Today's weight** card with the add action; the card stays in the no-program state and beside a restored-workout card, as the accepted wireframe keeps the weight action in both;
- once today's entry exists, the create prompt is gone and never returns for that date; what stands in its place follows `F-009` readiness question 3;
- the Today page loads the prompt state through server composition beside the existing Today aggregate, so `TodayView` and `get_today` stay unchanged.

`S04` Today weight entry sheet:

- a `Sheet` overlay fixed to today's date, showing that date, a decimal kilogram field with a decimal numeric keyboard, **Save Weight**, and the saving, saved, validation, and failure states;
- a save creates today's entry through the `T-038` create operation; success closes the sheet or shows the saved value per question 3 and refreshes Today; a failure keeps the value and offers retry where retryable;
- the duplicate-resolved state: when an entry for today appeared meanwhile, for example through `S20`, the conflict closes the create path and shows that existing value instead of a second-entry prompt;
- the sheet follows the overlay-history rule: a dismissible history entry, closed by Back, Escape, and the visible close action, with safe-area insets respected.

## Out of scope

- Editing or deleting today's entry from Today; corrections happen on `S20`, owned by `T-039`
- Any change to the proposal card, split selection, one-time workout, restore card, or `TodayView`
- Weight derivation and writes, owned by `T-038`
- Feature tests before the Task's first approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)

## Acceptance criteria

- [ ] Today shows the weight prompt exactly when the local date has no entry, in the populated, no-program, and restored-workout states, and never offers a second create path once today's entry exists.
- [ ] Saving from `S04` creates today's entry, refreshes Today, and the same value is visible on `S19` without further action.
- [ ] A conflict with an entry created elsewhere resolves to the existing value; a validation error is inline and announced; a persistence failure keeps the value and offers retry.
- [ ] The sheet respects overlay history and safe areas, and `S01` and `S04` match the accepted `v0.3` structure, reflow from 320 to 430 px, and keep **Start Workout** in thumb reach.
- [ ] The existing Today component tests and browser scenario keep passing once extended for the prompt, with no change to rotation, start, or restore behavior.

## Traceability

- MVP criteria: `MVP-TOD-004`; supporting `MVP-WGT-001`, `MVP-TOD-001`, `MVP-REL-002`, `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-038` Done (the create operation and the by-date read); `T-039` Done, whose weight field and validation presentation `S04` reuses
- Blockers: `T-038` and `T-039` are not `Done`; the Owner has not yet answered `F-009` readiness question 3 or given the go-ahead
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the product overview's Today section (what Today shows once the entry exists, per question 3), the mobile UI foundation's Today composition paragraph (the weight surface is no longer absent), the screen decisions for Today where a decision is settled, this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: rotation rules, workout start, active-workout behavior, `TodayView`, the weekly formulas, and the locked MVP criteria text

## Execution checklist

- [ ] Load today's weight prompt state in the Today page through server composition beside `getToday`, without changing `TodayView`.
- [ ] Implement the `S01` prompt card and its replacement state per question 3 across the populated, no-program, and restored-workout layouts.
- [ ] Implement the `S04` sheet with the fixed date, the decimal field, the save lifecycle, the duplicate-resolved state, retry, and overlay-history behavior, reusing the `T-039` weight field presentation.
- [ ] Extend the Today component tests and the Today browser scenario for the prompt, the sheet, the saved state, and the conflict; do not run them.
- [ ] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped Today component suite (prompt visibility per state, sheet lifecycle, conflict resolution) and the serialized one-worker Chromium and WebKit Today scenario on the `T-037` harness, extended with the prompt, the save, and its reflection on `S19`; the scenario removes the entry it creates. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-040: add today's weight prompt`
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
- [ ] Dependencies are known and blocking issues resolved — `T-038` and `T-039` are not `Done`, and readiness question 3 is unanswered
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
- [ ] Authorized feature tests passed, or approved no-test reason is recorded
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Today weight surface within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
