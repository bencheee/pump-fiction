# T-028 — Merge assisted exercises into bodyweight options

- **Feature:** `F-014`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T19:28:05+02:00`
- **Updated:** `2026-09-05T20:59:40+02:00`
- **Started:** `2026-09-05T20:24:07+02:00`
- **Review started:** `2026-09-05T20:36:12+02:00`
- **Approval requested:** `2026-09-05T20:57:19+02:00`
- **Approved:** `2026-09-05T20:57:19+02:00`
- **Testing started:** `2026-09-05T20:57:19+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Deliver a replacement that updates the exercise-form component tests, then request fresh approval for it and for the reset its run needs.

## Scope

Reduce the exercise types to `weights` and `bodyweight`, and express assistance as a bodyweight option instead of a separate type.

| Base type | Implied mode | Optional choices | Rule |
| --- | --- | --- | --- |
| `weights` | `weight` | `weight_resistance_band` | Unchanged |
| `bodyweight` | `bodyweight` | `bodyweight_added_weight`, `bodyweight_resistance_band`, `assistance_weight`, `assistance_band` | At most one, as the Owner accepted on `2026-09-05` |

The `assisted` base type disappears. The two assistance modes keep their identity, their values, and their statistics meaning; only the type that offers them changes. Assistance stays a positive value and is never negative weight, so `MVP-EXE-005` and the History comparison rules are untouched.

No local row used the retired type when this Task was delivered, so the migration removes it without converting data. The committed seed did carry an `assisted` exercise, so `T-028` also moves that seed row to a bodyweight definition with `assistance_weight`; otherwise the next reset would fail.

## Out of scope

- Set confirmation, delivered by `T-029`
- Band direction and strength semantics
- History and statistics screens

## Acceptance criteria

- [ ] The library offers exactly two types, and no screen mentions an assisted type.
- [ ] A bodyweight exercise offers the four options and can save at most one of them.
- [ ] An assistance option produces the same set fields it produces today: assistance kilograms and reps, or assistance-band strength and reps.
- [ ] The database rejects the retired type and any second option, independently of the UI.
- [ ] `MVP-EXE-001`, `MVP-EXE-003`, and `MVP-EXE-004` describe the two-type model, and `exercises.md` matches it.

## Traceability

