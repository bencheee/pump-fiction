# T-053 — Add today's measurement entry

- **Feature:** `F-015`
- **Status:** `In Progress`
- **Horizon:** `Next`
- **Order:** 3
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T21:04:00+02:00`
- **Started:** `2026-09-06T21:04:00+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Build the card and its sheet, and deliver one reviewable commit.

## Scope

The entry path Body gave up, on the screen the Owner chose for it.

- Today gains a `Body measurements` card beside the weight card. It appears while at least one defined measurement has no value for the local date, and names which are missing.
- Its action opens one sheet that takes **every** missing measurement at once, each with its `cm` label, a decimal keyboard, and inline announced validation. Saving writes them together and returns to Today.
- Once nothing is missing, the card shows today's recorded values with a link to Body and no create control — the shape `MVP-TOD-004` already established for weight, and the Owner's answer 2.
- The card is absent entirely when no measurement type is defined, because there is nothing to ask for.
- The sheet is fixed to the local date, as `S04` is: a value for another day is a correction and belongs in Body.

## Out of scope

- The Body destination itself, owned by `T-052`
- The weight card, which `T-040` delivered and which this sits beside unchanged
- Defining, renaming, or deleting measurement types, which stay in Body
- Any change to how a measurement is stored or derived

## Acceptance criteria

- [ ] The card appears while a defined measurement lacks today's value, names the missing ones, and disappears when a type is defined but all are recorded.
- [ ] No card appears when no measurement type exists.
- [ ] The sheet takes every missing measurement in one save, refuses an invalid value inline, and announces the refusal.
- [ ] After saving, Today shows today's values with a link to Body and offers no second create path.
- [ ] A value for another date is reachable only through Body, and the sheet offers no date field.
- [ ] Today's existing behavior is unchanged: the proposed workout, the weight card, and the current-workout card all still read as they did.

## Traceability

- MVP criteria: the Today measurement criterion `T-051` adds, beside `MVP-TOD-004`; supporting `MVP-BOD-001`, `MVP-BOD-002`, `MVP-BOD-004`, `MVP-UX-001`–`003`
- ADRs: `ADR-0030`, [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Dependencies and blockers

- Dependencies: `T-051` `Done` for the criterion, `T-052` `Done` for the destination the card links to
- Blockers: None; `T-052` is `Done` and the application records no value at all until this lands
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the Today section of the overview, the weight-and-body product document, the wireframe decisions for `S01` and the new sheet, this Task, `F-015`, `M-002`, registry, dashboard, project state
- Documentation that should remain unchanged: the derivation rules and everything `T-052` settled about Body

## Execution checklist

- [ ] Read which measurements lack today's value beside the Today aggregate, as `T-040` reads the weigh-in, leaving `TodayView` untouched.
- [ ] Build the card and its one sheet with per-measurement validation and a single save.
- [ ] Build the recorded state with its link to Body.
- [ ] Prepare the component tests and the Today browser scenario; do not run them.
- [ ] Update canonical documentation, run only permitted static checks, and deliver one reviewable commit.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the Today component suite covering the missing, partial, recorded, and no-type-defined states and the sheet's validation, and the Chromium and WebKit Today scenario with structural captures. The scenario seeds and removes its own measurement types. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).
- **Authorized commit:** Not authorized
- **Results:** Not run

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint including the accessibility and dependency-boundary rules, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-053: add today's measurement entry`
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
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
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
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-015` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T21:04:00+02:00` | Claude Code primary agent / Executor | `Backlog` | `In Progress` | `T-052` removed every create path, so this restores entry where the Owner chose to put it |
