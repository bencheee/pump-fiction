# T-035 — Build split statistics operations

- **Feature:** `F-008`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 5
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T21:58:22+02:00`
- **Updated:** `2026-09-06T10:38:42+02:00`
- **Started:** `2026-09-06T10:38:42+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the recorded scope, run only the permitted static checks, and deliver one reviewable commit for the Owner's review.

## Scope

Derive everything `S17` and `S18` show, without rendering it, in the History domain under `src/features/history` on top of raw completed split workouts supplied by the server boundary.

Domain derivation, from `completed` split-sourced workouts only:

- grouping by persistent split identity, so same-named splits in different programs stay separate and a renamed split stays one entry; the identity is the snapshot from readiness question 1, or the live `source_split_id` if the Owner chooses the other answer, in which case deleted splits drop out (readiness question 2);
- per split: program name, completed-workout count, total, average, shortest, longest, and latest active duration, and latest performance date;
- neutral serializable duration chart series over the week, month, quarter, year, and all ranges, ending today in the configured time zone;
- the split's completed workout list, each entry carrying its workout id, date, and duration;
- the program filter options from the program identities and names present in the data.

Exclusions: one-time workouts and incomplete workouts never enter a split statistic; a today-only alternate split workout counts toward the split it ran.

Queries:

- the Split History list aggregates and the program filter options;
- the completed workouts of one split identity for the detail.

## Out of scope

- `S17` and `S18` rendering, owned by `T-036`
- Exercise statistics, owned by `T-033`, and workout corrections, owned by `T-031`
- Any template or rotation data beyond the snapshotted names
- Any authoritative aggregate table or cache
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] Two splits with the same name in different programs produce two entries, and a renamed split produces one.
- [ ] One-time and incomplete workouts never change any count or duration, while a completed alternate-split workout does.
- [ ] Count, total, average, shortest, longest, and latest duration and the latest date are correct for the fixture data, including a split with a single workout.
- [ ] Duration series contain only neutral serializable points and are correct at each range boundary in the configured time zone.
- [ ] With the identity snapshot, a split whose template was deleted still appears under its snapshotted names; without it, the Task records that such splits are absent and why.
- [ ] Unit tests cover grouping, exclusions, aggregates, and range boundaries; pgTAP and repository tests cover the read functions; none is executed.

## Traceability

- MVP criteria: `MVP-HIS-011` (data); supporting `MVP-HIS-006`, `MVP-TOD-002`, `MVP-TOD-003`, `MVP-PRG-007`
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-007` Done; `T-031` Done, which added the identity snapshot readiness answer 1 accepted
- Blockers: None; the Owner answered readiness questions 1 and 2 on `2026-09-05`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the History product document (deleted-split behavior from question 2 and any local decision this Task settles), the domain model derived-statistics section, the server boundary document (a `T-035` paragraph), the local database workflow (new pgTAP file and repository test), this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: rotation rules, template behavior, exercise statistics, weight and body, and every UI document

## Execution checklist

- [ ] Define the split statistics domain shapes: split entry, duration aggregates, chart series and range, workout entry, program filter option, and the split history repository contract.
- [ ] Implement identity grouping, the eligibility filter, the aggregates, and the range and series builders as pure functions.
- [ ] Add read functions for the list aggregates, the filter options, and one split's completed workouts, mapped in the Supabase repository to domain shapes.
- [ ] Add application operations returning `OperationResult` values through server composition.
- [ ] Generate and review the migration; regenerate and review the database types.
- [ ] Prepare the unit suite, the pgTAP suite, and a repository integration test; add the integration file to `test:repository`; do not run them.
- [ ] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit: `npm run test:unit` for grouping, exclusions, aggregates, and range boundaries; `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new split-history suite; `npm run test:repository` including the new integration test; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before Owner approval of the exact commit.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-035: build split statistics operations`
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
| `2026-09-05T21:58:22+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the split statistics derivation within `F-008`; the Owner directed that implementation must not start |
| `2026-09-06T10:38:42+02:00` | User / Owner | `Backlog` | `Ready` | The identity snapshot is in place and the go-ahead for the whole `F-008` authorizes the split statistics |
| `2026-09-06T10:38:42+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the split statistics derivation |
