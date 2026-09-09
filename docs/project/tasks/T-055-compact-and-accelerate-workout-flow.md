# T-055 — Compact and accelerate the workout flow

- **Feature:** `F-017`
- **Status:** `Approved`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-09-09T13:17:18+02:00`
- **Updated:** `2026-09-09T14:15:19+02:00`
- **Started:** `2026-09-09T13:17:18+02:00`
- **Review started:** `2026-09-09T14:09:02+02:00`
- **Approval requested:** `2026-09-09T14:09:02+02:00`
- **Approved:** `2026-09-09T14:15:19+02:00`
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the authorized scoped verification against exact delivery `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` and record the result.

## Scope

Deliver the Owner's compact active-workout header, disclosure, and finish-review interaction together with the bounded application-side latency corrections for Today, Start Workout, and Review & Finish.

## Out of scope

- Changes to set recording, finish outcomes, active-workout durability, rotation, History, or hosted infrastructure.
- A general performance audit of every application route.
- Desktop layout work.

## Acceptance criteria

- [x] Exercise disclosures show no chevron and remain operable from the card title/surface with accessible expanded state.
- [x] Workout name, timer action, and clock occupy one row no taller than 40 CSS pixels beyond safe area; the timer action is text-only.
- [x] A single round check action at lower right opens the complete finish review locally and immediately.
- [x] Pending start and finish mutations show a full-viewport blocking loader and prevent duplicate interaction.
- [x] Today split previews arrive inside `get_today_view`, eliminating the per-split query waterfall.
- [x] `start_workout` returns the hydrated workout directly, and Current Workout does not load the full exercise library until Add Exercise is opened.

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
- **Authorized commit:** `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49`
- **Results:** Not run.

## Delivery commit

- **Delivery commit SHA:** `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49`
- **Subject:** `T-055: compact and accelerate workout flow`
- **Committed scope:** Compact active-workout header and chevron-free disclosures; a round local finish-review sheet and blocking start/finish progress; Today aggregate split prescriptions; single-RPC start hydration; lazy exercise-library loading; additive migration and generated declaration; prepared component, repository, pgTAP, and browser assertions; and the affected canonical and project records.

## Review

- **Reviewer:** Codex primary agent
- **Reviewed at:** `2026-09-09T14:09:02+02:00`
- **Outcome:** Recommended for approval.
- **Findings:** No defect found in exact delivery `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49`. The ordinary finish path now reads the already-current client snapshot, while its durable command queue remains the authority for all outcomes; direct finish-route support remains as a fallback. Today removes its per-split application waterfall, start removes its second RPC, and Current Workout removes the eager library read. The new RPC is additive and must reach hosted Supabase before application deployment. Static checks passed except for the unavailable `lychee` executable; approval-gated runtime and database verification has not run.

## Approval

- **Approved commit:** `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-09T14:15:19+02:00`
- **Approval note:** Approved (`odobravam`), authorizing only the recorded scoped verification.

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

- [x] Reviewer recommends approval.
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
| `2026-09-09T14:09:02+02:00` | Codex primary agent / Executor and Reviewer | `In Progress` | `Awaiting Approval` | Delivered and reviewed exact commit `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` with no finding; static checks passed except unavailable `lychee`, and no feature test ran. |
| `2026-09-09T14:15:19+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved exact delivery `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` (`odobravam`) and unlocked its scoped verification. |
