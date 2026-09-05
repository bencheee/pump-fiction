# T-019 — Simplify the exercise load-mode model

- **Feature:** `F-011`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T11:41:11+02:00`
- **Updated:** `2026-09-05T12:20:26+02:00`
- **Started:** `2026-09-05T12:09:18+02:00`
- **Review started:** `2026-09-05T12:20:26+02:00`
- **Approval requested:** `2026-09-05T12:24:17+02:00`
- **Approved:** `2026-09-05T12:24:17+02:00`
- **Testing started:** `2026-09-05T12:24:17+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the authorized clean reset, pgTAP, unit, component, and repository verification against the approved commit.

## Scope

Replace the current load-mode model with the model the Owner accepted on `2026-09-05`, across the database, domain, application boundary, Exercise Library UI, and canonical specification. `ADR-0023` records the decision and the criteria it changes.

Accepted model:

| Base type | Always allowed, never shown as a choice | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | The resistance band is a single optional addition |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band` | At most one of the two may be selected |
| `assisted` | none | `assistance_weight`, `assistance_band` | Exactly one of the two must be selected |

Removed entirely: the `band` base type, the `resistance_band` load mode, and the `bodyweight_assistance_band` load mode. Assistance bands remain available through the `assisted` type, which is where they belong.

The Owner accepted a clean local database reset, so the migration removes the retired enum values without converting existing rows.

## Out of scope

- Active-workout set entry, which `T-020` derives from this model
- Archiving and deletion behavior (`T-021`, `T-022`)
- Band direction and strength semantics, which stay as accepted in `MVP-EXE-005`

## Acceptance criteria

- [ ] The exercise form never renders a mode the user cannot change; a weights exercise offers only the resistance-band addition and a bodyweight exercise offers only added weight or a resistance band.
- [ ] A bodyweight exercise cannot save both added weight and a resistance band.
- [ ] An assisted exercise cannot save zero or both of assistance weight and assistance band.
- [ ] The `band` base type is not offered anywhere and no longer exists in the database.
- [ ] The database rejects every retired combination, independently of the UI.
- [ ] `MVP-EXE-001`, `MVP-EXE-003`, and `MVP-EXE-004` describe the accepted model, and `exercises.md` matches it.

## Traceability

- MVP criteria: revises `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004`; must not weaken `MVP-EXE-002`, `MVP-EXE-005`
- ADRs: creates `ADR-0023`; respects [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `T-018` for delivery order only
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: `ADR-0023`
- Documents to update: exercise product behavior, revised MVP criteria, domain model, database workflow notes, screen decisions, decisions index, this Task, `F-011`, registry, dashboard, and project state
- Documentation that should remain unchanged: band identity semantics, History comparison rules, programs and splits

## Execution checklist

- [x] Record `ADR-0023` with the accepted model, the clean-reset decision, and the criteria it revises.
- [x] Update the declarative schema: enum values, exercise and snapshot load-mode checks, and the per-exercise exclusivity rule.
- [x] Generate the migration and regenerate database types.
- [x] Update domain constants, validation, application operations, and presentation labels.
- [x] Rebuild the Allowed per-set modes section of the exercise form around optional choices only.
- [x] Extend pgTAP and unit assertions without running them.
- [x] Synchronize canonical documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Passed on `2026-09-05T12:20:06+02:00` with Node.js `24.20.0`, npm `11.19.0`, and Supabase CLI `2.116.0` against local PostgreSQL `17`. `npm run check` passed Prettier, ESLint, strict TypeScript, the 19-route production build, UI asset checksums, Markdown lint across 96 files, and all 732 internal links. The generated migration needed one reviewed correction: the generator swapped the enum types before dropping the composite foreign keys that carry them, so the migration now drops and restores `exercise_load_modes_exercise_id_exercise_base_type_fkey`, `workout_exercise_load_modes_workout_exercise_id_exercise_b_fkey`, and `workout_sets_workout_exercise_id_load_mode_fkey` around the swap and restores the type grants that recreation dropped. With that correction the migration applied to the local database, a repeated declarative sync reported no schema changes against a freshly rebuilt shadow database, `supabase db lint` reported no schema errors, regenerated types differ only by the retired enum values, and `git diff --check` passed. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** exercise validation unit tests, exercise-form component tests, exercise repository integration tests, and pgTAP constraint tests for every retired and permitted combination; must not run before Owner approval of the exact commit
- **Authorized commit:** `db5a42026270393d17a11ecded5578e756f6d1e4`
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `db5a42026270393d17a11ecded5578e756f6d1e4`
- **Subject:** `T-019: simplify the exercise load-mode model`
- **Committed scope:** `ADR-0023` and its index row; declarative schema without the `band` base type, the `resistance_band` and `bodyweight_assistance_band` modes, and with the `exercise_load_modes_single_modifier` index plus the rewritten definition trigger; the reviewed migration and regenerated database types; domain constants for implied and optional modes, rewritten definition validation, and presentation labels; the Exercise Library form rebuilt around optional additions only; updated unit, component, integration, and pgTAP assertions; and revised `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004` with the exercise, workout, domain-model, database-workflow, and screen documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T12:24:17+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded; the User reviewed the delivered model, the reviewed migration correction, and the revised criteria.

## Approval

- **Approved commit:** `db5a42026270393d17a11ecded5578e756f6d1e4`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T12:24:17+02:00`
- **Approval note:** The User answered `odobravam` to the request to approve this exact commit, which authorizes the clean local reset accepted for this model change.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
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
- [ ] Authorized feature tests passed
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-05T11:41:11+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Created from Owner correction 2 recorded on 2026-09-05 |
| `2026-09-05T12:09:18+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed the accepted load-mode model and directed execution after approving `T-018` |
| `2026-09-05T12:09:18+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the schema, domain, and Exercise Library changes |
| `2026-09-05T12:20:26+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `db5a42026270393d17a11ecded5578e756f6d1e4` with static checks passed and no feature test run |
| `2026-09-05T12:24:17+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact commit and the accepted clean local reset |
| `2026-09-05T12:24:17+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Running the authorized database and application verification against `db5a42026270393d17a11ecded5578e756f6d1e4` |
