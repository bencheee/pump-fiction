# T-030 — Delete the exercise the command repository test creates

- **Feature:** `F-013`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-05T20:01:16+02:00`
- **Updated:** `2026-09-05T20:01:16+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Owner confirms the transition to `Ready`.

## Scope

`src/server/repositories/supabase-active-workout-command-repository.integration.test.ts` creates an exercise through `create_exercise_definition` and its `finally` block deletes only the workout, so every authorized repository run leaves one orphan `T-008 exercise <uuid>` in the Owner's exercise library. The `T-027` verification on `2026-09-05` found one such row already present from an earlier run.

Delete the created exercise in the same `finally` block, in the order the foreign keys require.

## Out of scope

- Any schema, migration, product, or screen change
- The other repository integration tests, whose fixtures already clean up
- Weakening the approval-gated verification rule

## Acceptance criteria

- [ ] After an authorized `npm run test:repository` run the exercise library holds exactly the rows it held before.
- [ ] The suite still passes unchanged.

## Traceability

- MVP criteria: none; this Task changes the development workflow
- ADRs: [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md)
- Canonical documents: [`../../architecture/local-database-workflow.md`](../../architecture/local-database-workflow.md)

## Dependencies and blockers

- Dependencies: `T-027` is `Done`
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to update: this Task, `F-013`, registry, dashboard, and project state
- Documentation that should remain unchanged: the verification gate, the seed and snapshot sections, and the schema guidance

## Execution checklist

- [ ] Delete the created exercise in the test's `finally` block.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** an authorized `npm run test:repository` run with the exercise-library row count compared before and after; must not run before Owner approval of the exact commit
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-030: delete the exercise the command repository test creates`
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
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [ ] Owner confirms the transition to `Ready`

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
| `2026-09-05T20:01:16+02:00` | Claude Code primary agent / Executor | None | `Backlog` | Found during the authorized `T-027` verification: the command repository test leaves its exercise behind |
