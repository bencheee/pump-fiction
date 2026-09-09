# T-055 — Compact and accelerate the workout flow

- **Feature:** `F-017`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-09-09T13:17:18+02:00`
- **Updated:** `2026-09-09T15:02:09+02:00`
- **Started:** `2026-09-09T13:17:18+02:00`
- **Review started:** `2026-09-09T14:09:02+02:00`
- **Approval requested:** `2026-09-09T14:09:02+02:00`
- **Approved:** `2026-09-09T14:15:19+02:00`
- **Testing started:** `2026-09-09T14:18:54+02:00`
- **Completed:** `2026-09-09T15:02:09+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-055` is `Done`. Hosted rollout applies the new Supabase migration before deploying the Vercel application.

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
- **Results:** Final approval-inherited replacement `2d7f866db9d6261a8f0b414ad064b91adfff0e35` passed the complete scoped plan against a clean 26-migration database: component/application 31/31, pgTAP 19/19, workout repository integration 1/1, and the Today plus active-workout scenarios 4/4 across mobile Chromium and WebKit, serially over the shared database. Generated database types exactly matched the migrated schema. The normalized before/after data dumps were identical after excluding pg_dump's random restriction token and the expected `app_settings.updated_at` touch; all rows, pointers, exercises, workouts, commands, and user values matched. The Owner's pre-test local snapshot was restored. Earlier environment-only starts and superseded replacement runs remain recorded above; no unresolved product defect remains.

## Delivery commit

- **Delivery commit SHA:** `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49`
- **Subject:** `T-055: compact and accelerate workout flow`
- **Committed scope:** Compact active-workout header and chevron-free disclosures; a round local finish-review sheet and blocking start/finish progress; Today aggregate split prescriptions; single-RPC start hydration; lazy exercise-library loading; additive migration and generated declaration; prepared component, repository, pgTAP, and browser assertions; and the affected canonical and project records.

## Replacements

- **First replacement SHA:** `68c63e50c2a3b53c82df5ea2efcfd4629258610f`
- **First replacement subject:** `T-055: align browser save-status assertion`
- **First replacement scope:** Test source only: both active-workout assertions now require the saved status to remain in the accessibility tree, matching its intentional screen-reader-only presentation.
- **Second replacement SHA:** `85e3259dc4f0842c565be972408946c51a5bdb23`
- **Second replacement subject:** `T-055: preserve newer optimistic revision`
- **Second replacement scope:** One refresh guard prevents a late authoritative hydration from overwriting a newer locally applied command revision.
- **Third replacement SHA:** `ead40cc3eed8e7cae12ac59eb147d2e19e9cbcbd`
- **Third replacement subject:** `T-055: synchronize before finish outcome`
- **Third replacement scope:** The locally opened review remains unchanged. After the user selects an outcome, the blocking path drains pending delivery, reads the authoritative workout revision once, and only then queues the terminal command; its component assertion proves revision 7 is used over stale initial revision 4.
- **Fourth replacement SHA:** `4e8b103f46dd0660c8389787a09f51139b183cda`
- **Fourth replacement subject:** `T-055: clean discarded workout acknowledgements`
- **Fourth replacement scope:** Browser cleanup remembers the discarded one-time workout ID and removes only its FK-free acknowledgement, making fixture teardown semantically identical to its clean seed baseline.
- **Final replacement SHA:** `2d7f866db9d6261a8f0b414ad064b91adfff0e35`
- **Final replacement subject:** `T-055: document finish synchronization`
- **Final replacement scope:** Canonical product, UX, UI-foundation, and server-boundary documents record that Review opens locally while outcome selection synchronizes under the blocker. All replacements stay inside the Task and inherit approval under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).

## Review

- **Reviewer:** Codex primary agent
- **Reviewed at:** `2026-09-09T14:09:02+02:00`
- **Outcome:** Recommended for approval.
- **Findings:** The delivery review found no static defect. Verification later corrected one stale browser assertion and isolated two possible stale-state windows. The decisive trace showed a cross-reload acknowledgement race, not a structural-refresh overwrite: the server accepted revision 11 after the new page had captured revision 10 and after the shared outbox no longer exposed the acknowledged command. Third replacement `ead40cc3eed8e7cae12ac59eb147d2e19e9cbcbd` synchronizes only the selected finish outcome under the blocker, so Review still opens locally and immediately. Today removes its per-split application waterfall, start removes its second RPC, and Current Workout removes the eager library read. The new RPC is additive and must reach hosted Supabase before application deployment.

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
- [x] User approved the exact commit SHA.
- [x] Scope and acceptance criteria are satisfied.
- [x] Canonical documentation and required ADRs are current.
- [x] Authorized feature tests passed.
- [x] Static checks and all evidence are recorded.
- [x] Dashboard, registry, and parent progress are current.
- [x] Follow-up scope has separate Tasks.
- [x] Audit history is complete.

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-09T13:17:18+02:00` | User / Owner | — | `Ready` | The UI request and named latency question define observable scope and release it for work. |
| `2026-09-09T13:17:18+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began by tracing the Today, start, current-workout, and finish-review data paths. |
| `2026-09-09T14:09:02+02:00` | Codex primary agent / Executor and Reviewer | `In Progress` | `Awaiting Approval` | Delivered and reviewed exact commit `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` with no finding; static checks passed except unavailable `lychee`, and no feature test ran. |
| `2026-09-09T14:15:19+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved exact delivery `c67e578ff1f7ffb9bf5bbd6f7c56178259576f49` (`odobravam`) and unlocked its scoped verification. |
| `2026-09-09T14:18:54+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the authorized scoped verification in an isolated worktree at the exact approved delivery. |
| `2026-09-09T14:29:18+02:00` | Codex primary agent / Tester | `Testing` | `Testing` | Lower layers pass; the first browser run found a stale visibility assertion and shared-database parallel interference, so test-source replacement `68c63e50c2a3b53c82df5ea2efcfd4629258610f` will repeat the same scope serially under inherited approval. |
| `2026-09-09T14:37:15+02:00` | Codex primary agent / Tester | `Testing` | `Testing` | The serial browser repeat passed 3/4 and exposed an application race before finish; replacement `85e3259dc4f0842c565be972408946c51a5bdb23` prevents stale hydration from overwriting a newer optimistic revision and will repeat the complete scope. |
| `2026-09-09T14:47:13+02:00` | Codex primary agent / Tester | `Testing` | `Testing` | Trace identified a cross-reload acknowledgement window after the next serial run failed both active-workout cases; replacement `ead40cc3eed8e7cae12ac59eb147d2e19e9cbcbd` synchronizes only after an outcome is selected, under the blocker, and will repeat the complete scope. |
| `2026-09-09T15:02:09+02:00` | Codex primary agent / Tester | `Testing` | `Done` | Final replacement `2d7f866db9d6261a8f0b414ad064b91adfff0e35` passed 31/31 component/application, 19/19 pgTAP, 1/1 repository, and 4/4 mobile-browser checks with matching generated types and a semantically identical database baseline; the Owner's snapshot was restored. |
