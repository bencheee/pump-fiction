# T-038 — Build weight operations

- **Feature:** `F-009`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T00:49:17+02:00`
- **Updated:** `2026-09-06T13:17:52+02:00`
- **Started:** `2026-09-06T12:39:15+02:00`
- **Review started:** `2026-09-06T13:15:07+02:00`
- **Approval requested:** `2026-09-06T13:05:56+02:00`
- **Approved:** `2026-09-06T13:05:56+02:00`
- **Testing started:** `2026-09-06T13:05:56+02:00`
- **Completed:** `2026-09-06T13:17:52+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-038` is `Done`. `F-009` continues with `T-039`.

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

- [x] A week with entries on three of its seven days averages those three values and reports `3/7`; a week whose preceding week is empty reports its weekly change as unavailable, never as zero.
- [x] The current week is provisional on every day before its Sunday and final on Sunday, computed in the configured time zone, including across a month boundary, a year boundary, and the local daylight-saving change.
- [x] Editing or deleting one entry changes every affected weekly average, weekly change, latest value, individual change, and chart point, and nothing else (`MVP-WGT-004`).
- [x] A duplicate date and a future local date are each rejected with a field error on the date, and a non-positive or over-precise value with a field error on the value; the stored entries are unchanged.
- [x] Chart series contain only neutral serializable points and metadata, are correct at each range boundary in the configured time zone, and the weekly-average series marks the current week provisional.
- [x] The unit tests covering the calendar-week boundaries, the provisional rule, the unavailable change, `n/7`, the individual change, the range windows, and recalculation passed, as did the pgTAP and repository tests over the reads and the writes.

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

- [x] Define the weight domain shapes: entry, weekly summary, latest summary, chart range and series, validation input, and the repository contract.
- [x] Implement the calendar-week grouping, weekly average and change, the provisional rule, the latest and individual change, entry validation, and the range and series builders as pure functions over the entries and the local date; reuse `rangeStart` and generalize the chart contract so a point needs no workout id and a series can carry the companion weekly-average series, keeping the History callers unchanged.
- [x] Add the declarative schema file with the overview and by-date read functions and the create, update, and delete functions, each returning the affected entry; map the uniqueness and future-date failures to field errors in the Supabase repository.
- [x] Add application operations that reduce the entries to the `S19` view, validate and route the writes, and return `OperationResult` values through server composition and thin Server Actions; the caller passes the configured local date, so derivation stays pure.
- [x] Generate and review the migration; regenerate and review the database types.
- [x] Prepare the unit suite, the pgTAP suite, and a repository integration test that removes what it creates; add the integration file to `test:repository`; do not run them.
- [x] Update canonical documents, run only permitted static checks, and deliver one reviewable commit.

## Recorded decisions

The `F-009` local decisions this Task settles, now written into [`weight-and-body.md`](../../product/weight-and-body.md) and [`domain-model.md`](../../architecture/domain-model.md):

- weight lives in the History domain beside the exercise and split statistics, not in a separate Progress feature, because Weight is a History subsection under ADR-0003 and the chart contract it reuses already lives there;
- the chart contract moves to `src/features/history/domain/chart.ts`, where a point needs no workout and may carry a span, and a series may carry a companion; the exercise and split series are byte-for-byte what they were;
- the trailing chart window and the Monday-to-Sunday week are deliberately different things, and a weekly point sits on the last day its week reaches, so a provisional week is drawn at today;
- the previous weigh-in is the previous one by date;
- values are stored and shown to two decimals, and averages and changes are rounded to one decimal for display only;
- the chart opens on the month.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, UI asset checksums, Markdown lint, internal links, declarative-schema strict-coverage sync with migration review, regenerated-type diff, database lint, and `git diff --check`
- Results: Passed on `2026-09-06T13:12:40+02:00` with Node.js `22.21.0`, npm `10.9.4`, Supabase CLI `2.116.0`, and local PostgreSQL `17.6`. `npm run check` passed Prettier, ESLint including the dependency-boundary rules, strict TypeScript, the production build, the asset checksums, Markdown lint, and every internal link. The declarative sync produced one function-only migration under `--strict-coverage`, seven functions and no structural statement, which compiled inside an immediately rolled-back transaction before being applied locally for introspection; `npm run db:types` then added exactly the seven new function signatures and produced no further change on a second run; `supabase db lint --level error` reported no schema errors; and `git diff --check` was clean. No feature test ran: the two unit suites, the pgTAP suite, and the repository integration test are prepared and unexecuted. Re-run for the replacement on `2026-09-06T13:12:11+02:00`: `npm run check` passed every step again, a clean reset followed by the strict-coverage declarative sync reported no schema changes, `supabase db lint --level error` reported none, the regenerated types were unchanged because a grant does not reach them, and `git diff --check` was clean.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:unit` for the calendar-week boundaries, the provisional rule, the unavailable change, `n/7`, the individual change, the range windows, and recalculation; `npm run db:snapshot`; a clean `supabase db reset`; `npm run test:db` including the new weight suite; `npm run test:repository` including the new integration test; regenerated types compared with the committed file; then `npm run db:restore`. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** `f9edf3a4c3492faf672e12b2dc452d61898a21d7`, under the Task approval inherited per [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- **Results:** First verification on `2026-09-06T13:08:46+02:00` against exact approved delivery `94196f3be1f8f7b47b204637a16cc30d0520e916` in a fresh isolated worktree with Node.js `22.21.0`, npm `10.9.4`, Vitest `4.1.11`, Supabase CLI `2.116.0`, and local PostgreSQL `17.6`.

  `npm run test:unit` passed **174/174 across 21 files**, `supabase db reset` applied all 22 migrations and the seed, and `npm run test:db` passed **157/157 across nine suites**, including the new `0009_weight_operations` 22/22. The repository suite then failed **1 of 8 files**: every call from the application role was refused with `42501 permission denied for function weight_entry_json`.

  The defect is real and mine. `weight_entry_json` and `assert_weight_entry_values` are `security invoker`, so the caller executes them, and the schema revoked them from everyone without granting them to `service_role`. The five public functions were granted correctly, so nothing above the repository boundary could have caught it: the pgTAP suite runs as `postgres`, which owns them. Every internal helper in `0001_core.sql` carries that grant, and these two did not follow the convention.

  Replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7` adds the two grants to the declarative schema and to this Task's own migration, so one Task keeps one migration and a reset replays the corrected privileges. `supabase db reset` followed by the strict-coverage declarative sync then reported **no schema changes**, confirming the schema and the database agree, and the read that failed returned its JSON. The complete plan restarts from the beginning against the replacement.

  Second verification, against exact replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7` on `2026-09-06T13:17:52+02:00` in a fresh isolated worktree: **the complete plan passed**. `npm run test:unit` passed **174/174 across 21 files**; `supabase db reset` applied all 22 migrations and the seed; `npm run test:db` passed **157/157 across nine suites**, including `0009_weight_operations` **22/22**; `npm run test:repository` passed **8/8**, the weight file included; the regenerated types matched the committed file exactly; and `npm run db:restore` returned the Owner's data faithfully, ten exercises, one program, and three splits, with no weight row left behind by either suite.

## Delivery commit

- **Delivery commit SHA:** `f9edf3a4c3492faf672e12b2dc452d61898a21d7` (grant-only replacement; supersedes first delivery `94196f3be1f8f7b47b204637a16cc30d0520e916`)
- **Subject:** `T-038: grant the weight helpers to the service role`
- **Replacement scope:** two `grant execute` statements, in the declarative schema and in this Task's own migration; no application code, no new database object, and no change to the generated types
- **Original subject:** `T-038: build weight operations`
- **Committed scope:** the `0006_weight_operations.sql` declarative schema with its function-only migration and regenerated types; the History chart contract extracted to `domain/chart.ts` and generalized with an optional workout, a span, and a companion series, its consumers repointed and their series unchanged; the `weight` domain with the calendar weeks, the weekly average and change, the provisional rule, the individual change, and the two-series chart, beside `weight-validation`; the repository contract, Supabase repository, application operations, server composition, and Server Actions; the two prepared unit suites, the `0009_weight_operations` pgTAP suite, and the repository integration test with its `test:repository` registration; and the weight-and-body product, domain-model, server-boundary, and local-database-workflow documents

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T13:05:56+02:00`
- **Outcome:** Recommended for approval
- **Findings:** The authorized verification found the missing helper grant, recorded below

## Approval

- **Approved commit:** `94196f3be1f8f7b47b204637a16cc30d0520e916`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T13:05:56+02:00`
- **Approval note:** The Owner replied `potvrda` to the request to review this exact delivery. Under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md) this is the Task's one approval; in-scope replacements inherit it.

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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA of the first delivery; the replacement inherited it under ADR-0028
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks: `T-039` renders what this derives
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T00:49:17+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Created as the weight data and derivation within `F-009`; the Owner directed that nothing is committed or implemented until they say so |
| `2026-09-06T12:22:31+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | Locked after `F-008` completed: aligned with ADR-0028, the shared History chart and range helper, and the `T-037` browser harness; committed at the Owner's direction |
| `2026-09-06T12:39:15+02:00` | User / Owner | `Backlog` | `Ready` | The Owner accepted every `F-009` readiness answer and gave the go-ahead for the whole Feature |
| `2026-09-06T12:39:15+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began the weight data and derivation, the first Task of `F-009` |
| `2026-09-06T13:15:07+02:00` | Claude Code primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `94196f3be1f8f7b47b204637a16cc30d0520e916`; static checks passed and every prepared feature test remains unexecuted |
| `2026-09-06T13:05:56+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings |
| `2026-09-06T13:05:56+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `94196f3be1f8f7b47b204637a16cc30d0520e916` with `potvrda` |
| `2026-09-06T13:05:56+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | Began only the recorded unit, pgTAP, and repository verification against the exact approved delivery |
| `2026-09-06T13:12:11+02:00` | Claude Code primary agent / Tester and Executor | `Testing` | `Testing` | The repository suite refused every call with `42501`, because the two `security invoker` helpers were never granted to `service_role`; replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7` corrects the grants, inherits the Task approval under ADR-0028, and the complete plan restarts against it |
| `2026-09-06T13:17:52+02:00` | Claude Code primary agent / Tester | `Testing` | `Done` | The complete plan passed against exact replacement `f9edf3a4c3492faf672e12b2dc452d61898a21d7`: unit 174/174, pgTAP 157/157, repository 8/8, matching types, and a faithful restore |
