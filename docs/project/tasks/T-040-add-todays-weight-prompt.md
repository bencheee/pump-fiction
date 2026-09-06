# T-040 — Add today's weight prompt to Today

- **Feature:** `F-009`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 3
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T13:54:26+02:00`
- **Started:** `2026-09-06T13:41:30+02:00`
- **Review started:** `2026-09-06T13:49:31+02:00`
- **Approval requested:** `2026-09-06T13:48:55+02:00`
- **Approved:** `2026-09-06T13:48:55+02:00`
- **Testing started:** `2026-09-06T13:48:55+02:00`
- **Completed:** `2026-09-06T13:54:26+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-040` is `Done`. `F-009` continues with `T-041`.

## Scope

Add the `MVP-TOD-004` weight surface to Today on the `T-038` operations, without changing workout start, split selection, restore, or rotation behavior.

`S01` Today:

- when the local date has no weight entry, a **Today's weight** card with the add action; the card stays in the no-program state and beside a restored-workout card, as the accepted wireframe keeps the weight action in both;
- once today's entry exists, the create prompt is gone and never returns for that date; per the accepted answer to `F-009` readiness question 3 the same card then shows the recorded value with a link to Weight and no create control;
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

- [x] Today shows the weight prompt exactly when the local date has no entry, in the populated, no-program, and restored-workout states, and never offers a second create path once today's entry exists.
- [x] Saving from `S04` creates today's entry, refreshes Today, and the same value is visible on `S19` without further action.
- [x] A conflict with an entry created elsewhere resolves to the existing value; a validation error is inline and announced; a persistence failure keeps the value and offers retry.
- [x] The sheet respects overlay history and safe areas, and `S01` and `S04` match the accepted `v0.3` structure, reflow from 320 to 430 px, and keep **Start Workout** in thumb reach.
- [x] The existing Today component tests and browser scenario keep passing once extended for the prompt, with no change to rotation, start, or restore behavior.

## Traceability

- MVP criteria: `MVP-TOD-004`; supporting `MVP-WGT-001`, `MVP-TOD-001`, `MVP-REL-002`, `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-038` Done (the create operation and the by-date read); `T-039` Done, whose weight field and validation presentation `S04` reuses
- Blockers: None; `T-038` and `T-039` are `Done`, and the Owner answered readiness question 3 and released the whole Feature on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the product overview's Today section (what Today shows once the entry exists, per question 3), the mobile UI foundation's Today composition paragraph (the weight surface is no longer absent), the screen decisions for Today where a decision is settled, this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: rotation rules, workout start, active-workout behavior, `TodayView`, the weekly formulas, and the locked MVP criteria text

## Execution checklist

- [x] Load today's weight prompt state in the Today page through server composition beside `getToday`, without changing `TodayView`.
- [x] Implement the `S01` prompt card and its replacement state per question 3 across the populated, no-program, and restored-workout layouts.
- [x] Implement the `S04` sheet with the fixed date, the decimal field, the save lifecycle, the duplicate-resolved state, retry, and overlay-history behavior, reusing the `T-039` weight field presentation.
- [x] Extend the Today component tests and the Today browser scenario for the prompt, the sheet, the saved state, and the conflict; do not run them.
- [x] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Passed on `2026-09-06T13:48:05+02:00` with Node.js `22.21.0`, npm `10.9.4`. `npm run check` passed Prettier, ESLint including the dependency-boundary and accessibility rules, strict TypeScript, the production build, the asset checksums, Markdown lint, and every internal link. `git diff --check` was clean. This Task changes no schema, migration, or generated type, and no server operation: it reads `getTodayWeight` and writes through the `T-038` create action. No feature test ran: the extended Today component suite and the extended Today browser scenario are prepared and unexecuted. Re-run for the replacement on `2026-09-06T13:51:40+02:00`: `npm run check` passed every step again and `git diff --check` was clean; the replacement touches test source only.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped Today component suite (prompt visibility per state, sheet lifecycle, conflict resolution) and the serialized one-worker Chromium and WebKit Today scenario on the `T-037` harness, extended with the prompt, the save, and its reflection on `S19`; the scenario removes the entry it creates. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** `88abdad827a907fc93c61fd7851cd5d1736057a6`, under the Task approval inherited per [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- **Results:** First verification on `2026-09-06T13:50:03+02:00` against exact approved delivery `4992e617d3d367091332eb178525b2c61e35f0a5` in a fresh isolated worktree with Node.js `22.21.0`, npm `10.9.4`, and Vitest `4.1.11`. `npm run test:unit` passed **187 of 192 across 22 files** and failed five Today scenarios, three new and two older than this Task, all with `useToast requires a ToastProvider ancestor`.

  The application was right and the tests were not. The weight card raises a toast when the day's weigh-in is saved, as every other save does, and `MainShell` owns that one provider; the suite rendered `TodayExperience` bare. Replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` sends every render through a helper that stands in for the shell, the way the exercise-form suite already does. The complete plan restarts from the beginning against it.

  Second verification, against exact replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` on `2026-09-06T13:54:26+02:00` in a fresh isolated worktree: **the complete plan passed**. `npm run test:unit` passed **192/192 across 22 files**, the four new Today scenarios among them. The Today browser scenario passed **4/4**, both its tests on mobile Chromium and mobile WebKit, on one worker against the production server, with eight structural captures. The weight run opened the sheet, dismissed it with Escape, saved `82.4 kg`, saw the prompt replaced by the recorded value with no second create path, followed the link to Weight and found the same weigh-in in its list, and reloaded Today to confirm the prompt does not return. It removed the row it created: `weight_entries` is empty again, and the exercises, program, and splits are untouched.

## Recorded decisions

- Today reads the day's weigh-in beside its aggregate rather than inside it, so `TodayView` and `get_today` are untouched;
- a weigh-in that cannot be read leaves the card out instead of failing Today, because starting a workout is what Today is for;
- the sheet's date is fixed to the local date and cannot be in the future, so the only refusal it can receive is a weigh-in that appeared meanwhile; it treats that as **resolved** rather than failed, closes the create path, and reloads Today onto the value that now exists;
- `weight-presentation.ts` moved to `src/features/history/ui/` once Today became its second reader, under the demonstrated-reuse rule of the mobile UI foundation;
- the card sits below the workout actions and above the rotation note in every state, including no program and a restored workout;
- the browser harness note `T-039` uncovered is recorded here rather than left in a Task file: a worktree needs a hard-link copy of `node_modules`, because Turbopack refuses a symlink that leaves the project root.

## Delivery commit

- **Delivery commit SHA:** `88abdad827a907fc93c61fd7851cd5d1736057a6` (test-source replacement; supersedes first delivery `4992e617d3d367091332eb178525b2c61e35f0a5`)
- **Replacement scope:** every `TodayExperience` render in the component suite now goes through a helper that provides the toast the shell provides; no application code, document, schema, or generated type changed
- **Subject:** `T-040: add today's weight prompt`
- **Committed scope:** the `S01` weight card and its `S04` sheet in `today-weight.tsx`; the Today page reading the weigh-in beside its aggregate and the experience rendering the card; `weight-presentation.ts` promoted to the History `ui` module with its `S19` import repointed; four prepared Today component scenarios and a prepared Today browser scenario for the prompt, the sheet, the saved state, and Weight; and the product-overview, mobile-UI-foundation, and screen-decision documents, the last also carrying the `T-039` browser-harness note

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T13:48:55+02:00`
- **Outcome:** Recommended for approval
- **Findings:** The authorized verification found the missing provider below

## Approval

- **Approved commit:** `4992e617d3d367091332eb178525b2c61e35f0a5`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T13:48:55+02:00`
- **Approval note:** The Owner replied `odobreno` to the request to review this exact delivery. Under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md) this is the Task's one approval; in-scope replacements inherit it.

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
- [x] Owner confirms transition to `Ready`

