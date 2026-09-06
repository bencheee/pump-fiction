# T-039 — Build Weight mobile experience

- **Feature:** `F-009`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T13:32:55+02:00`
- **Started:** `2026-09-06T13:19:35+02:00`
- **Review started:** `2026-09-06T13:36:02+02:00`
- **Approval requested:** `2026-09-06T13:32:55+02:00`
- **Approved:** `2026-09-06T13:32:55+02:00`
- **Testing started:** `2026-09-06T13:32:55+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the complete recorded plan against the exact approved delivery, then record the result.

## Scope

Implement the phone-only Weight subsection of History on the `T-038` operations, inside the `T-032` shell, replacing the title-only placeholder route.

`S19` Weight at `/history/weight`:

- a header add action leading to `S20` create;
- the latest weight with its date and the change from the previous weigh-in; the current week's average, its change from the previous week or the unavailable state, the recorded-days count `n/7`, and the provisional-until-Sunday or final label;
- a range selector for week, month, quarter, and year;
- the shared History `ProgressChart` from `src/features/history/ui/progress-chart.tsx`, extended to draw the companion weekly-average series beside the daily series, distinguished by non-color cues and a legend, loaded only on this route and fitted to phone widths, with the textual summary and an accessible data list beside it;
- every weigh-in newest first with its date, value, and change from the previous weigh-in; a row opens `S20` edit;
- empty and loading states; after a save, an edit, or a deletion the screen shows the recalculated summaries and chart.

`S20` Weight entry at `/history/weight/new` and `/history/weight/[date]/edit`:

- a date defaulting to the local today, with retrospective dates available and future dates refused, and a decimal kilogram field with a decimal numeric keyboard;
- inline, announced validation for a future date, a duplicate date, and an invalid value, with the save, validation, and outcome cue as the first row of the sticky action bar, as the frozen v0.4 package places it on `S20`;
- the definition-form save contract: a successful save raises a toast and returns to `S19`, refreshed; a failure keeps the form with its values and offers retry where retryable; the status reads `Unsaved changes` only when the form changed;
- **Delete Entry** only in edit mode, through the `O01` destructive confirmation, returning to `S19` with a toast;
- a malformed or unknown date parameter resolves through the shared not-found boundary, validated by a date-parameter helper beside `requireUuidRouteParam`.

## Out of scope

- Weight derivation and writes, owned by `T-038`
- The Today prompt and `S04`, owned by `T-040`
- Body screens, owned by `T-042`
- Trend estimates, goals, desktop layouts, hover-only interaction
- Feature tests before the Task's first approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)

## Acceptance criteria

- [ ] `S19` shows the latest weight, the individual change, the weekly average, the weekly change or its unavailable state, `n/7`, and the provisional or final label exactly as `T-038` derives them, and renders the empty and loading states.
- [ ] The range selector offers week, month, quarter, and year; changing it updates the chart, the textual summary, and the accessible list together; the two series are distinguishable without color, and the chart needs no hover and respects reduced motion.
- [ ] Creating, editing, and deleting an entry through `S20` returns to `S19` with a toast and visibly recalculated summaries and chart; deletion requires `O01` confirmation.
- [ ] A future date, a duplicate date, and an invalid value are refused inline with announced messages, and the form keeps its values.
- [ ] `S19` and `S20` match the accepted `v0.3` structure and chart geometry with the v0.4 cue placement on `S20`, reflow from 320 to 430 px, and meet the accepted touch, overlay-history, and accessibility behavior with no horizontal table scrolling.

## Traceability

