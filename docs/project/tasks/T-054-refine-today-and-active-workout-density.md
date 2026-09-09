# T-054 — Refine Today and active-workout density

- **Feature:** `F-016`
- **Status:** `Awaiting Approval`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-09-09T11:50:00+02:00`
- **Updated:** `2026-09-09T12:37:00+02:00`
- **Started:** `2026-09-09T11:50:00+02:00`
- **Review started:** `2026-09-09T12:37:00+02:00` for replacement
- **Approval requested:** `2026-09-09T12:37:00+02:00` for replacement
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Owner reviews and approves or rejects replacement delivery `5379fd83ac295df9abe1b385854b168338543718`; feature tests remain locked until approval.

## Scope

Deliver the Owner's Today split preview and compact active-workout card presentation in one reviewable commit, preserving the existing command behavior and destructive confirmations.

## Out of scope

- Changes to workout persistence, rotation, set validation, history, or the finish flow.
- Desktop layout work or new workout features.

## Acceptance criteria

- [x] Today lists every exercise in the selected planned split directly beneath Start Workout, in split order.
- [x] Exercise cards start collapsed; only one expands at a time and it aligns to the top of the workout content viewport.
- [x] Exercise move and remove icons are visually smaller and share the title row's upper-right edge.
- [x] Last time includes the date in its heading and lists sets one per row using reps-first notation.
- [x] Each set uses one horizontal row for its number, applicable inputs, compact addition action, and icon-only removal; populated removal still confirms.
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
- Results: The first delivery passed its available checks at `2026-09-09T12:03:00+02:00`. The replacement repeated them at `2026-09-09T12:34:00+02:00`: Prettier, ESLint, strict TypeScript, the production build, UI asset checks, Markdown lint, and `git diff --check` passed. On both runs, only the final internal-link command could not start because the environment has no `lychee` executable (`sh: lychee: command not found`). No feature test was run.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable.
- **Planned tests:** After approval of the exact delivery commit, run the Today and active-workout component tests and the corresponding Chromium/WebKit browser scenarios; expand to the whole browser suite if those expose shared-shell effects.
- **Authorized commit:** Not authorized.
- **Results:** Not run.

## Delivery commit

- **Delivery commit SHA:** `7c29e9a6c147f8f516bdc6a32be9636ad297f847`
- **Replacement delivery SHA:** `5379fd83ac295df9abe1b385854b168338543718`
- **Subject:** `T-054: compact sets into an exercise accordion`
- **Committed scope:** The first delivery plus the Owner's in-scope revision: all exercise cards start collapsed in a controlled single-open accordion; opening one closes the prior card and aligns the new card below the sticky header; each set is one compact horizontal row with its number, applicable 32-pixel fields, compact optional-addition control, and final removal X; band strength uses a compact labelled select.

## Review

- **Reviewer:** Codex primary agent
- **Reviewed at:** `2026-09-09T12:37:00+02:00`
- **Outcome:** Recommended for approval.
- **Findings:** The replacement resolves the Owner's four review points. The optional per-set addition remains available as a compact named icon so the one-row layout does not remove behavior. Static checks pass except for unavailable `lychee`; no feature test or post-change browser inspection ran.

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
| `2026-09-09T12:05:00+02:00` | Codex primary agent / Executor and Reviewer | `In Progress` | `Awaiting Approval` | Delivered and reviewed exact commit `7c29e9a6c147f8f516bdc6a32be9636ad297f847`; permitted static checks passed except unavailable `lychee`, and no feature test ran. |
| `2026-09-09T12:25:00+02:00` | User / Owner | `Awaiting Approval` | `In Progress` | Requested an in-scope replacement: one horizontal row per set, all exercise cards initially collapsed, only one expanded at a time, and the opened card aligned to the viewport. |
| `2026-09-09T12:37:00+02:00` | Codex primary agent / Executor and Reviewer | `In Progress` | `Awaiting Approval` | Delivered and reviewed replacement `5379fd83ac295df9abe1b385854b168338543718`; available static checks passed and feature tests remain locked. |
