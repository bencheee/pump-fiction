# T-044 — Close the two discovered release corrections

- **Feature:** `F-010`
- **Status:** `Awaiting Approval`
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T15:54:00+02:00`
- **Started:** `2026-09-06T15:40:00+02:00`
- **Review started:** `2026-09-06T15:52:00+02:00`
- **Approval requested:** `2026-09-06T15:52:00+02:00`
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** The Owner's approval of the exact delivery commit, which authorizes the prepared verification.

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

- [x] Reword the finish-review line and check no other surface still says `confirmed` of a set.
- [x] Add the opt-in guard to both test-support routes behind one shared helper.
- [x] Set the flag for the browser suite's production server, drop the development server and the two durability projects, and repoint the durability spec.
- [x] Write `ADR-0029` and state the rule in the two architecture documents.
- [x] Prepare the finish-review component assertion; do not run it.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`; confirm the production build still lists both test-support routes without exposing them
- Results: Passed on `2026-09-06T15:52:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint including the dependency-boundary rules, strict TypeScript, the production build, the UI asset checksums, Markdown lint across 131 files, and all 1389 internal links. `git diff --check` was clean. The build lists both `/test-support/active-workout-durability` and `/test-support/mobile-ui-foundation` as dynamic (`f`), which is what lets one build serve the suite with the flag and an ordinary run without it. No feature test ran: the unit and component assertions are prepared and unexecuted.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the unit suite, which now includes the four `isTestSupportEnabled` cases; the finish-review component assertion on the corrected copy; and the whole browser suite on one server across mobile Chromium and mobile WebKit, because the harness rule changes how every spec is served. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).

  The plan promised one more check than the arrangement can perform. A browser negative check that both routes are not found *without* the flag would need a second server started without it — the two-server arrangement this Task removes. The rule is covered instead where it actually lives: the four unit cases pin the helper, including that `true`, `0`, `yes`, and an empty string all keep the routes hidden, and both pages call that helper as their first statement.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `f2a46162b80e747c369e42e4c4e49854ae72cc42`
- **Subject:** `T-044: close the two discovered release corrections`
- **Committed scope:** the finish-review explanation bullet; `src/shared/routing/test-support-route.ts` with its unit suite; the opt-in guard and `force-dynamic` on both test-support pages; `playwright.config.ts` back to one server, one `baseURL`, and two projects; `ADR-0029` and its registry row; the harness rule in the durability and mobile-UI-foundation documents; one prepared component assertion; this Task.

## Discovered, not delivered

`apply-active-workout-command.test.ts:131` names a case `rejects incomplete confirmed sets and unconfirmed populated removal payloads only when malformed`, while the case actually rejects a malformed `update_set` payload — negative kilograms and zero reps — and has nothing to do with confirmation. It is the same ADR-0027 leftover as the finish-review sentence, but it is a unit-test name rather than the finish-review copy this Task's confirmed scope names, so it is reported rather than swept in. One line, no behavior. The Owner decides whether it joins a later Task.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T15:52:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** The guard is one shared helper called first in both pages, so a third harness cannot acquire a third rule by omission, which is the failure ADR-0029 closes. Both routes are `force-dynamic`, so the flag is a runtime switch rather than a build-time bake. The `mobile-ui-foundation` harness was undocumented until now, which is part of why the two rules diverged.

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
| `2026-09-06T15:52:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered both corrections and `ADR-0029`; static checks passed, the assertions are prepared and unexecuted, and one further ADR-0027 leftover is reported rather than swept in |