- MVP criteria: `MVP-WGT-001`, `MVP-WGT-002`, `MVP-WGT-003`, `MVP-WGT-004`; supporting `MVP-HIS-001`, `MVP-REL-002`, `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-032`, `T-034`, and `T-036` Done, which built the shell, the placeholder route, and the shared `ProgressChart` in the History `ui` module; `T-038` Done (data)
- Blockers: None; `T-038` is `Done` through approved replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7` and the Owner released the whole Feature on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation (the Weight routes replacing the placeholder, the date-parameter helper, the companion series on the shared chart, the save contract applied to Weight), the screen decisions for History Weight where a screen decision is settled, this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: the weekly formulas, the locked MVP criteria text, Today, Body, and the Workouts, Exercises, and Splits subsections

## Execution checklist

- [x] Implement `S19` summaries, the entries list with its per-entry change, the empty and loading states, and the header add action.
- [x] Implement the range selector, extend the shared `ProgressChart` with a companion series distinguished without color and a legend, and render the textual summary and the accessible data list, keeping calculations out of presentation.
- [x] Implement `S20` create and edit with the date default, the decimal keyboard, inline announced validation, the sticky cue row, the save contract, and `O01` deletion.
- [x] Add the date route-parameter helper and wire the not-found boundary and the subsection navigation state.
- [x] Prepare component tests and a serialized Chromium/WebKit scenario for critical flow 9 (`S19` to `S20` create, edit, and delete with recalculation) with structural captures; do not run them.
- [x] Update canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build with the chart bundle confined to its route, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Passed on `2026-09-06T13:34:18+02:00` with Node.js `22.21.0`, npm `10.9.4`, and Supabase CLI `2.116.0`. `npm run check` passed Prettier, ESLint including the dependency-boundary and accessibility rules, strict TypeScript, the production build, the asset checksums, Markdown lint, and every internal link. The build lists `/history/weight`, `/history/weight/new`, and `/history/weight/[date]/edit` as dynamic routes and leaves the Recharts bundle on the routes that import the shared chart. `git diff --check` was clean. This Task changes no schema, migration, or generated type. No feature test ran: the component suite and the browser scenario are prepared and unexecuted.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped component suite (`S19` summaries and the unavailable state; range selector synchronization; `S20` validation, save contract, and deletion) and the serialized one-worker Chromium and WebKit phone scenario on the `T-037` harness, against the production server and waiting for hydration before the first entry, covering `S19` to `S20` create, edit, and delete with recalculation, reflow, and structural captures; the scenario seeds and removes its own entries. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`
- **Results:** Not run

## Recorded decisions

- the History subsection bar owns the top of every `/history` screen, so the `S19` add action sits in the content flow rather than floating over it as the Exercises and Programs add actions do;
- `requireLocalDateRouteParam` joins `requireUuidRouteParam` in `src/shared/routing/`, because a weigh-in is addressed by its local date;
- the shared `ProgressChart` learned a companion series: it merges the two into one dataset keyed by date, draws the weekly averages dashed, names both in a real-text legend outside the hidden chart, and takes `frame="data"` so a series far from zero frames its values instead of the origin; every earlier chart keeps the axis it had;
- `S19` opens on the month and offers week, month, quarter, and year, never `all`;
- the trend sentence is built as one string, so a JSX line break cannot change what it reads;
- the future date and the non-numeric value are covered by the component suite, and the duplicate date by the browser scenario, because only a server round trip can produce it.

## Delivery commit

- **Delivery commit SHA:** `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`
- **Subject:** `T-039: build Weight screens`
- **Committed scope:** `S19` at `/history/weight` with its two stat cards, range selector, chart with legend, textual summary, accessible value lists, and weigh-in list; `S20` at `/history/weight/new` and `/history/weight/[date]/edit` with the date default, decimal field, inline validation, sticky cue row, save contract, and `O01` deletion; the shared `ProgressChart` extended with a companion series and a data-framed axis; `requireLocalDateRouteParam`; the prepared component suite and the prepared `weight` browser scenario; and the mobile-UI-foundation and screen-decision documents

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T13:32:55+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T13:32:55+02:00`
- **Approval note:** The Owner replied `potvrda` to the request to review this exact delivery. Under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md) this is the Task's one approval; in-scope replacements inherit it.

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
- [ ] Authorized feature tests passed, or approved no-test reason is recorded
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Weight subsection delivery within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
| `2026-09-06T13:19:35+02:00` | User / Owner | `Backlog` | `Ready` | `T-038` is `Done` and the Owner's go-ahead for the whole Feature authorizes the screens that render it |
| `2026-09-06T13:19:35+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the Weight subsection on the `T-038` operations |
| `2026-09-06T13:36:02+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e`; static checks passed and both prepared suites remain unexecuted |
| `2026-09-06T13:32:55+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-06T13:32:55+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `37cf5ee592bb6a4851050980c9f6c65a6a73ce0e` with `potvrda` |
| `2026-09-06T13:32:55+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded component and browser verification against the exact approved delivery |
