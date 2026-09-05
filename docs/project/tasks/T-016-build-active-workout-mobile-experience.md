# T-016 — Build active-workout mobile experience

- **Feature:** `F-007`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 4
- **Target date:** None
- **Executor:** Claude Code primary agent (continued from Codex primary agent)
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-03T12:03:59+02:00`
- **Updated:** `2026-09-05T10:11:16+02:00`
- **Started:** `2026-09-04T15:02:00+02:00`
- **Review started:** `2026-09-04T16:11:24+02:00` for replacement
- **Approval requested:** `2026-09-04T16:23:50+02:00` for replacement
- **Approved:** `2026-09-04T16:23:50+02:00` for replacement
- **Testing started:** `2026-09-05T10:07:03+02:00` for replacement
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Correct the singular review-metric browser query, run static checks without feature tests, create a second test-only replacement delivery, and request fresh approval.

## Scope

Implement phone-only S10 active/paused/restored workout, S11 add-exercise sheet, and S12 finish review, including focused shell, live timer, durable save/conflict states, snapshot/Last time content, all set modes, workout-local edits, populated-removal confirmation, and complete/incomplete/continue/discard outcomes.

## Out of scope

- Today/start, today's weight, and History presentation/correction
- Rest timer, warm-up sets, RIR/RPE, estimated 1RM, general offline, desktop, or post-MVP close protection
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] S10 restores canonical state with accurate duration, revision, pending replay, and non-color save/conflict cues.
- [ ] Cards show required snapshots, Last time, notes, prescription, editable rows, and valid per-set mode inputs.
- [ ] Exercise/set add/remove/reorder stays workout-local, auto-saved, accessible, and confirmation-gated for populated data.
- [ ] Pause and resume exclude paused wall-clock time.
- [ ] S12 handles complete, incomplete, continue, and confirmed discard with required review data.
- [ ] S10–S12 match accepted structure, dense phone reflow, focused navigation, overlay history, touch, motion, and accessibility behavior.

## Traceability

- MVP criteria: `MVP-WRK-001`–`012`; supporting `MVP-TOD-002`–`003`, `MVP-REL-001`–`004`, `MVP-UX-001`–`003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../product/exercises.md`](../../product/exercises.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-014`, `T-017`, and `T-015` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: active-workout UI/client guidance if needed, Task/Feature/registry/dashboard/milestone/project-state projections
- Documentation that should remain unchanged: Today/weight and History behavior, desktop/post-MVP, and deferred production choices

## Execution checklist

- [x] Implement S10 focused workout and duration/save-status behavior.
- [x] Implement cards, modes, validation, notes, add/remove, and ordering through the durable controller.
- [x] Implement S11 selection, S12 review/outcomes, and conflict recovery.
- [x] Prepare component and Chromium/WebKit tests without running them; run only static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency/accessibility rules, strict TypeScript, production build, design assets/references, documentation links, and `git diff --check`
- Results: Passed for both the original delivery and the pending replacement on 2026-09-04 with Node.js `24.20.0` and npm `11.19.0`: formatting, ESLint, and strict TypeScript passed; the Next.js `16.3.3` production build compiled all 18 routes with dynamic `/workout/current` and `/workout/current/finish`; all 8 font and 38 icon checksums plus license files passed; Markdown lint and all internal links passed; `git diff --check` passed; and the corrective migration compiled cleanly inside an immediately rolled-back transaction. No feature test or manual application test ran after the correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run the scoped active-workout unit/component suites (reducer, set-entry mode matrix, S10 validation/mode-change/removal/timer/restore replay, S12 metrics and outcomes), the clean-reset pgTAP suites including the new position-renumbering regression, and the serialized Chromium/WebKit phone-browser scenario covering set entry, local edits, timer pause/resume, reload restore, finish outcomes, rotation, reflow, and structural captures.
- **Authorized commit:** None; approval of `c751e90fbd17f810c8a5890a7e15883e4dfe69ff` was invalidated by a failed prepared browser assertion.
- **Results:** Against the formerly approved first replacement `c751e90fbd17f810c8a5890a7e15883e4dfe69ff` on 2026-09-05 in a fresh isolated worktree with Node.js `24.20.0` and npm `11.19.0`: `npm ci` installed 653 packages with no vulnerabilities, `supabase db reset` applied all migrations including the renumbering correction, the reducer/set-entry unit suite passed 9/9, the S10/S12 component suite passed 11/11, and the complete clean-reset pgTAP run passed 53/53 across five files including the new position-renumbering regression 9/9. The serialized mobile-Chromium scenario completed the entire S10 flow — set entry, validation, populated and empty removals, add set, add exercise, reorder, note, pause/resume, and reload restore — and stopped only on a test-only strict-mode defect at the S12 assertions: the singular query for the `Confirmed sets` metric also matches the intentional "Confirmed sets count toward exercise personal records and charts." completion bullet. WebKit did not run. These partial results are discarded for completion; the corrected second replacement requires fresh approval and a complete restart. The earlier run against superseded original delivery `63126a1635421cf042186446216e7921025e6105` passed unit 9/9 and component 11/11 before exposing the since-corrected T-014 renumbering defect.

