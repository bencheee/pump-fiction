# T-037 — Repair the browser specs left stale by the archiving removal

- **Feature:** `F-008`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 7
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T22:52:00+02:00`
- **Updated:** `2026-09-06T11:11:32+02:00`
- **Started:** `2026-09-06T11:01:09+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Repair both specs, run only the permitted static checks, and deliver one reviewable commit for the Owner's one approval under ADR-0028.

## Scope

Make `npm run test:browser` runnable as a whole again.

[`T-021`](T-021-replace-archiving-with-deletion-in-data.md) removed archiving under [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), which deleted the `archive_program` function and the `programs.status` column. Two browser specs still call both in their fixture setup and cleanup:

- `tests/browser/today-workout-start.spec.ts`
- `tests/browser/active-workout.spec.ts`

Neither has run since that removal, because the Tasks after it recorded unit, component, pgTAP, and repository verification rather than browser runs. Repoint their fixtures at deletion and the current-program selection, and re-verify the scenarios they already cover.

**Scope found on execution.** The staleness reached further than the two fixtures. Every spec written before `T-018` targets copy and flows that later Tasks changed, so the whole suite could not run: `exercise-library.spec.ts` and `programs-mobile.spec.ts` archive and reactivate definitions that can now only be deleted, expect a `Save as Draft` button and a `Program activated.` toast that `T-021` removed, expect saving to stay on the edit page where `T-018` returns to the parent, and expect the `Saved` toast that became `Exercise saved.`, `Program saved.`, and `Split saved.`; both specs named above additionally expect set confirmation and the restored-session banner, removed by `T-029` and `T-023`; and one `mobile-ui-foundation.spec.ts` test asserts that the active workout hides the primary navigation, the opposite of [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md). The outcome is unchanged, a runnable `npm run test:browser`, so all of it is repaired here; the coverage mapping is recorded under Acceptance criteria.

## Out of scope

- New browser coverage, including the History scenario delivered by [`T-032`](T-032-build-workout-history-mobile-experience.md), which runs on its own
- Any change to application behavior, schema, or product documentation
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] No spec references `archive_program`, `programs.status`, or any other removed artifact or copy.
- [ ] `npm run test:browser` runs every spec without a fixture error on a freshly reset database.
- [ ] The scenarios still assert what they asserted before, with no coverage quietly dropped. Where the product removed the behavior, the assertion follows the accepted replacement and this Task says so: archive and reactivate become delete with its confirmation, split count, successor rule, last-split guard, and no-current-program outcome (ADR-0024); the restored-session banner becomes the restored values themselves (`T-023`); set confirmation becomes the recorded count by values (ADR-0027); the focused shell becomes the primary navigation staying visible during a workout (ADR-0025).

## Traceability

- MVP criteria: none directly; this restores the verification path for `MVP-TOD-001`–`003` and `MVP-WRK-001`–`012`
- ADRs: [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md)
- Canonical documents: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: None
- Blockers: None. The Owner saw this Task under `F-008` in three reports without objection and directed on `2026-09-06` that the work stop waiting on repeated confirmations; it is the one Task that keeps `F-008` from `Done`
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: the local database workflow if the browser fixtures gain a precondition, this Task, `F-008`, registry, dashboard, and project state
- Documentation that should remain unchanged: product behavior, architecture, and every screen document

## Execution checklist

- [x] Replace the archiving fixtures in both specs with deletion and the current-program selection. Each spec that needs a current program of its own now remembers the seeded pointer and restores it, and deletes every workout, program, and exercise it created.
- [x] Re-read every scenario for other references to removed artifacts or copy, which found the four further stale specs and one stale test recorded above, and brought them to the current screens with the coverage mapping recorded under Acceptance criteria.
- [x] Run only permitted static checks and deliver one reviewable commit. `npx playwright test --list` parses all nine specs, 32 tests, without running any.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, Markdown lint, internal links, and `git diff --check`
- Results: Passed on `2026-09-06T11:11:32+02:00` with Node.js `24.20.0` and npm `11.19.0`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, the asset checksums, Markdown lint, and every internal link; `npx playwright test --list` parsed all nine specs into 32 tests without running any; a repository-wide search found no remaining reference to archiving, program statuses, draft saves, set confirmation, the restored-session banner, or the focused shell; `git diff --check` was clean. No feature test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: a clean reset, then the complete `npm run test:browser` suite, serialized on one worker across mobile Chromium and mobile WebKit, all nine specs and 32 tests. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Recorded by the evidence commit that follows this delivery
- **Subject:** `T-037: repair the stale browser specs`
- **Committed scope:** `today-workout-start`, `active-workout`, `exercise-library`, and `programs-mobile` rewritten to the current screens with their fixtures on deletion and the current-program pointer; the `mobile-ui-foundation` navigation test flipped to ADR-0025 with a seeded workout; and the local database workflow note on the browser fixtures' seed-pointer courtesy

## Discovered, not fixed here

The finish review still says `Confirmed sets count toward exercise personal records and charts.` in its explanation list, wording [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) replaced with recorded sets everywhere else. It is one line of copy in `finish-review.tsx`, outside this Task's test-only scope, and it needs the Owner's word on where it belongs.

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
- [x] Owner confirms the parent Feature and the transition to `Ready`, through the go-ahead for the whole `F-008` and the direction of `2026-09-06`

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
| `2026-09-06T11:01:09+02:00` | User / Owner | `Backlog` | `Ready` | The go-ahead for the whole `F-008` covers its last Task; the Owner raised no objection to its placement in three reports |
| `2026-09-06T11:01:09+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | Began repairing the two browser specs left stale by `T-021` |
