# T-042 — Build Body mobile experience

- **Feature:** `F-009`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 5
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T14:26:11+02:00`
- **Started:** `2026-09-06T14:14:28+02:00`
- **Review started:** `2026-09-06T14:24:05+02:00`
- **Approval requested:** `2026-09-06T14:22:46+02:00`
- **Approved:** `2026-09-06T14:22:46+02:00`
- **Testing started:** `2026-09-06T14:22:46+02:00`
- **Completed:** `2026-09-06T14:26:11+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-042` is `Done`. `F-009` awaits the Owner's confirmation of the Feature result.

## Scope

Implement the phone-only Body subsection of History on the `T-041` operations, inside the `T-032` shell, replacing the title-only placeholder route.

`S21` Body measurement types at `/history/body`:

- a header add action leading to `S22` create;
- every type with its wrapped long name, its latest value with date, and its latest change or the unavailable marker, with neutral semantics that never color an increase or a decrease as good or bad; a row opens `S23`;
- empty and loading states; no archived section, badge, or filter, per `F-009` readiness question 1.

`S22` Measurement type form at `/history/body/types/new` and `/history/body/types/[id]/edit`:

- a name with inline, announced validation for a blank or duplicate name, and the unit shown read-only as `cm`;
- the save, validation, and outcome cue as the first row of the sticky action bar, as the frozen v0.4 package places it on `S22`, and the definition-form save contract returning to `S21`;
- **Delete Type** only in edit mode: through the `O01` destructive confirmation when the type has no entries; when it has entries the control is replaced by the explanation that its entries are the only record of the measurement, so it cannot be deleted; no archive or reactivate control.

`S23` Measurement detail at `/history/body/[typeId]`:

- the wrapped type name, a header add action leading to `S24` create, and a link to `S22` edit;
- the latest value with its date, the latest change, and the total change, each unavailable rather than zero when there are too few entries;
- a range selector for month, quarter, year, and all; the shared History `ProgressChart`, as `S16` and `S18` use it, with the textual summary and an accessible data list beside it and neutral semantics;
- every entry newest first with its date, value, and change from the preceding entry; a row opens `S24` edit;
- an empty state without fabricated zeros; after any save or deletion the screen shows the recalculated values.

`S24` Measurement entry at `/history/body/[typeId]/new` and `/history/body/[typeId]/[date]/edit`:

- a date defaulting to the local today with retrospective dates available and future dates refused, and a decimal centimeter field with a decimal numeric keyboard; validation and the sticky cue row mirror `S20`, as the v0.4 package places it on `S24`;
- a save returns to `S23`; **Delete Entry** only in edit mode, through the `O01` destructive confirmation, returning to `S23`;
- malformed or unknown type ids and dates resolve through the shared not-found boundary, validated by `requireUuidRouteParam` and the `T-039` date-parameter helper.

## Out of scope

- Derivation and writes, owned by `T-041`; Weight screens, owned by `T-039`; Today, owned by `T-040`
- Archiving or reactivation, unit conversion, goals, desktop layouts, hover-only interaction
- Feature tests before the Task's first approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)

## Acceptance criteria

- [x] `S21` lists every type with its latest value, date, and neutral latest change, renders the empty and loading states, and shows no archived section or badge.
- [x] `S22` creates and renames a type with inline announced validation and returns to `S21` with a toast; it deletes an entry-less type only after `O01` confirmation, and explains instead of offering deletion when entries exist.
- [x] `S23` shows the latest value, the latest change, and the total change or their unavailable states; the range selector offers month, quarter, year, and all; changing it updates the chart, the textual summary, and the accessible list together; the chart needs no hover and respects reduced motion.
- [x] Creating, editing, and deleting an entry through `S24` returns to `S23` with visibly recalculated values, deletion after `O01` confirmation, with a future date, a duplicate date, and an invalid value refused inline.
- [x] An increase or a decrease is never colored or labelled as good or bad anywhere on `S21`, `S23`, or `S24`.
- [x] `S21` through `S24` match the accepted `v0.3` structure and chart geometry with the v0.4 cue placement on `S22` and `S24`, wrap long names in the list, the form, the chart header, and the entry screen, reflow from 320 to 430 px, and meet the accepted touch, overlay-history, and accessibility behavior with no horizontal table scrolling.

## Traceability

- MVP criteria: `MVP-BOD-001`, `MVP-BOD-002`, `MVP-BOD-003`, `MVP-BOD-004`; supporting `MVP-HIS-001`, `MVP-REL-002`, `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-032`, `T-034`, and `T-036` Done (shell, placeholder route, shared chart), `T-041` Done (data), `T-039` Done (the date-parameter helper)
- Blockers: None; `T-039` and `T-041` are `Done` and the Owner released the whole Feature on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation (the Body routes replacing the placeholder), the screen decisions for History Body (delete instead of archive, the explanation when entries exist), this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: the change formulas, the locked MVP criteria text, Weight and Today, and the Workouts, Exercises, and Splits subsections

## Execution checklist

- [x] Implement `S21` with the type summaries, neutral change presentation, the empty and loading states, and the header add action.
- [x] Implement `S22` create and rename with validation, the sticky cue row, the save contract, `O01` deletion for entry-less types, and the explanation for types with entries.
- [x] Implement `S23` summaries, the range selector, the route-local chart with the textual summary and the accessible list, and the entries list with its per-entry change.
- [x] Implement `S24` create and edit with the date default, the decimal keyboard, inline announced validation, the sticky cue row, the save contract, and `O01` deletion.
- [x] Wire the UUID and date route-parameter validation, the not-found boundary, and the subsection navigation state.
- [x] Prepare component tests and a serialized Chromium/WebKit scenario for critical flow 9 (`S21` to `S23` to `S24`, plus `S22` create and delete) with structural captures; do not run them.
- [x] Update canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build with the chart bundle confined to its routes, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Passed on `2026-09-06T14:22:36+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint including the dependency-boundary and accessibility rules, strict TypeScript, the production build, the asset checksums, Markdown lint, and every internal link. The build lists all six Body routes as dynamic but for the static type-create form, and **no placeholder route remains in the application**. `git diff --check` was clean. This Task changes no schema, migration, generated type, or server operation. No feature test ran: the component suite and the browser scenario are prepared and unexecuted.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped component suite (`S21` summaries; `S22` validation and delete rules; `S23` selector synchronization and unavailable states; `S24` validation) and the serialized one-worker Chromium and WebKit phone scenario on the `T-037` harness covering `S21` to `S22` create, `S23`, `S24` create, edit, and delete, the restricted-delete explanation, reflow, and structural captures; the scenario removes what it creates. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** `ae55dd3ef85ce31a692577620736b64a9abf7e54`
- **Results:** Passed on `2026-09-06T14:26:11+02:00` against exact approved delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54` in a fresh isolated worktree with Node.js `22.21.0`, npm `10.9.4`, Vitest `4.1.11`, and Playwright `1.62.1`. **The complete plan passed on the first run.**

  `npm run test:unit` passed **235/235 across 25 files**, the new Body component suite 17/17 among them. The serialized Body scenario passed **2/2**, one on mobile Chromium and one on mobile WebKit, on one worker against the production server, with **eight structural captures**, four per phone. It read `S21` with its latest value and change and no archived state anywhere, opened `S23` and its chart values, saw a range that excludes the entries say so, created a retrospective entry through `S24`, met the refused duplicate date on the date field, corrected and deleted an entry, found `S22` explaining why a measurement with entries cannot be deleted, renamed it and saw every entry stay attached, deleted an empty measurement, and reflowed to 320 px. It removed every row it made: no measurement type or entry remains, and the Owner's exercises, program, and splits are untouched.

## Recorded decisions

- `/history/body/types/...` is a static segment beside the dynamic `/history/body/[typeId]`, so the type forms and the measurement detail cannot collide;
- `S22` offers **Delete Measurement** only while the type holds nothing and otherwise explains why, rather than disabling a control without saying so;
- `S21` states once, in words, that a rise or a fall is neither good nor bad, which is where the neutrality `MVP-BOD-003` requires is said rather than implied;
- `S23` opens on `all` and offers month, quarter, year, and all; each stat card says plainly when it has nothing to compare against;
- `body-presentation.ts` sits beside `weight-presentation.ts` in the feature's `ui` module;
- the trend sentence is built as one string, as `S19` does, so a JSX line break cannot change what it reads;
- `S21` is a server component, since it holds no client state; the browser scenario covers it and the component suite covers the three that do.

## Delivery commit

- **Delivery commit SHA:** `ae55dd3ef85ce31a692577620736b64a9abf7e54`
- **Subject:** `T-042: build Body screens`
- **Committed scope:** `S21` at `/history/body` replacing the last placeholder route; `S22` at `/history/body/types/new` and `/history/body/types/[id]/edit` with the read-only unit, the rename, and the conditional deletion; `S23` at `/history/body/[typeId]` with its three stat cards, range selector, chart, textual summary, accessible value list, and entry list; `S24` at `/history/body/[typeId]/new` and `/history/body/[typeId]/[date]/edit`; `body-presentation.ts` in the History `ui` module; the prepared component suite and the prepared `body` browser scenario; and the mobile-UI-foundation and screen-decision documents

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T14:22:46+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `ae55dd3ef85ce31a692577620736b64a9abf7e54`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T14:22:46+02:00`
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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks: none was discovered
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Body subsection delivery within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
| `2026-09-06T14:14:28+02:00` | User / Owner | `Backlog` | `Ready` | `T-041` is `Done` and the Owner's go-ahead for the whole Feature authorizes the Body screens |
| `2026-09-06T14:14:28+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the Body subsection, the last Task of `F-009` |
| `2026-09-06T14:24:05+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54`; static checks passed and both prepared suites remain unexecuted |
| `2026-09-06T14:22:46+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-06T14:22:46+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `ae55dd3ef85ce31a692577620736b64a9abf7e54` with `potvrda` |
| `2026-09-06T14:22:46+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded component and browser verification against the exact approved delivery |
| `2026-09-06T14:26:11+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | The complete plan passed on the first run: unit and component 235/235 and the Chromium and WebKit Body scenario 2/2 with eight structural captures |
