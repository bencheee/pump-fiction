# T-036 — Build Split History mobile experience

- **Feature:** `F-008`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 6
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-06T10:54:05+02:00`
- **Started:** `2026-09-06T10:50:32+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the recorded scope, run only the permitted static checks, and deliver one reviewable commit for the Owner's one approval under ADR-0028.

## Scope

Implement the phone-only Splits subsection of History on the `T-035` operations, inside the `T-032` shell.

`S17` Split History at `/history/splits`, replacing the placeholder route:

- a program filter over the programs present in the data;
- the split list by persistent identity, each row with program name, split name, completed-workout count, average duration, and latest performance date, with an empty state and a no-results state for the filter.

`S18` Split progress detail at `/history/splits/[id]`, where the id is the persistent split identity:

- completed count, total, average, shortest, longest, and latest duration;
- a range selector for week, month, quarter, year, and all;
- a Recharts duration chart in a route-local Client Component loaded only on this route, with the textual summary and an accessible data list beside it, reusing the chart contract `T-034` established;
- the completed workout list, each entry linking to its `S14` workout;
- an explanation that one-time and incomplete workouts are excluded;
- malformed and unknown identities resolve through the shared not-found boundary.

## Out of scope

- Derivation of aggregates or series, owned by `T-035`
- Exercise subsection screens, owned by `T-034`, and Weight and Body screens, owned by `F-009`
- Any template action such as Set as Next, which belongs to Programs
- Desktop layouts and hover-only interaction
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] `S17` lists every split identity `T-035` returns, filters by program, keeps same-named splits from different programs as separate rows, and renders the empty and no-results states.
- [ ] `S18` shows all six aggregates and the exclusion explanation, and each workout entry links to its `S14` workout.
- [ ] Changing the range updates the chart, the textual summary, and the accessible list together.
- [ ] The chart is never the sole representation of the data, respects reduced motion, and needs no hover.
- [ ] `S17` and `S18` match the accepted `v0.3` structure and chart geometry, reflow from 320 to 430 px, and meet the accepted touch and accessibility behavior.

## Traceability

- MVP criteria: `MVP-HIS-011`; supporting `MVP-HIS-001`, `MVP-HIS-006`, `MVP-UX-001`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-032`, `T-034`, and `T-035` Done; the chart contract `T-034` introduced is reused
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the mobile UI foundation (Split History routes and any promoted chart primitive), the screen decisions for History Splits, this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: split statistics definitions, rotation and template behavior, weight and body, desktop and post-MVP scope

## Execution checklist

- [x] Implement `S17` with the program filter, identity-based rows, and empty and no-results states. The filter appears only when more than one program has a completed split.
- [x] Implement `S18` aggregates, exclusion explanation, and the workout list with links.
- [x] Implement the range selector and the duration chart with textual summary and accessible data list, keeping calculations out of presentation. The chart component moved from the exercise route to `src/features/history/ui/progress-chart.tsx` so both subsections share it, and it takes an axis-label formatter so durations read in minutes while their values stay in seconds.
- [x] Wire the not-found boundary and the subsection navigation state.
- [x] Prepare component tests and a browser scenario for critical flow 8 with structural captures; do not run them. The component suite stubs the chart for the same reason `T-034` did.
- [x] Update canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build with the chart bundle confined to its route, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Passed on `2026-09-06T10:54:05+02:00` with Node.js `24.20.0` and npm `11.19.0`. `npm run check` passed Prettier, ESLint including its accessibility and dependency rules, strict TypeScript, the Next.js `16.3.3` production build with `/history/splits` and `/history/splits/[id]` as dynamic routes, the asset checksums, Markdown lint, and every internal link; `git diff --check` was clean. This Task changes no schema, migration, or generated type. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: the unit command, which carries the new component suite covering the `S17` program filter with same-named splits kept apart, the deleted-split marker, the empty state, and the `S18` six statistics, exclusion rule, series summary and named value list, range round trip, and workout links; then the serialized Chromium and WebKit run of `tests/browser/split-history.spec.ts` covering `S17` to `S18`, the statistics, the chart summary and values, the empty week range and the return to all, the link back to `S14`, reflow to 320 px, and two structural captures per platform. Only that spec runs, for the reason recorded in [`T-032`](T-032-build-workout-history-mobile-experience.md) and tracked by [`T-037`](T-037-repair-stale-browser-specs.md). Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Recorded by the evidence commit that follows this delivery
- **Subject:** `T-036: build Split History screens`
- **Committed scope:** `S17` with its loading state and program filter; `S18` with its loading state, six stat cards, range selector, series summary, named value list, exclusion rule, and workout links; the chart component promoted to `src/features/history/ui` with its formatter and its two updated importers; the prepared component suite and browser scenario; and the mobile UI foundation and wireframe decisions

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
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the Splits subsection delivery within `F-008`; the Owner directed that implementation must not start |
| `2026-09-06T10:50:32+02:00` | User / Owner | `Backlog` | `Ready` | Every dependency is `Done` and the go-ahead for the whole `F-008` authorizes the last screens |
| `2026-09-06T10:50:32+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the Split History screens on the `T-035` derivation |
