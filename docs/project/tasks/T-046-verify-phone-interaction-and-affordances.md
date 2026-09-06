# T-046 — Verify phone interaction, affordances, and destructive confirmation

- **Feature:** `F-010`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 4
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T14:52:00+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Await `T-043` and `T-044` and the `F-010` go-ahead. The scope and its local decisions are accepted.

## Scope

Deliver the release evidence for the three mobile-interaction criteria `F-010` owns: `MVP-UX-001` phone interaction, `MVP-UX-002` state and reorder affordances, and `MVP-UX-003` destructive confirmation. Each Feature met them on its own screens; nothing yet checks them across the whole application at once.

One prepared sweep, `tests/browser/release-phone-interaction.spec.ts`, that walks every route in the delivered inventory — Today and its one-time screen, the active workout and its finish review, Exercises, Programs and splits, and all five History subsections with their detail, form, and entry screens — and for each asserts:

- at 320, 360, 390, and 430 CSS pixels the document's `scrollWidth` equals its `clientWidth`, and no descendant scrolls horizontally, which is what `MVP-UX-001` means by no horizontal table scrolling;
- every numeric field carries the numeric or decimal `inputmode` its value needs, so the phone offers the right keyboard;
- each screen's primary action sits in the sticky action bar or within the thumb band above the bottom navigation, and every interactive target measures at least 44 by 44;
- every reorderable list — splits in a program, exercises in a split, exercises in a workout — exposes a visible drag handle with an accessible name, and a completed reorder saves without any save control, per `MVP-UX-002`;
- the current set is distinguished by a cue that is not color alone;
- every destructive action is gated by the `O01` confirmation: removing a populated set and a populated exercise, deleting a historical workout, discarding a current workout, and deleting an exercise, a split, a program, a measurement type, and a weight or measurement entry, per `MVP-UX-003`.

The delivery is test source and documentation. A defect the run finds is corrected as an in-scope replacement under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md), or becomes its own Task when it changes scope.

## Out of scope

- The persistence and reinterpretation evidence, owned by `T-045`, and the visual comparison, owned by `T-047`
- The release run of every suite, owned by `T-048`
- New screens, new controls, and redesign; this Task measures what is delivered
- A full accessibility audit beyond the cues the three criteria and the accepted foundation already require

## Acceptance criteria

- [ ] The sweep covers every delivered route, and adding a route without covering it fails the sweep rather than passing silently.
- [ ] No route scrolls horizontally at 320, 360, 390, or 430 CSS pixels, and no element inside one does.
- [ ] Every numeric input exposes the expected `inputmode`, and the sweep names the field when one does not.
- [ ] Every reorderable list has a named drag handle, and a completed reorder persists across a reload with no save control.
- [ ] The current set carries a non-color cue.
- [ ] Every destructive action listed in the scope is refused until the `O01` confirmation is accepted.
- [ ] It passes on mobile Chromium and mobile WebKit against the approved delivery, with structural captures at both reference viewports.
- [ ] The matrix rows for `MVP-UX-001` through `MVP-UX-003` cite this run and its approved SHA.

## Traceability

- MVP criteria: `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`; supporting `MVP-REL-001`, `MVP-REL-002`, `MVP-PRG-003`, `MVP-WRK-003`, `MVP-WRK-004`, `MVP-WRK-009`, `MVP-WRK-011`, `MVP-HIS-004`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-043` for the named gap; `T-044` for the settled harness rule; `F-004` through `F-009` `Done`, so every route exists and no placeholder remains
- Blockers: the `F-010` go-ahead
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `docs/project/mvp-release-verification.md` rows for the three criteria, the mobile UI foundation only if the sweep records a rule it does not yet state, this Task, `F-010`, registry, dashboard, project state
- Documentation that should remain unchanged: the locked criteria text, the frozen design packages, every completed Task record

## Execution checklist

- [ ] Derive the route inventory from the application rather than a hand-written list, so a new route cannot escape the sweep.
- [ ] Write the reflow, `inputmode`, thumb-band, and touch-target assertions for the four widths.
- [ ] Write the drag-handle, auto-save reorder, and current-set cue assertions.
- [ ] Write the destructive-confirmation assertions for every listed action.
- [ ] Attach structural captures at 390 by 844 and 360 by 800.
- [ ] Prepare the sweep; do not run it.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint including the accessibility rules, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:browser` for this sweep alone on one worker across mobile Chromium and mobile WebKit, after a clean reset and with the Owner's data snapshotted and restored around it. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-046: verify phone interaction, affordances, and destructive confirmation`
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
- [x] Dependencies are known; the scope is accepted and only the go-ahead and the two preceding Tasks remain
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
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
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | User / Owner | `Backlog` | `Backlog` | Confirmed the breakdown and the proposed local decisions (`ostalo potvrđujem da je ok`); only the go-ahead remains |
