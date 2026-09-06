# T-052 — Build the Body destination

- **Feature:** `F-015`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T19:10:00+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Await `T-051` and the `F-015` go-ahead.

## Scope

The fifth destination and the move into it. One commit, because a half-moved route surface is not reviewable: the bottom navigation, the routes, and the specs that assert both have to agree at every commit.

- `Body` joins the bottom navigation as the fifth destination, with its own icon and label, and opens on its Weight tab.
- A tab bar at the top of `/body` carries `Weight` and `Measurements`, marked by `aria-current` and weight and underline rather than color. The History subsection component is generalized rather than copied, and History keeps its three remaining tabs through it.
- `S19`–`S24` move from `/history/weight` and `/history/body` to `/body/weight` and `/body/measurements` and beneath them. The old paths are removed outright; nothing outside this application links to them.
- **Every create path leaves these screens**: no add action on the weigh-in list or the measurement detail, and `/body/weight/new` and `/body/measurements/[typeId]/new` are gone. Correction and deletion stay: a row still opens its entry, which still saves and still deletes through `O01`.
- `S22` keeps creating, renaming, and deleting measurement types, and loses its unit block; `cm` appears in the label under each measurement's name on the list, the detail, and the entry screen.
- History drops its Weight and Body tabs and keeps Workouts, Exercises, and Splits.
- Every spec the move invalidates is corrected in the same commit: the foundation spec's four-destination assertion, the `T-046` route inventory and its fixture map, the `T-045` fixture, and the weight, body, and Today specs that navigate to the old paths.

## Out of scope

- The Today measurement card and sheet, owned by `T-053`
- Any change to derivation, weekly rules, charts, or storage
- Retrospective creation, which `T-051` removed by decision
- The Workouts, Exercises, and Splits subsections beyond losing two siblings

## Acceptance criteria

- [ ] The bottom navigation offers five destinations, each at least 44 by 44, and Body marks itself current on every route beneath `/body`.
- [ ] `/body` opens on Weight; both tabs mark the current one without relying on color.
- [ ] The Weight tab keeps the latest weigh-in, the weekly average, change and `n/7`, the change from the previous weigh-in, the chart, and the full list — and offers no way to create one.
- [ ] A weigh-in and a measurement entry can still be corrected and deleted, each through `O01` for deletion.
- [ ] `S22` still creates, renames, and deletes types, and no screen states the unit outside a measurement's label.
- [ ] History offers exactly Workouts, Exercises, and Splits, and no route under `/history/weight` or `/history/body` resolves.
- [ ] The whole browser suite passes, including the `T-046` sweep whose route inventory this changes.

## Traceability

- MVP criteria: `MVP-REL-002`, `MVP-HIS-001`, `MVP-WGT-001`, `MVP-BOD-001`, `MVP-BOD-002` as `T-051` revises them; must not weaken `MVP-WGT-002`–`003`, `MVP-BOD-003`–`004`, `MVP-UX-001`–`003`
- ADRs: `ADR-0030`, [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md)

## Dependencies and blockers

- Dependencies: `T-051` `Done`, so the criteria describe what this builds
- Blockers: the `F-015` go-ahead
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation's route surface and shell section, the mobile IA document's destination list, the wireframe decisions for the moved screens, the weight-and-body product document, this Task, `F-015`, `M-002`, registry, dashboard, project state
- Documentation that should remain unchanged: the derivation rules, the chart contract, and the locked criteria, which `T-051` already revised

## Execution checklist

- [ ] Add the destination to the shell and generalize the subsection tab bar.
- [ ] Move the six routes and delete the two create routes.
- [ ] Remove every add action and keep every correction and deletion path.
- [ ] Move the unit into the label and remove the unit block from `S22`.
- [ ] Reduce the History subsections to three.
- [ ] Correct the foundation spec, the `T-046` inventory and fixtures, the `T-045` fixture, and the weight, body, and Today specs.
- [ ] Update the canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped component suites for the moved screens, and the **whole** browser suite on one worker across both phones — not just the moved specs, because the destination count, the route inventory, and two fixtures change under every other spec. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).
- **Authorized commit:** Not authorized
- **Results:** Not run

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint including the accessibility and dependency-boundary rules, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-052: build the Body destination`
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
- [ ] Dependencies are known and blocking issues resolved
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
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-015` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
