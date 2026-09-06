# T-041 — Build body measurement operations

- **Feature:** `F-009`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 4
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T13:57:17+02:00`
- **Started:** `2026-09-06T13:57:17+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the recorded scope, run only the permitted static checks, and deliver one reviewable commit for the Owner's review.

## Scope

Derive and persist everything `S21` through `S24` show, without rendering it, in the History domain under `src/features/history` beside the weight rules of `T-038`.

Measurement types (`MVP-BOD-001`):

- create a type with a trimmed, non-blank name that is unique case-insensitively, as the `measurement_types_name_unique` index already requires, and a unit fixed to `cm`;
- rename a type, keeping every entry attached, per readiness question 2;
- delete a type only while it has no entries; the `on delete restrict` reference stays the last line of defense and is mapped to a validation failure that explains that the entries are the only record of the measurement, never to a retryable persistence failure;
- remove the stale archiving sentence from the product document, per readiness question 1.

Entries, per type (`MVP-BOD-002`), each write one Server Action, one repository call, one PostgreSQL function, and the generic retry contract:

- create, update, and delete one decimal-centimeter value per local date; validation: a `YYYY-MM-DD` date not after the local date, a value above zero with at most two decimals within `numeric(7,2)`, and the local date as the default; the per-type-and-date uniqueness and the `reject_future_local_entry_date` trigger are mapped to field errors on the date.

Domain derivation, from every stored entry of a type ordered by date:

- latest value and date, the previous value, and the first value; `latest change = latest value − previous value` and `total change = latest value − first value`, each unavailable rather than zero with fewer than two entries; the change carried by every entry for the list newest first;
- the type list summary: each type with its latest value and date and its latest change, or the empty marker, with no fabricated zero;
- neutral serializable chart series in the History chart contract for the month, quarter, year, and all ranges as the trailing windows `rangeStart` defines, `all` unbounded; no series or summary carries a good/bad direction, because the meaning depends on the measurement and the user's goal (`MVP-BOD-003`).

Queries:

- the Body list: every type with its summary, and the configured local date;
- one type's detail: the type and every entry, as nested JSON that the server repository exposes only as domain shapes;
- one entry by type and local date for `S24` edit.

## Out of scope

- `S21` through `S24` rendering and the Recharts component, owned by `T-042`
- Weight, owned by `T-038`
- Archiving or reactivating a type, removed by [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Unit conversion, goals, any authoritative aggregate table or cache
- Feature tests before the Task's first approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)

## Acceptance criteria

- [ ] Creating a type whose name differs only in case or surrounding whitespace from an existing one is rejected with a field error on the name; renaming a type keeps every entry attached.
- [ ] Deleting a type with entries fails with the explanatory validation failure and changes nothing; deleting a type without entries succeeds.
- [ ] Per type, a duplicate date, a future local date, and an invalid value are each rejected with a field error, and a retrospective date is accepted.
- [ ] Latest, previous, first, latest change, and total change are correct for zero, one, two, and many entries, and editing or deleting any entry, including the first and the latest, recalculates all of them and the chart series (`MVP-BOD-004`).
- [ ] Chart series contain only neutral serializable points, are correct at each range boundary in the configured time zone, `all` is unbounded, and no series or summary carries a positive or negative judgement.
- [ ] Unit tests cover the change arithmetic, the edge counts, recalculation, and the range windows; pgTAP and repository tests cover the type lifecycle, uniqueness, restricted deletion, and the read and write functions; none is executed.

## Traceability

- MVP criteria: `MVP-BOD-001`, `MVP-BOD-002`, `MVP-BOD-004` (data); `MVP-BOD-003` (data); supporting `MVP-REL-003`, `MVP-REL-004`
- ADRs: [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-004` Done, which created the tables, the restrict reference, and the future-date trigger in `T-006`, and `F-011` Done, whose `T-021` made the type name unconditionally unique; `T-038` Done, whose entry-date validation and range helpers this Task shares within the History domain
- Blockers: None; `T-038` through `T-040` are `Done`, and the Owner answered readiness questions 1 and 2 and released the whole Feature on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the weight and body product document (remove the archiving sentence, record the rename decision, the unavailable-change rule, and display rounding), the domain model Progress section, the server boundary document (a `T-041` paragraph), the local database workflow (new declarative schema file, pgTAP suite, and repository test), this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: the change formulas, the locked MVP criteria text, weight rules, History, and every UI document

## Execution checklist

- [ ] Define the body domain shapes: measurement type, type summary, entry, detail summary, chart range and series, validation inputs, and the repository contract.
- [ ] Implement type and entry validation, latest, previous, and first, both changes with their unavailable states, the per-entry change, and the range and series builders as pure functions.
- [ ] Add the declarative schema file with the list, detail, and by-date read functions and the type create, rename, and delete and entry create, update, and delete functions; map the unique-name, restricted-delete, unique-date, and future-date failures in the Supabase repository.
- [ ] Add application operations returning `OperationResult` values through server composition and thin Server Actions, with the caller supplying the configured local date.
- [ ] Generate and review the migration; regenerate and review the database types.
- [ ] Prepare the unit suite, the pgTAP suite, and a repository integration test that removes what it creates; add the integration file to `test:repository`; do not run them.
- [ ] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:unit` for the change arithmetic, the edge counts, recalculation, and the range windows; `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new body measurement suite; `npm run test:repository` including the new integration test; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-041: build body measurement operations`
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
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the body measurement data and derivation within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
| `2026-09-06T13:57:17+02:00` | User / Owner | `Backlog` | `Ready` | Weight is finished and the Owner's go-ahead for the whole Feature authorizes Body |
| `2026-09-06T13:57:17+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the body measurement data and derivation |
