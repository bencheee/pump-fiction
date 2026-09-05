# T-034 — Build Exercise History mobile experience

- **Feature:** `F-008`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 4
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-06T00:56:00+02:00`
- **Started:** `2026-09-06T00:46:12+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the recorded scope, run only the permitted static checks, and deliver one reviewable commit for the Owner's review.

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
- Results: Passed on `2026-09-06T00:56:00+02:00` with Node.js `24.20.0` and npm `11.19.0`. `npm run check` passed Prettier, ESLint including its accessibility and dependency rules, strict TypeScript, the Next.js `16.3.3` production build with `/history/exercises` and `/history/exercises/[id]` as dynamic routes, the asset checksums, Markdown lint, and every internal link; `git diff --check` was clean. This Task changes no schema, migration, or generated type. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: the unit command, which carries the new component suite covering `S15` search, its no-results and empty states, the deleted-definition marker, and `S16` category grouping, the lower-is-better cue, the reps-per-load list, the series summary and value list, the selector round trips, and the performance links with their exclusion marker; then the serialized Chromium and WebKit run of `tests/browser/exercise-history.spec.ts` covering `S15` to `S16`, the derived records, the chart summary and values, metric and range changes including an empty range, the link back to `S14`, reflow to 320 px, and two structural captures per platform. Only that spec runs, for the reason recorded in [`T-032`](T-032-build-workout-history-mobile-experience.md) and tracked by [`T-037`](T-037-repair-stale-browser-specs.md). Must not run before Owner approval of the exact commit.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Recorded by the evidence commit that follows this delivery
- **Subject:** `T-034: build Exercise History screens`
- **Committed scope:** `S15` with its loading state and client-side search; `S16` with its loading state, category record panels, metric and range selectors, series summary, accessible value list, and performance list; the route-local Recharts progress chart; the prepared component suite and browser scenario; and the mobile UI foundation and wireframe decisions

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
