# T-038 — Build weight operations

- **Feature:** `F-009`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T12:39:15+02:00`
- **Started:** `2026-09-06T12:39:15+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Implement the recorded scope, run only the permitted static checks, and deliver one reviewable commit for the Owner's review.

## Scope

Derive and persist everything `S19`, `S20`, and the Today weight prompt need, without rendering any of it. The product rules live as pure functions in the History domain under `src/features/history`, beside the exercise and split statistics, because Weight is a History subsection under ADR-0003 and the chart contract and range helper it reuses already live there; the server boundary supplies only the stored entries and the configured local date they reduce, so every weekly rule is testable without a browser or a database.

Domain derivation, from every stored weight entry:

- calendar weeks running Monday through Sunday in the configured time zone; `weekly average = sum of existing entries / number of entries`; `weekly change = current weekly average − previous weekly average`, unavailable rather than zero when the immediately preceding week has no entries (`MVP-WGT-002`);
- the recorded-days count of a week as `n/7`, and the provisional flag: the current week is provisional on every day before its Sunday and final on Sunday; every past week is final;
- the latest entry, its change from the previous individual weigh-in by date, and the change carried by every entry for the list newest first;
- neutral serializable chart series in the History chart contract of `T-033` and `T-035`, generalized so a point needs no workout id and a series can carry a companion series, for the week, month, quarter, and year ranges as the trailing windows `rangeStart` already defines: a daily series of the entries in the window and a companion weekly-average series with one point per calendar week intersecting the window, each point carrying week start and end, average, recorded days, and the provisional flag, so the chart draws without computing; the History callers keep their series unchanged;
- entry validation: a `YYYY-MM-DD` date not after the local date, a decimal kilogram value above zero with at most two decimals within `numeric(6,2)`, and the local date as the default (`MVP-WGT-001`).

Writes, each one Server Action, one repository call, one PostgreSQL function, and the generic retry contract:

- create the entry for a date, update an entry's date and value, and delete an entry; the existing `weight_entries_entry_date_key` uniqueness and the `reject_future_local_entry_date` trigger stay the last line of defense and are mapped to field errors on the date, never to a retryable persistence failure.

Queries:

- the weight overview: the configured local date and every entry ordered by date, returned as nested JSON that the server repository exposes only as domain shapes;
- one entry by local date, for `S20` edit and for the Today prompt of `MVP-TOD-004`.

## Out of scope

- `S19` and `S20` rendering, the range selector, and the Recharts component, owned by `T-039`
- The Today prompt and `S04`, owned by `T-040`
- Body measurements, owned by `T-041`
- Any authoritative aggregate table or cached weekly value
- Any change to `app_settings` or the time-zone operation
- Feature tests before the Task's first approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)

## Acceptance criteria

- [ ] A week with entries on three of its seven days averages those three values and reports `3/7`; a week whose preceding week is empty reports its weekly change as unavailable, never as zero.
- [ ] The current week is provisional on every day before its Sunday and final on Sunday, computed in the configured time zone, including across a month boundary, a year boundary, and the local daylight-saving change.
- [ ] Editing or deleting one entry changes every affected weekly average, weekly change, latest value, individual change, and chart point, and nothing else (`MVP-WGT-004`).
- [ ] A duplicate date and a future local date are each rejected with a field error on the date, and a non-positive or over-precise value with a field error on the value; the stored entries are unchanged.
- [ ] Chart series contain only neutral serializable points and metadata, are correct at each range boundary in the configured time zone, and the weekly-average series marks the current week provisional.
- [ ] Unit tests cover the calendar-week boundaries, the provisional rule, the unavailable change, `n/7`, the individual change, the range windows, and recalculation after an edit and a deletion; pgTAP and repository tests cover the read and write functions; none is executed.

## Traceability

- MVP criteria: `MVP-WGT-001`, `MVP-WGT-002`, `MVP-WGT-004` (data); `MVP-WGT-003` and `MVP-TOD-004` (data); supporting `MVP-REL-003`, `MVP-REL-004`
- ADRs: [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `F-004` Done, which created `weight_entries`, its per-date uniqueness, and the future-date trigger in `T-006`; `T-033` and `T-035` Done, whose `ChartRange`, `rangeStart`, and chart contract this Task reuses and generalizes rather than writes again
- Blockers: None; the Owner answered the `F-009` readiness questions and gave the go-ahead on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the weight and body product document (the local decisions `F-009` assigns to this Task: display rounding, the trailing week window against the calendar week, weekly point placement, previous weigh-in by date), the domain model Progress section (derived in the History domain, no aggregate table), the server boundary document (a `T-038` paragraph), the local database workflow (new declarative schema file, pgTAP suite, and repository test), this Task, `F-009`, registry, dashboard, and project state
- Documentation that should remain unchanged: the weekly formulas themselves, the locked MVP criteria text, body measurement behavior, History, active-workout behavior, and every UI document

## Execution checklist

- [ ] Define the weight domain shapes: entry, weekly summary, latest summary, chart range and series, validation input, and the repository contract.
- [ ] Implement the calendar-week grouping, weekly average and change, the provisional rule, the latest and individual change, entry validation, and the range and series builders as pure functions over the entries and the local date; reuse `rangeStart` and generalize the chart contract so a point needs no workout id and a series can carry the companion weekly-average series, keeping the History callers unchanged.
- [ ] Add the declarative schema file with the overview and by-date read functions and the create, update, and delete functions, each returning the affected entry; map the uniqueness and future-date failures to field errors in the Supabase repository.
- [ ] Add application operations that reduce the entries to the `S19` view, validate and route the writes, and return `OperationResult` values through server composition and thin Server Actions; the caller passes the configured local date, so derivation stays pure.
- [ ] Generate and review the migration; regenerate and review the database types.
- [ ] Prepare the unit suite, the pgTAP suite, and a repository integration test that removes what it creates; add the integration file to `test:repository`; do not run them.
- [ ] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:unit` for the calendar-week boundaries, the provisional rule, the unavailable change, `n/7`, the individual change, the range windows, and recalculation; `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new weight suite; `npm run test:repository` including the new integration test; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-038: build weight operations`
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
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the weight data and derivation within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
| `2026-09-06T12:39:15+02:00` | User / Owner | `Backlog` | `Ready` | The Owner accepted every `F-009` readiness answer and gave the go-ahead for the whole Feature |
| `2026-09-06T12:39:15+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the weight data and derivation, the first Task of `F-009` |
