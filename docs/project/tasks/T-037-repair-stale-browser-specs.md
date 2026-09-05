# T-037 — Repair the browser specs left stale by the archiving removal

- **Feature:** `F-008`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 7
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T22:52:00+02:00`
- **Updated:** `2026-09-05T22:52:00+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Await the Owner's confirmation that this belongs to `F-008` and may become `Ready`.

## Scope

Make `npm run test:browser` runnable as a whole again.

[`T-021`](T-021-replace-archiving-with-deletion-in-data.md) removed archiving under [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), which deleted the `archive_program` function and the `programs.status` column. Two browser specs still call both in their fixture setup and cleanup:

- `tests/browser/today-workout-start.spec.ts`
- `tests/browser/active-workout.spec.ts`

Neither has run since that removal, because the Tasks after it recorded unit, component, pgTAP, and repository verification rather than browser runs. Repoint their fixtures at deletion and the current-program selection, and re-verify the scenarios they already cover.

## Out of scope

- New browser coverage, including the History scenario delivered by [`T-032`](T-032-build-workout-history-mobile-experience.md), which runs on its own
- Any change to application behavior, schema, or product documentation
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] Neither spec references `archive_program`, `programs.status`, or any other removed artifact.
- [ ] `npm run test:browser` runs every spec without a fixture error on a freshly reset database.
- [ ] The scenarios still assert what they asserted before, with no coverage quietly dropped.

## Traceability

- MVP criteria: none directly; this restores the verification path for `MVP-TOD-001`–`003` and `MVP-WRK-001`–`012`
- ADRs: [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: None
- Blockers: The Owner has not yet confirmed the parent Feature or readiness
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: the local database workflow if the browser fixtures gain a precondition, this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: product behavior, architecture, and every screen document

## Execution checklist

- [ ] Replace the archiving fixtures in both specs with deletion and the current-program selection.
- [ ] Re-read both scenarios for other references to removed artifacts.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, Markdown lint, internal links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, a clean reset and the complete serialized Chromium and WebKit browser suite. Must not run before Owner approval of the exact commit.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-037: repair the stale browser specs`
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
- [ ] Owner confirms the parent Feature and the transition to `Ready`

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
| `2026-09-05T22:52:00+02:00` | Claude Code primary agent / Planner | Not allocated | `Backlog` | Discovered while preparing the `T-032` browser scenario: two specs still call the archiving artifacts `T-021` removed, so the browser suite cannot run as a whole |