## Definition of Done

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA of the first delivery; the replacement inherited it under ADR-0028
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks: `T-041` and `T-042` deliver Body
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Today weight surface within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
| `2026-09-06T13:41:30+02:00` | User / Owner | `Backlog` | `Ready` | `T-039` is `Done` and the Owner's go-ahead for the whole Feature authorizes the Today surface |
| `2026-09-06T13:41:30+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the `MVP-TOD-004` prompt on the `T-038` operations |
| `2026-09-06T13:49:31+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `4992e617d3d367091332eb178525b2c61e35f0a5`; static checks passed and both prepared suites remain unexecuted |
| `2026-09-06T13:48:55+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-06T13:48:55+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `4992e617d3d367091332eb178525b2c61e35f0a5` with `odobreno` |
| `2026-09-06T13:48:55+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded component and browser verification against the exact approved delivery |
| `2026-09-06T13:51:40+02:00` | Claude Code primary agent / Tester and Executor | `Testing` | `Testing` | Five Today scenarios failed for want of the toast provider the shell gives them; replacement `88abdad827a907fc93c61fd7851cd5d1736057a6` corrects the suite, inherits the Task approval under ADR-0028, and the complete plan restarts against it |
| `2026-09-06T13:54:26+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | The complete plan passed against exact replacement `88abdad827a907fc93c61fd7851cd5d1736057a6`: unit and component 192/192 and the Chromium and WebKit Today scenario 4/4 with eight structural captures |
