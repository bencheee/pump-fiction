# T-033 — Build exercise statistics operations

- **Feature:** `F-008`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 3
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-05T23:39:11+02:00`
- **Started:** `2026-09-05T23:24:46+02:00`
- **Review started:** `2026-09-05T23:35:01+02:00`
- **Approval requested:** `2026-09-05T23:39:11+02:00`
- **Approved:** `2026-09-05T23:39:11+02:00`
- **Testing started:** `2026-09-05T23:39:11+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run only the recorded verification against exact approved delivery `bf787976b69602ed4358eb79f053d48486c3d30e`.

## Scope

Derive everything `S15` and `S16` show, without rendering it. The product rules live as pure functions in the History domain under `src/features/history`, and the server boundary supplies only the raw performances they reduce, so every PR and chart rule is testable without a browser or a database.

Domain derivation, from recorded sets of completed workouts only:

- the eligibility filter of `MVP-HIS-006`, with one-time workouts included and incomplete workouts excluded;
- the comparison category of every set: no-band weights, weights with each resistance-band strength, pure bodyweight, added weight, assistance kilograms, and each band direction and strength, never converted or merged (`MVP-HIS-009`);
- personal records per category as `history-and-statistics.md` defines them: weights highest weight, highest reps at each weight, highest set volume, and highest exercise volume within one workout; pure bodyweight highest set reps and highest workout total reps; added weight highest added weight, highest reps at the same added weight, and workout total reps; kilogram assistance least assistance and highest reps at the same assistance; band categories highest reps within the category;
- the latest eligible performance for the identity;
- neutral serializable chart series for the type-meaningful metrics (highest weight per workout, highest reps, total volume or total reps, assistance amount flagged lower-is-better, band category) over the week, month, quarter, year, and all ranges, ending today in the configured time zone;
- the performance list across every split and one-time workout, each entry carrying its workout id, date, name, completion status, eligibility, sets, and workout-specific note.

Queries:

- the Exercise History list: every exercise identity with at least one recorded set in History, with its latest name snapshot, base type, whether the definition still exists in the library, and a latest-performance summary;
- the raw performances of one identity for the detail, resolved by the identity snapshot from readiness question 1, or by the live reference plus snapshotted name and type if the Owner chooses that answer.

## Out of scope

- `S15` and `S16` rendering, selectors, and the Recharts components, owned by `T-034`
- Split statistics, owned by `T-035`
- Estimated 1RM, RIR/RPE, or any metric not in the product document
- Any authoritative aggregate table or cache
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] A set from an incomplete workout, or a set that is not recorded, never reaches a PR, chart point, or latest performance; a set from a completed one-time workout does.
- [ ] Every PR listed in the product document is derived per category with the correct tie handling, and no derivation compares across band direction or strength or converts a band to kilograms.
- [ ] Lower assistance kilograms ranks as progress, and the series carries that direction so presentation never guesses.
- [ ] Chart series contain only neutral serializable points and metadata, are correct at each range boundary in the configured time zone, and expose the metric set meaningful to the exercise's snapshot type.
- [ ] The exercise list contains an exercise whose definition was deleted, marked as no longer in the library, and its detail still combines every performance by identity with a link to each workout.
- [ ] Unit tests cover the PR matrix per mode family, the eligibility filter, band separation, range boundaries, and deleted-identity retention; pgTAP and repository tests cover the read functions; none is executed.

## Traceability

