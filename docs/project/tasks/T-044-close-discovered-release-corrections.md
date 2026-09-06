# T-044 — Close the two discovered release corrections

- **Feature:** `F-010`
- **Status:** `In Progress`
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T15:40:00+02:00`
- **Started:** `2026-09-06T15:40:00+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Reword the finish review, unify the test-support rule, write `ADR-0029`, and deliver one reviewable commit.

## Scope

Close the two items earlier Tasks discovered and left to the Owner, so the delivered application and its documentation agree before the release sweep reads them.

**The finish review's stale copy.** `src/app/(main)/workout/current/finish/finish-review.tsx` still says `Confirmed sets count toward exercise personal records and charts.` in its completion explanation. [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) removed set confirmation and every other surface says recorded. Reword that one line to the recorded-set wording the rest of the screen uses. `T-037` found it and recorded it as outside its test-only scope.

**One rule for the two test-support routes.** `/test-support/active-workout-durability` is hidden in a production build through `notFound()`; `/test-support/mobile-ui-foundation` has no guard at all. Because the durability harness is production-hidden while the browser suite runs a production server, `T-037` had to start a second development server on `3101` and give that spec its own two Playwright projects. Give both routes one rule: hidden unless an explicit opt-in environment flag is set, set that flag for the browser suite's own production server, and return the suite to one server with two projects. Record the rule as `ADR-0029` and state it in the two architecture documents that describe the harnesses.

## Out of scope

- Any other copy change on the finish review or elsewhere; wording the Owner has not asked to change
- New harness capability, new test-support routes, or changes to what the two harnesses do
- Rewriting browser specs beyond what removing the second server requires
- The `F-010` verification scenarios, owned by `T-045`, `T-046`, and `T-047`

## Acceptance criteria

- [ ] The finish review names recorded sets, and no application screen says `confirmed` of a set.
- [ ] Both test-support routes resolve to the not-found boundary in a production build without the opt-in flag, and both render with it.
- [ ] `npm run test:browser` runs every spec, including the durability spec, against one production server; the second `webServer` entry and the `durability-chromium` and `durability-webkit` projects are gone.
- [ ] The complete browser suite passes on mobile Chromium and mobile WebKit.
- [ ] `ADR-0029` records the rule, and [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md) and [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md) state it where they describe each harness.
- [ ] The `T-037` open item is recorded as closed.

## Traceability

- MVP criteria: `MVP-WRK-011` (the finish review's copy); no criterion governs the test-support routes, which are test infrastructure
- ADRs: [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md), and new `ADR-0029` for the test-support visibility rule
- Canonical documents: [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../product/workouts.md`](../../product/workouts.md)

## Dependencies and blockers

- Dependencies: `T-037` `Done`, which recorded both items
- Blockers: the `F-010` go-ahead; readiness answers 5 and 6 were accepted on `2026-09-06`, so the wording and the one-rule guard are decided
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `ADR-0029` (new), the two architecture documents, [`../../decisions/README.md`](../../decisions/README.md), this Task, `F-010`, registry, dashboard, project state; the wireframe decisions only if the finish-review wording is quoted there
- Documentation that should remain unchanged: the locked criteria text, ADR-0027 itself, `T-037`'s completed record

## Execution checklist

- [ ] Reword the finish-review line and check no other surface still says `confirmed` of a set.
- [ ] Add the opt-in guard to both test-support routes behind one shared helper.
- [ ] Set the flag for the browser suite's production server, drop the development server and the two durability projects, and repoint the durability spec.
- [ ] Write `ADR-0029` and state the rule in the two architecture documents.
- [ ] Prepare the finish-review component assertion; do not run it.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`; confirm the production build still lists both test-support routes without exposing them
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the finish-review component assertion on the corrected copy, and the whole browser suite on one server across mobile Chromium and mobile WebKit, because the harness rule changes how every spec is served; plus one negative check that both test-support routes are not found in a production build without the flag. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-044: close the two discovered release corrections`
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
- [x] Dependencies are known; readiness answers 5 and 6 are accepted and only the go-ahead remains
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
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | User / Owner | `Backlog` | `Backlog` | Accepted readiness answers 5 and 6: the finish review is reworded and both test-support routes take one opt-in visibility rule recorded as `ADR-0029` |
| `2026-09-06T15:40:00+02:00` | Claude Code primary agent / Executor | `Backlog` | `In Progress` | `T-049` is `Done`, so the documentation agrees with the application again and the two delivered corrections can follow |
