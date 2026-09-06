# T-052 — Build the Body destination

- **Feature:** `F-015`
- **Status:** `Done`
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T21:04:00+02:00`
- **Started:** `2026-09-06T19:56:00+02:00`
- **Review started:** `2026-09-06T20:34:00+02:00`
- **Approval requested:** `2026-09-06T20:34:00+02:00`
- **Approved:** `2026-09-06T20:42:00+02:00`
- **Testing started:** `2026-09-06T20:42:00+02:00`
- **Completed:** `2026-09-06T21:04:00+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-052` is `Done`. `T-053` restores entry on Today.

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

- [x] The bottom navigation offers five destinations, each at least 44 by 44, and Body marks itself current on every route beneath `/body`.
- [x] `/body` opens on Weight; both tabs mark the current one without relying on color.
- [x] The Weight tab keeps the latest weigh-in, the weekly average, change and `n/7`, the change from the previous weigh-in, the chart, and the full list — and offers no way to create one.
- [x] A weigh-in and a measurement entry can still be corrected and deleted, each through `O01` for deletion.
- [x] `S22` still creates, renames, and deletes types, and no screen states the unit outside a measurement's label.
- [x] History offers exactly Workouts, Exercises, and Splits, and no route under `/history/weight` or `/history/body` resolves.
- [x] The whole browser suite passes, including the `T-046` sweep whose route inventory this changes.

## Traceability

- MVP criteria: `MVP-REL-002`, `MVP-HIS-001`, `MVP-WGT-001`, `MVP-BOD-001`, `MVP-BOD-002` as `T-051` revises them; must not weaken `MVP-WGT-002`–`003`, `MVP-BOD-003`–`004`, `MVP-UX-001`–`003`
- ADRs: `ADR-0030`, [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md)

## Dependencies and blockers

- Dependencies: `T-051` `Done`, so the criteria describe what this builds
- Blockers: None; `T-051` is `Done` and the criteria describe what this builds
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation's route surface and shell section, the mobile IA document's destination list, the wireframe decisions for the moved screens, the weight-and-body product document, this Task, `F-015`, `M-002`, registry, dashboard, project state
- Documentation that should remain unchanged: the derivation rules, the chart contract, and the locked criteria, which `T-051` already revised

## Execution checklist

- [x] Add the destination to the shell and generalize the subsection tab bar.
- [x] Move the six routes and delete the two create routes.
- [x] Remove every add action and keep every correction and deletion path.
- [x] Move the unit into the label and remove the unit block from `S22`.
- [x] Reduce the History subsections to three.
- [x] Correct the foundation spec, the `T-046` inventory and fixtures, the `T-045` fixture, and the weight, body, and Today specs.
- [x] Update the canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the scoped component suites for the moved screens, and the **whole** browser suite on one worker across both phones — not just the moved specs, because the destination count, the route inventory, and two fixtures change under every other spec. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).
- **Authorized commit:** `c7daf2154aa36097bd0a17034ad3a81fed0c7bff`
- **Results:** Four runs against exact approved delivery `c7daf2154aa36097bd0a17034ad3a81fed0c7bff` and its inherited replacements, each in a fresh isolated worktree after a clean `supabase db reset`, with Node.js `22.21.0`, npm `10.9.4`, Vitest `4.1.11`, and Playwright `1.62.1`. Unit passed **237/237 across 26 files** and components **4/4** on the first run and were not disturbed again. Every browser failure was in a spec, none in the application.

  **First run, 46 of 52.** The path rewrite had replaced `/history/weight` and `/history/body` wherever they appeared as strings and missed the four places they appear inside a regular expression, where each slash is escaped; and the weight scenario's third seeded weigh-in falls in the next calendar week, so the weekly-average list carries two rows and an unscoped match hit strict mode. Replacement `209124f4` corrects both.

  **Second run, 49 of 52.** The Body scenario still read the second seeded entry as the latest when the third now is, and one WebKit active-workout test failed once and never again — it passed in isolation immediately and in all three later full runs, so it is recorded as a one-off rather than explained away. Replacement `461746ae` corrects the list assertion.

  **Third run, 50 of 52.** The chart sentence names how many entries it draws and still said two. Replacement `109d2a0d3a1155620b4971ea8767561165e584ec` corrects it.

  **Fourth run: 52/52 in 2.4 minutes**, 26 on mobile Chromium and 26 on mobile WebKit, against one production server. The database afterwards was identical to a fresh seed — 10 exercises, 1 program, 3 splits, and no workout, weight, measurement-type or measurement-entry rows.

  Every one of the four faults was the same shape: a scenario that still described the screens as they were before the move. That is what the move was expected to break, and each was corrected in the tests rather than worked around in the application.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint including the accessibility and dependency-boundary rules, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Passed on `2026-09-06T20:34:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint including the dependency-boundary and accessibility rules, strict TypeScript, the production build, the UI asset checksums, Markdown lint, and all 1511 internal links. `git diff --check` was clean. The build lists the eight `/body` routes and three History subsections and no `/history/weight` or `/history/body` route survives. The route-inventory cross-check ran directly against the filesystem: 28 routes, 28 fixtures, nothing uncovered and nothing stale. No feature test ran; the unit suite was left to the authorized run.

