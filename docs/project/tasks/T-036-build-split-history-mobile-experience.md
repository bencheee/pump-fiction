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
- **Updated:** `2026-09-06T10:50:32+02:00`
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

- [ ] Implement `S17` with the program filter, identity-based rows, and empty and no-results states.
- [ ] Implement `S18` aggregates, exclusion explanation, and the workout list with links.
- [ ] Implement the range selector and the route-local Recharts duration chart with textual summary and accessible data list, keeping calculations out of presentation.
- [ ] Wire the not-found boundary and the subsection navigation state.
- [ ] Prepare component tests and a serialized Chromium/WebKit scenario for critical flow 8 (`S17` to `S18` with chart and list) with structural captures; do not run them.
- [ ] Update canonical UI documentation, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency and accessibility rules, strict TypeScript, production build with the chart bundle confined to its route, UI asset checksums, Markdown lint, internal links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: the scoped component suite (`S17` filter and separation of same-named splits; `S18` aggregates, range changes, summary and list synchronization, exclusion explanation) and the serialized one-worker Chromium and WebKit phone scenario covering `S17` to `S18`, range changes, workout links, reflow, and structural captures. Must not run before Owner approval of the exact commit.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-036: build Split History screens`
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
