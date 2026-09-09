# T-055 — Compact and accelerate the workout flow

- **Feature:** `F-017`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-09-09T13:17:18+02:00`
- **Updated:** `2026-09-09T14:04:50+02:00`
- **Started:** `2026-09-09T13:17:18+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Create the delivery commit, review it against this Task and the canonical documents, and request Owner approval without running feature tests.

## Scope

Deliver the Owner's compact active-workout header, disclosure, and finish-review interaction together with the bounded application-side latency corrections for Today, Start Workout, and Review & Finish.

## Out of scope

- Changes to set recording, finish outcomes, active-workout durability, rotation, History, or hosted infrastructure.
- A general performance audit of every application route.
- Desktop layout work.

## Acceptance criteria

- [ ] Exercise disclosures show no chevron and remain operable from the card title/surface with accessible expanded state.
- [ ] Workout name, timer action, and clock occupy one row no taller than 40 CSS pixels beyond safe area; the timer action is text-only.
- [ ] A single round check action at lower right opens the complete finish review locally and immediately.
- [ ] Pending start and finish mutations show a full-viewport blocking loader and prevent duplicate interaction.
- [ ] Today split previews arrive inside `get_today_view`, eliminating the per-split query waterfall.
- [ ] `start_workout` returns the hydrated workout directly, and Current Workout does not load the full exercise library until Add Exercise is opened.

## Traceability

- MVP criteria: `MVP-TOD-001`, `MVP-WRK-001`–`003`, `MVP-WRK-009`, `MVP-REL-001`, `MVP-UX-001`–`003`
- ADRs: `ADR-0018`, `ADR-0019`, `ADR-0020`, `ADR-0025`, `ADR-0028`
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md)

## Dependencies and blockers

- Dependencies: `T-054` and its parents are `Done`.
- Blockers: None.
- Blocked from status: Not blocked.

## Documentation impact

- Documents to create or update: product workouts, wireframe decisions, mobile UI foundation, server data boundaries, `M-004`, `F-017`, this Task, registry, dashboard, and project state.
- Documentation that should remain unchanged: set semantics, durability guarantees, rotation, History, Body, and the frozen design package.

## Execution checklist

- [x] Refine the active-workout disclosure, header, finish trigger, review sheet, and pending interaction layer.
- [x] Fold split prescriptions into Today's aggregate response and return the current workout directly from start.
- [x] Defer the exercise-library read until Add Exercise opens.
- [x] Update prepared component, repository, pgTAP, and browser specifications without running them.
- [x] Update canonical documentation and run permitted static checks.

## Static-check plan and results

- Planned checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run docs:lint`, `npm run links:internal`, generated database-type comparison, and `git diff --check`.
- Results: At `2026-09-09T13:39:31+02:00`, Prettier, ESLint, strict TypeScript, the Next.js production build, UI asset checks, Markdown lint, and `git diff --check` passed. The internal-link command could not start because this environment still has no `lychee` executable (`sh: lychee: command not found`). The generated database declaration was updated for the additive RPC and passes strict TypeScript; regeneration against the migrated local schema remains inside the approval-gated database verification because applying the migration would execute changed behavior. No feature test or application run occurred.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable.
- **Planned tests:** After approval of the exact delivery commit, run the active-workout and Today component files, active-workout application/unit and repository coverage affected by start hydration, pgTAP workout operations, and the matching mobile Chromium/WebKit Today and active-workout scenarios. Include a database baseline comparison.
- **Authorized commit:** Not authorized.
- **Results:** Not run.

## Delivery commit

- **Delivery commit SHA:** Not created.
- **Subject:** `T-055: compact and accelerate workout flow`
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
| `2026-09-09T13:17:18+02:00` | User / Owner | — | `Ready` | The UI request and named latency question define observable scope and release it for work. |
| `2026-09-09T13:17:18+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began by tracing the Today, start, current-workout, and finish-review data paths. |