- MVP criteria: revises `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004`; must not weaken `MVP-EXE-002`, `MVP-EXE-005`
- ADRs: creates one superseding the type table in [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md); respects [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `F-013` delivers first by the Owner's chosen order
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create: the superseding ADR
- Documents to update: exercise product behavior, revised MVP criteria, workout set-entry examples, domain model, screen decisions, decisions index, this Task, `F-014`, registry, dashboard, and project state
- Documentation that should remain unchanged: band identity, History comparison rules, programs and splits

## Execution checklist

- [x] Record the superseding ADR with the two-type table and the single-option rule — [ADR-0026](../../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md), with ADR-0023's status and type table marked superseded.
- [x] Update the declarative schema: the base-type enum, the exercise and snapshot mode checks, and the definition trigger.
- [x] Generate the migration and regenerate database types — the generated migration needed two hand corrections, recorded under static checks.
- [x] Update domain constants, validation, and presentation labels, including `Assist with weight` and `Assist with band` — every type now has an implied base mode, so the nullable base-mode branch and the "Choose exactly one assistance mode." message are gone.
- [x] Update the exercise form and every type-dependent screen — the form drops its assistance-only legend and summary; set entry is keyed by load mode, not base type, so no workout screen changed.
- [x] Move the committed seed's assisted exercise to a bodyweight definition.
- [ ] Extend pgTAP, unit, and component assertions without running them — pgTAP `0002` grows from 8 to 11 assertions covering the retired type, an accepted bodyweight assistance definition, and two rejected assistance modes; `0001` snapshots an assisted movement as bodyweight; the unit suite gains an accepted assistance definition and a rejected retired type.
- [x] Synchronize canonical documentation and project-management projections.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, database lint, generated-type consistency, declarative-schema convergence, documentation links, and `git diff --check`
- Results: Passed on `2026-09-05T20:35:08+02:00`. `npm run check` passed formatting, ESLint, strict TypeScript, the production build, UI asset checksums, Markdown lint, and all 838 internal links. `supabase db lint --local` reported no schema errors and `git diff --check` was clean.

  The generated migration did not apply as written and needed two corrections, both recorded in the file and in the database workflow. It converted `exercise_load_modes.exercise_base_type` before `exercises.base_type`, so the composite foreign key had one side on the replaced type and Postgres rejected it with SQLSTATE 42804; the migration now drops both composite foreign keys, converts all four columns, and restores the keys unchanged. It also left the recreated type without the `service_role` usage grant the declarative schema declares, which a repeated sync reported as a remaining difference; the grant is now part of the migration. After both corrections the migration applied with `migration up` against the local database, deliberately without a reset, and a repeated declarative sync against a freshly built shadow database reported no schema changes. Regenerated types differ only by the removed enum value. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** exercise validation unit tests, exercise-form component tests for the two types and the four options, repository integration tests, and pgTAP constraint tests for the retired type and the single-option rule; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Failed on `2026-09-05T20:59:40+02:00` for `481ef7dc410733ad1b0502a8cea0a02ac53259bc`. The snapshot ran, the clean reset landed on the corrected seed with `Assisted dip` as a bodyweight definition holding `bodyweight` and `assistance_weight`, and the enum exposed only `weights` and `bodyweight`. pgTAP passed 62/62, up from 59 by the three added assertions, and regenerated types matched the committed file. The unit suite then failed 2 of 68: `exercise-form.test.tsx` still drives the retired `Assisted` type button and the `Assistance mode` group, which the delivery removed from the form but did not update in that file. Component suites passed 4/4. The repository suite was not reached.

## Delivery commit

- **Delivery commit SHA:** `481ef7dc410733ad1b0502a8cea0a02ac53259bc`
- **Subject:** `T-028: merge assisted exercises into bodyweight options`
- **Committed scope:** the declarative schema, the new migration, generated types, the seed, exercise domain/validation/presentation, the exercise form, pgTAP `0001` and `0002`, the exercise-operations unit suite, ADR-0026 with the ADR-0023 supersession and the decisions index, `exercises.md`, `workouts.md`, `mvp-acceptance-criteria.md`, `domain-model.md`, `wireframe-decisions.md`, `local-database-workflow.md`, and this Task

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T20:57:19+02:00`
- **Outcome:** Approved
- **Findings:** None recorded

## Approval

- **Approved commit:** Approval cleared by the failed run
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T20:57:19+02:00`
- **Approval note:** Approval of `481ef7dc410733ad1b0502a8cea0a02ac53259bc` was cleared when its authorized run failed on component tests the delivery had not updated

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
| `2026-09-05T19:28:05+02:00` | User / Owner | None | `Backlog` | Requested two exercise types with assistance offered under bodyweight |
| `2026-09-05T20:24:07+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed readiness after `F-013` was delivered and confirmed |
| `2026-09-05T20:24:07+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Started the exercise-type merge |
| `2026-09-05T20:36:12+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Delivered `481ef7dc410733ad1b0502a8cea0a02ac53259bc`; static checks passed and no feature test ran |
| `2026-09-05T20:57:19+02:00` | User / Reviewer and Approver | `In Review` | `Approved` | Approved the exact delivery commit and the clean reset it requires |
| `2026-09-05T20:57:19+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Snapshotted the Owner's data, then started the authorized cycle against `481ef7dc410733ad1b0502a8cea0a02ac53259bc` |
| `2026-09-05T20:59:40+02:00` | Claude Code primary agent / Tester | `Testing` | `In Progress` | The authorized run failed 2 of 68 unit tests: the exercise-form component tests still drove the retired assisted type; approval and test authorization cleared |
