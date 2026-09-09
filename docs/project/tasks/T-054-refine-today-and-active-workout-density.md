# T-054 — Refine Today and active-workout density

- **Feature:** `F-016`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-09-09T11:50:00+02:00`
- **Updated:** `2026-09-09T12:04:00+02:00`
- **Started:** `2026-09-09T11:50:00+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the documented Today preview and active-workout presentation, then run static checks only.

## Scope

Deliver the Owner's Today split preview and compact active-workout card presentation in one reviewable commit, preserving the existing command behavior and destructive confirmations.

## Out of scope

- Changes to workout persistence, rotation, set validation, history, or the finish flow.
- Desktop layout work or new workout features.

## Acceptance criteria

- [x] Today lists every exercise in the selected planned split directly beneath Start Workout, in split order.
- [x] Every exercise card is independently collapsible, starts expanded, and has no drag handle.
- [x] Exercise move and remove icons are visually smaller and share the title row's upper-right edge.
- [x] Last time includes the date in its heading and lists sets one per row using reps-first notation.
- [x] A set's addition and icon-only remove actions share the Set title row; populated removal still confirms.
- [x] Exercise notes are yellow, set inputs are 32 px tall, and Add Set is borderless green text aligned right.

## Traceability

- MVP criteria: `MVP-TOD-001`, `MVP-WRK-002`, `MVP-WRK-003`, `MVP-WRK-006`, `MVP-WRK-008`, `MVP-WRK-009`, `MVP-UX-001`–`003`
- ADRs: `ADR-0020`, `ADR-0025`, `ADR-0027`
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md)

## Dependencies and blockers

- Dependencies: `F-007`, `F-011`, and `F-014` are `Done`.
- Blockers: None.
- Blocked from status: Not blocked.

## Documentation impact

- Documents to create or update: product overview, workouts, wireframe decisions, mobile UI foundation, `M-003`, `F-016`, this Task, registry, dashboard, and project state.
- Documentation that should remain unchanged: persistence architecture, database schema, rotation rules, History, Body, and the frozen design package.

## Execution checklist

- [x] Inspect the existing Today and active-workout screens through Playwright at 390 × 844.
- [x] Load split prescriptions beside the Today aggregate and render the selected split's exercise preview.
- [x] Refactor active-workout exercise and set presentation without changing command behavior.
- [x] Update affected component and browser specifications without running them.
- [x] Update canonical documentation and run permitted static checks.

## Static-check plan and results

- Planned checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run docs:lint`, `npm run links:internal`, and `git diff --check`.
- Results: On `2026-09-09T12:03:00+02:00`, Prettier, ESLint, strict TypeScript, the production build, UI asset checks, and Markdown lint all passed through `npm run check`; `git diff --check` also passed. The final internal-link step could not start because the environment has no `lychee` executable (`sh: lychee: command not found`). No feature test was run.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable.
- **Planned tests:** After approval of the exact delivery commit, run the Today and active-workout component tests and the corresponding Chromium/WebKit browser scenarios; expand to the whole browser suite if those expose shared-shell effects.
- **Authorized commit:** Not authorized.
- **Results:** Not run.

## Delivery commit

- **Delivery commit SHA:** Not created.
- **Subject:** `T-054: refine today and active workout density`
- **Committed scope:** Not created.

## Review

- **Reviewer:** Codex primary agent
- **Reviewed at:** Not reviewed.
- **Outcome:** Not reviewed.
- **Findings:** None recorded.

## Approval

- **Approved commit:** Not approved.
- **Approved by:** Not approved.
- **Approved at:** Not approved.
- **Approval note:** Not approved.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set.
- [x] Scope and out-of-scope are clear.
- [x] Acceptance criteria are observable.
- [x] MVP criteria, ADRs, and canonical documents are linked.
- [x] Executor and Reviewer are named.
- [x] Dependencies are known and blocking issues resolved.
- [x] Documentation impact and execution checklist are defined.
- [x] Static-check plan is defined.
- [x] `test_required` and an unexecuted plan are recorded.
- [x] Scope fits one independently reviewable delivery commit.
- [x] Owner confirmed transition to `Ready` through the implementation request on `2026-09-09`.

## Definition of Done

- [ ] Reviewer recommends approval.
- [ ] User approved the exact commit SHA.
- [ ] Scope and acceptance criteria are satisfied.
- [ ] Canonical documentation and required ADRs are current.
- [ ] Authorized feature tests passed.
- [ ] Static checks and all evidence are recorded.
- [ ] Dashboard, registry, and parent progress are current.
- [ ] Follow-up scope has separate Tasks.
- [ ] Audit history is complete.

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-09T11:50:00+02:00` | User / Owner | — | `Ready` | The implementation request defines the observable scope and releases it for work. |
| `2026-09-09T11:50:00+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began with the requested Playwright inspection of the approved current application. |
