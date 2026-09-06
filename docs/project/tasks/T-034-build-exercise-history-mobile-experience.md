# T-034 — Build Exercise History mobile experience

- **Feature:** `F-008`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 4
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-06T10:17:05+02:00`
- **Started:** `2026-09-06T00:46:12+02:00`
- **Review started:** `2026-09-06T10:17:05+02:00` for the replacement
- **Approval requested:** `2026-09-06T10:06:46+02:00`
- **Approved:** `2026-09-06T10:06:46+02:00` for the superseded delivery; the replacement is not approved
- **Testing started:** `2026-09-06T10:06:46+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** The Owner reviews the replacement. Approving it restarts the complete recorded plan from the beginning.

## Scope

Implement the phone-only Exercises subsection of History on the `T-033` operations, inside the `T-032` shell.

`S15` Exercise History at `/history/exercises`, replacing the placeholder route:

- a searchable list of every exercise with a recorded performance, each row with name, type, latest-performance summary, and a marker when the definition is no longer in the library;
- client-side search over the loaded list with an empty state and a no-results state.

`S16` Exercise progress detail at `/history/exercises/[id]`, where the id is the persistent exercise identity:

- the latest eligible performance;
- PR cards grouped by comparison category, with band categories labelled by direction and strength and never merged;
- a metric selector limited to the metrics meaningful to the exercise's snapshot type, and a range selector for week, month, quarter, year, and all;
- a Recharts chart in a route-local Client Component loaded only on this route, fitted to phone widths, with the textual summary and an accessible data list beside it; lower assistance is presented as progress with a non-color cue;
- the performance list across every split and one-time workout, each entry linking to its `S14` workout, showing its workout-specific note, and marking entries from incomplete workouts as excluded from statistics;
- malformed and unknown identities resolve through the shared not-found boundary.

## Out of scope

- Derivation of PRs, eligibility, or series, owned by `T-033`
- Split subsection screens, owned by `T-036`, and Weight and Body screens, owned by `F-009`
- Editing anything from `S15` or `S16`; corrections happen on `S14`
- Estimated 1RM, RIR/RPE, desktop layouts, hover-only interaction
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] `S15` lists every identity `T-033` returns, filters as the user types, marks deleted definitions, and renders the empty and no-results states.
- [ ] `S16` shows the latest eligible performance and one PR card group per category present in the data, with band direction and strength in the label.
- [ ] The metric selector offers only type-meaningful metrics; the range selector offers week, month, quarter, year, and all; changing either updates the chart, the textual summary, and the accessible list together.
- [ ] Assistance metrics present a lower value as improvement through orientation or labelling plus a non-color cue.
- [ ] Every performance entry links to its workout, and entries from incomplete workouts carry the excluded-from-statistics marker.
- [ ] The chart is never the sole representation of the data, respects reduced motion, and needs no hover.
- [ ] `S15` and `S16` match the accepted `v0.3` structure and chart geometry, reflow from 320 to 430 px, and meet the accepted touch and accessibility behavior.

## Traceability