## Delivery commit

- **Delivery commit SHA:** `c7daf2154aa36097bd0a17034ad3a81fed0c7bff`
- **Subject:** `T-052: build the Body destination`
- **Committed scope:** the fifth destination in `shell.tsx`; `src/shared/ui/subsection-navigation.tsx` extracted from the History bar and used by both destinations; `/body` with its layout, its tab bar, and its redirect to Weight; six routes moved from `/history/weight` and `/history/body`; the two create routes deleted; the add actions removed from `S19` and `S23`; the unit moved into the name hint and the detail label; History reduced to three tabs; the foundation spec, the `T-046` inventory and fixtures, the `T-045` fixture, and the weight, body, workout-history, and Today specs; the mobile UI foundation and wireframe decisions; this Task.

## Recorded decisions

- the destination opens on Weight through a redirect at `/body`, so the bottom navigation has one href and the tab bar owns which tab is current;
- the History tab bar became `SubsectionNavigation` in `src/shared/ui` rather than being copied: one bar, two destinations, and the `aria-current` and underline behavior stays in one place;
- the weight and measurement specs now seed three rows instead of two, because the screen they exercise can no longer add the third. Per-date uniqueness moved out of the browser scenarios with the forms that used to demonstrate it; it is the database's rule and its pgTAP suite still covers it;
- `formatHistoryDate` stays in `src/app/(main)/history/history-presentation.ts` and Body imports it. It is a plain local-date formatter with no History semantics, and moving it would touch five History files for a naming improvement. Worth doing when something else opens that module; recorded here rather than swept in.

## Replacements

Three, all test source, all inheriting the Task approval under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md):

| SHA | Corrects |
| --- | --- |
| `209124f457c6352b79329f0d7af82b6d542c4028` | The four escaped paths a string rewrite missed, and the second weekly average the third seed creates |
| `461746ae2223841bfdd522cbf0c1a5f27064e2ee` | The list row assertion, which named the second seeded entry when the third is now latest |
| `109d2a0d3a1155620b4971ea8767561165e584ec` | The chart sentence, which still said two entries |

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T20:34:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** The move is mechanical but the deletions are not: `S19` and `S23` lose their add actions and two routes disappear, so the only way to record a value between this Task and `T-053` is nothing at all. That gap is deliberate and short — `T-053` restores entry on Today — but it is real, and the Owner should know the application is briefly unable to record a weigh-in if they run it in between.

## Approval

- **Approved commit:** `c7daf2154aa36097bd0a17034ad3a81fed0c7bff`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T20:42:00+02:00`
- **Approval note:** Approved (`nastavi`), which authorizes the unit, component, and whole-browser-suite verification against this exact tree. Replacements within scope inherit it under ADR-0028.

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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed, or approved no-test reason is recorded
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-015` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T19:56:00+02:00` | Claude Code primary agent / Executor | `Backlog` | `In Progress` | `T-051` is `Done`, so the destination is built against criteria that describe it |
| `2026-09-06T20:34:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered the destination, the move, and every spec it invalidated; static checks passed and no feature test ran |
| `2026-09-06T20:42:00+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved exact delivery `c7daf2154aa36097bd0a17034ad3a81fed0c7bff` (`nastavi`) |
| `2026-09-06T20:42:00+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | The whole suite runs, because the destination count and the route inventory changed under every spec |
| `2026-09-06T21:04:00+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | The whole browser suite passed 52/52 against inherited replacement `109d2a0d3a1155620b4971ea8767561165e584ec`, with unit 237/237, components 4/4, and a database identical to its baseline |