- MVP criteria: `MVP-HIS-005`, `MVP-HIS-006`, `MVP-HIS-007`, `MVP-HIS-008`, `MVP-HIS-009`, `MVP-HIS-010` (data); supporting `MVP-WRK-006`, `MVP-EXE-005`, `MVP-EXE-008`
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0026](../../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md)
- Canonical documents: [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-007` and `F-014` Done; `T-031` Done, which added the identity snapshot readiness answer 1 accepted
- Blockers: None; the Owner answered readiness question 1 on `2026-09-05` and `T-031` delivered the identity columns
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the History product document (tie handling and any local decision from `F-008` this Task settles), the domain model derived-statistics section, the server boundary document (a `T-033` paragraph), the local database workflow (new pgTAP file and repository test), this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: the PR definitions themselves, active-workout behavior, programs and splits, weight and body, and every UI document

## Execution checklist

- [x] Define the statistics domain shapes: comparison category, personal record, latest performance, chart series and range, performance entry, and the repository contract.
- [x] Implement the eligibility filter, category derivation, PR derivation per mode family, latest performance, and range and series builders as pure functions.
- [x] Add read functions for the exercise list and the raw performances of one identity, mapped in the Supabase repository to domain shapes. Both group by `exercise_identity_id`, so a deleted definition keeps one history.
- [x] Add application operations that reduce raw performances to the `S16` view and return `OperationResult` values through server composition. The caller passes the configured local date, so the trailing ranges stay pure.
- [x] Generate and review the migration; regenerate and review the database types. The migration adds only functions, so it carries no structural statement and no backfill.
- [x] Prepare the unit suite, the pgTAP suite, and a repository integration test; add the integration file to `test:repository`; do not run them.
- [x] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Passed on `2026-09-05T23:34:00+02:00` with Node.js `24.20.0`, npm `11.19.0`, Supabase CLI `2.116.0`, and local PostgreSQL `17`. `npm run check` passed Prettier, ESLint including the dependency-boundary rules, strict TypeScript, the production build, the asset checksums, Markdown lint, and every internal link. The declarative sync produced one function-only migration under `--strict-coverage`, which compiled inside an immediately rolled-back transaction; regenerated types matched the committed file on a second run; `supabase db lint --level error` reported no schema errors; and `git diff --check` was clean. No feature test ran: the unit, pgTAP, and repository suites are prepared and unexecuted.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: `npm run test:unit` for the PR matrix, eligibility, band separation, range boundaries, and identity retention; `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new exercise-history suite; `npm run test:repository` including the new integration test; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before Owner approval of the exact commit.
- **Authorized commit:** `bf787976b69602ed4358eb79f053d48486c3d30e`
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `bf787976b69602ed4358eb79f053d48486c3d30e`
- **Subject:** `T-033: build exercise statistics operations`
- **Committed scope:** the `0004_exercise_statistics.sql` declarative schema with its function-only migration and regenerated types; the `exercise-statistics` domain with its eligibility, category, record, metric, and series rules; the repository contract, Supabase repository, application operations, server composition, and Server Actions; the prepared unit suite, the `0007_exercise_statistics` pgTAP suite, and the repository integration test with its `test:repository` registration; and the History product, domain-model, server-boundary, and local-database-workflow documents

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-05T23:39:11+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `bf787976b69602ed4358eb79f053d48486c3d30e`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-05T23:39:11+02:00`
- **Approval note:** The Owner replied `potvrda` to the request to review this exact delivery, which approves it and authorizes only the recorded verification plan.

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
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the exercise statistics derivation within `F-008`; the Owner directed that implementation must not start |
| `2026-09-05T23:24:46+02:00` | User / Owner | `Backlog` | `Ready` | `T-031` delivered the identity snapshot and the go-ahead for the whole `F-008` authorizes the statistics |
| `2026-09-05T23:24:46+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the exercise statistics derivation |
| `2026-09-05T23:34:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Progress` | Completed the reads, the derivation rules, the boundary, and the prepared suites; all permitted static checks passed |
| `2026-09-05T23:35:01+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `bf787976b69602ed4358eb79f053d48486c3d30e`; static checks passed and every prepared feature test remains unexecuted |
| `2026-09-05T23:39:11+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-05T23:39:11+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `bf787976b69602ed4358eb79f053d48486c3d30e` with `potvrda` |
| `2026-09-05T23:39:11+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded unit, pgTAP, and repository verification against the exact approved delivery |