- MVP criteria: `MVP-HIS-005`, `MVP-HIS-007`, `MVP-HIS-008`, `MVP-HIS-009`, `MVP-HIS-010`; supporting `MVP-HIS-001`, `MVP-HIS-006`, `MVP-EXE-005`, `MVP-UX-001`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-032` Done through approved second replacement `35790c78201f76c0c2cec3c76bddaa8415c9727a`, and `T-033` Done through approved replacement `d1f15d90151d3a7f43786da52dd3c8affc633a11`
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation (first chart component and its data-boundary contract, Exercise History routes), the screen decisions for History Exercises, this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: PR and eligibility definitions, active-workout behavior, weight and body, desktop and post-MVP scope

## Execution checklist

- [x] Implement `S15` with client-side search, the deleted-definition marker, and empty and no-results states.
- [x] Implement `S16` PR card groups, latest performance, and the performance list with workout links and exclusion markers.
- [x] Implement the metric and range selectors and the route-local Recharts component with textual summary and accessible data list, keeping calculations out of presentation. The component receives a finished series and derives nothing; changing a selector asks the server for the next series.
- [x] Wire the not-found boundary and the subsection navigation state. The page resolves the configured time zone before reading, because every trailing range ends on that local date.
- [x] Prepare component tests and a browser scenario for critical flow 8 with structural captures; do not run them. The component suite stubs the chart, because Recharts needs a laid-out container that jsdom does not provide and the browser scenario is where the chart itself is exercised.
- [x] Update canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build with the chart bundle confined to its route, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Passed on `2026-09-06T00:56:00+02:00` with Node.js `24.20.0` and npm `11.19.0`. `npm run check` passed Prettier, ESLint including its accessibility and dependency rules, strict TypeScript, the Next.js `16.3.3` production build with `/history/exercises` and `/history/exercises/[id]` as dynamic routes, the asset checksums, Markdown lint, and every internal link; `git diff --check` was clean. This Task changes no schema, migration, or generated type. No feature test ran. Re-run for the replacement on `2026-09-06T10:17:00+02:00`: `npm run check` passed every step again and `git diff --check` was clean. The replacement changes no schema, migration, or generated type. No feature test ran after the correction.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: the unit command, which carries the new component suite covering `S15` search, its no-results and empty states, the deleted-definition marker, and `S16` category grouping, the lower-is-better cue, the reps-per-load list, the series summary and value list, the selector round trips, and the performance links with their exclusion marker; then the serialized Chromium and WebKit run of `tests/browser/exercise-history.spec.ts` covering `S15` to `S16`, the derived records, the chart summary and values, metric and range changes including an empty range, the link back to `S14`, reflow to 320 px, and two structural captures per platform. Only that spec runs, for the reason recorded in [`T-032`](T-032-build-workout-history-mobile-experience.md) and tracked by [`T-037`](T-037-repair-stale-browser-specs.md). Must not run before Owner approval of the exact commit.
- **Authorized commit:** none currently; the approval of `b5772adb87d244bfc2404481e90f58a4046a7767` was invalidated by the failed verification below
- **Results:** Failed on `2026-09-06T10:15:31+02:00` against exact approved delivery `b5772adb87d244bfc2404481e90f58a4046a7767` in a fresh isolated worktree with Node.js `24.20.0`, npm `11.19.0`, and Vitest `4.1.11`. `npm ci` installed 653 packages with no vulnerabilities and `npm run test:unit` passed **124 of 126 across 17 files**, failing two assertions in the new component suite.

  Both failed for the same reason and both are test-only: `80 kg` appears in two places on `S16`, once in the highest-reps-at-each-load list and once in the chart-values list, and neither list can be addressed on its own, so the queries were ambiguous. The screens behave correctly. The fix names both lists, which also makes them addressable by assistive technology, so it touches the view as well as the test. The approval is invalidated and the browser scenario did not run.

## Recorded scope breach in the approved delivery

Found on `2026-09-06T10:10:00+02:00`, before any test ran.

Exact approved delivery `b5772adb87d244bfc2404481e90f58a4046a7767` contains one file that is not `T-034` scope: `docs/project/tasks/T-038-build-weight-operations.md`, a 151-line `F-009` Task file created by concurrent work in this repository at `2026-09-06T00:52`, minutes before this delivery was committed. It was swept in because the delivery was staged with `git add -A`.

That other work deliberately holds its `F-009` planning uncommitted: `docs/project/features/F-009-weight-and-body-progress.md` carries the `skip-worktree` flag and `T-039` through `T-042` are listed in `.git/info/exclude` under a note that the Owner directed the breakdown be held on `2026-09-06`. `T-038` carried no such protection, so nothing stopped it.

Nothing about the delivered behavior is affected: the file is documentation and every source file in the commit is `T-034` work. The recorded verification would exercise exactly the same code either way. What is affected is the record. [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md) requires a delivery commit to contain its own outcome and the documentation that outcome needs, and the Owner approved this commit on a description that did not mention `T-038`.

The Owner decides between:

- accepting the commit as approved and recording `T-038` as having entered history through it, since the file itself is wanted and the alternative rewrites nothing useful; or
- a replacement delivery that removes `T-038` from the `T-034` scope, which requires the concurrent work to commit it separately so the file is not lost.

The Owner chose the first on `2026-09-06T10:14:11+02:00` by directing the work to continue: exact delivery `b5772adb87d244bfc2404481e90f58a4046a7767` stands as approved, `T-038` entered history through it, and the recorded verification runs against it unchanged. No replacement is required. Every future staging in this Task names its paths explicitly rather than using `git add -A`, because concurrent work shares this working tree.

## Delivery commit

- **Delivery commit SHA:** `b50df7b355bdaf6ab47ad1d763ce537cb0bcbd73` (replacement; supersedes `b5772adb87d244bfc2404481e90f58a4046a7767`)
- **Subject:** `T-034: name the two value lists on the exercise detail`
- **Replacement scope:** an accessible name on each of the two value lists, and the component and browser assertions that ask for them by name; nothing else changed
- **Committed scope:** `S15` with its loading state and client-side search; `S16` with its loading state, category record panels, metric and range selectors, series summary, accessible value list, and performance list; the route-local Recharts progress chart; the prepared component suite and browser scenario; and the mobile UI foundation and wireframe decisions

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T10:17:05+02:00` for the replacement
- **Outcome:** Replacement recommended for approval
- **Findings:** The authorized verification found the two ambiguous list queries, recorded above

## Approval

- **Approved commit:** None; the approval of `b5772adb87d244bfc2404481e90f58a4046a7767` was invalidated by its failed verification
- **Approved by:** Not approved
- **Approved at:** Not approved
- **Approval note:** The Owner approved `b5772adb87d244bfc2404481e90f58a4046a7767` with `potvrda`, and then accepted its recorded scope breach by directing the work to continue. That approval no longer stands: its verification failed, so replacement `b50df7b355bdaf6ab47ad1d763ce537cb0bcbd73` needs a fresh decision.

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
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Exercises subsection delivery within `F-008`; the Owner directed that implementation must not start |
| `2026-09-06T00:46:12+02:00` | User / Owner | `Backlog` | `Ready` | Both dependencies are `Done` and the go-ahead for the whole `F-008` authorizes the dependent screens |
| `2026-09-06T00:46:12+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the Exercise History screens on the `T-033` derivation |
| `2026-09-06T00:56:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Completed `S15`, `S16`, the route-local chart, and the prepared suites; all permitted static checks passed |
| `2026-09-06T00:53:12+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `b5772adb87d244bfc2404481e90f58a4046a7767`; static checks passed and every prepared feature test remains unexecuted |
| `2026-09-06T10:06:46+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-06T10:06:46+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `b5772adb87d244bfc2404481e90f58a4046a7767` with `potvrda` |
| `2026-09-06T10:06:46+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded component and browser verification against the exact approved delivery |
| `2026-09-06T10:17:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Named both value lists and pointed the assertions at them; all permitted static checks passed |
| `2026-09-06T10:17:05+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact replacement `b50df7b355bdaf6ab47ad1d763ce537cb0bcbd73`; it awaits fresh approval before the complete recorded plan restarts |