## Delivery commit

- **Delivery commit SHA:** `c751e90fbd17f810c8a5890a7e15883e4dfe69ff` (first replacement; second test-only replacement required)
- **Subject:** `T-016: correct workout position renumbering`
- **Committed scope:** Preserve the original S10–S12 delivery — phone-only active/paused/restored workout with live timer, per-mode set rows, mirrored confirmation validation, mode chooser, populated-removal confirmation, explicit reordering, auto-saved notes, S11 multi-select add-exercise sheet, S12 source-aware finish review, and the local command reducer with conflict rebase — while correcting the inherited T-014 persistence renumbering: the declarative schema and a reviewed migration replace the negative-position updates with the accepted offset-above-maximum technique for `remove_set`, `remove_exercise`, and `reorder_exercises`, with a new prepared pgTAP regression; lifecycle documentation is synchronized.

## Review

- **Reviewer:** User
- **Reviewed at:** Pending for second replacement
- **Outcome:** First-replacement approval invalidated; second test-only replacement pending
- **Findings:** The prepared S12 browser assertion used a singular substring query for the `Confirmed sets` metric that also matches the intentional completion-explanation bullet.

## Approval

- **Approved commit:** Pending second replacement
- **Approved by:** Pending
- **Approved at:** Pending
- **Approval note:** The first-replacement approval (`odobreno` for `c751e90fbd17f810c8a5890a7e15883e4dfe69ff`) was invalidated when its prepared browser assertion failed; no corrected test may run before the second replacement is explicitly approved.

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
| `2026-09-03T12:03:59+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Created as the dependent active-workout mobile delivery within `F-007` |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Planner | `Backlog` | `Backlog` | Added dependency on required one-time starter-set correction T-017 and shifted order after that inserted Task |
| `2026-09-04T15:02:00+02:00` | User / Owner | `Backlog` | `Ready` | `T-014`, `T-017`, and `T-015` are Done; the User's 2026-09-04 direction to finish `F-007` and continue with `T-016` confirms readiness |
| `2026-09-04T15:02:00+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the accepted S10–S12 active-workout phone implementation on the durable command foundation |
| `2026-09-04T15:31:24+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Completed S10–S12, the local command reducer with conflict rebase, canonical UI/durability guidance, and unexecuted unit/component/browser coverage; all static checks passed |
| `2026-09-04T15:33:30+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `63126a1635421cf042186446216e7921025e6105`; static checks passed and prepared feature tests remain unexecuted |
| `2026-09-04T15:58:06+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings and recommended approval |
| `2026-09-04T15:58:06+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `63126a1635421cf042186446216e7921025e6105` |
| `2026-09-04T15:58:06+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded unit/component and serialized Chromium/WebKit verification against the exact approved delivery |
| `2026-09-04T16:07:01+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | Unit 9/9 and component 11/11 passed before serialized Chromium stopped on a rejected `remove_set`: the approved T-014 renumbering violates the positive-position checks when siblings remain; browser tests stopped and the approval is invalidated |
| `2026-09-04T16:09:58+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Replaced the negative-position renumbering with the accepted offset-above-maximum technique in the declarative schema and a reviewed migration, and prepared the pgTAP regression; static checks passed without feature tests |
| `2026-09-04T16:11:24+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created replacement `c751e90fbd17f810c8a5890a7e15883e4dfe69ff`; static checks passed and the complete feature-test plan remains unexecuted for the replacement |
| `2026-09-04T16:23:50+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact replacement `c751e90fbd17f810c8a5890a7e15883e4dfe69ff` with no additional findings and recommended approval |
| `2026-09-04T16:23:50+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved the exact replacement and authorized the complete recorded test plan from the beginning |
| `2026-09-05T10:07:03+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began the complete verification in a fresh isolated worktree at the exact approved replacement |
| `2026-09-05T10:11:16+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | Unit 9/9, component 11/11, and pgTAP 53/53 passed and the corrected renumbering carried the full Chromium S10 flow, before a test-only substring query on the `Confirmed sets` metric hit the intentional completion bullet; browser tests stopped and the first-replacement approval is invalidated |
