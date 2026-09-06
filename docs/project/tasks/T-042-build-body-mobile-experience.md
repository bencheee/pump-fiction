# T-042 — Build Body mobile experience

- **Feature:** `F-009`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 5
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
- **Next action:** Wait for `T-039` and `T-041` to be `Done`; only then may the Owner move this Task to `Ready`.

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

- [ ] `S21` lists every type with its latest value, date, and neutral latest change, renders the empty and loading states, and shows no archived section or badge.
- [ ] `S22` creates and renames a type with inline announced validation and returns to `S21` with a toast; it deletes an entry-less type only after `O01` confirmation, and explains instead of offering deletion when entries exist.
- [ ] `S23` shows the latest value, the latest change, and the total change or their unavailable states; the range selector offers month, quarter, year, and all; changing it updates the chart, the textual summary, and the accessible list together; the chart needs no hover and respects reduced motion.
- [ ] Creating, editing, and deleting an entry through `S24` returns to `S23` with visibly recalculated values, deletion after `O01` confirmation, with a future date, a duplicate date, and an invalid value refused inline.
- [ ] An increase or a decrease is never colored or labelled as good or bad anywhere on `S21`, `S23`, or `S24`.
- [ ] `S21` through `S24` match the accepted `v0.3` structure and chart geometry with the v0.4 cue placement on `S22` and `S24`, wrap long names in the list, the form, the chart header, and the entry screen, reflow from 320 to 430 px, and meet the accepted touch, overlay-history, and accessibility behavior with no horizontal table scrolling.

## Traceability

- MVP criteria: `MVP-BOD-001`, `MVP-BOD-002`, `MVP-BOD-003`, `MVP-BOD-004`; supporting `MVP-HIS-001`, `MVP-REL-002`, `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-032`, `T-034`, and `T-036` Done (shell, placeholder route, shared chart), `T-041` Done (data), `T-039` Done (the date-parameter helper)
- Blockers: `T-039` and `T-041` are not `Done`; the Owner has not yet given the `F-009` go-ahead
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation (the Body routes replacing the placeholder), the screen decisions for History Body (delete instead of archive, the explanation when entries exist), this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: the change formulas, the locked MVP criteria text, Weight and Today, and the Workouts, Exercises, and Splits subsections

## Execution checklist

- [ ] Implement `S21` with the type summaries, neutral change presentation, the empty and loading states, and the header add action.
- [ ] Implement `S22` create and rename with validation, the sticky cue row, the save contract, `O01` deletion for entry-less types, and the explanation for types with entries.
- [ ] Implement `S23` summaries, the range selector, the route-local chart with the textual summary and the accessible list, and the entries list with its per-entry change.
- [ ] Implement `S24` create and edit with the date default, the decimal keyboard, inline announced validation, the sticky cue row, the save contract, and `O01` deletion.
- [ ] Wire the UUID and date route-parameter validation, the not-found boundary, and the subsection navigation state.
- [ ] Prepare component tests and a serialized Chromium/WebKit scenario for critical flow 9 (`S21` to `S23` to `S24`, plus `S22` create and delete) with structural captures; do not run them.
- [ ] Update canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build with the chart bundle confined to its routes, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped component suite (`S21` summaries; `S22` validation and delete rules; `S23` selector synchronization and unavailable states; `S24` validation) and the serialized one-worker Chromium and WebKit phone scenario on the `T-037` harness covering `S21` to `S22` create, `S23`, `S24` create, edit, and delete, the restricted-delete explanation, reflow, and structural captures; the scenario removes what it creates. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-042: build Body screens`
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
- [ ] Dependencies are known and blocking issues resolved — `T-039` and `T-041` are not `Done`
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
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Body subsection delivery within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
