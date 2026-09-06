# T-048 — Run the release verification and close the Local MVP

- **Feature:** `F-010`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 6
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T14:52:00+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Await `T-043` through `T-046` and the Owner's own visual-comparison result.

## Scope

The last Task of the Milestone. Run the whole verification once against one approved tree, fill the record, and close `F-010` and `M-001`.

- Run the complete suite against the exact approved delivery after a clean reset, with the Owner's data snapshotted before and restored after: `npm run test:unit`, `npm run test:components`, `npm run test:db`, `npm run test:repository`, and `npm run test:browser`, including the `T-045` and `T-046` scenarios and every earlier Feature's specs. This is the release-level re-verification: it proves the Features hold together on one tree, where each earlier run proved only its own Feature against its own delivery.
- Fill every row of `docs/project/mvp-release-verification.md` with the release-run evidence beside the per-Feature evidence it already cites, so all 57 criteria carry a verification against an approved commit and the release run contradicts none of them.
- Record the Owner's own visual comparison as the evidence for the `F-010` fidelity criterion. The Owner performs it outside the managed Task flow, so this Task writes down what they report — date, coverage, outcome, and any accepted deviation — and never claims a comparison the repository did not run.
- Sweep the documentation for the disagreements the release reading finds, and correct them: the `T-003-v1` package's `Draft for Task review` status line, which `T-003` completed and `T-004` superseded, and its criteria map and wireframes, which still describe archiving and the per-set mode chooser. The versioned outbound package is a historical record of what was sent to the designer, so it is annotated as superseded rather than rewritten.
- Complete `F-010` and `M-001`, and bring the registry, the dashboard, and the project state to the closing state.

## Out of scope

- New behavior, new screens, and any correction beyond a documentation disagreement; a functional defect the release run finds becomes its own Task and the Milestone waits for it
- Rewriting either frozen design package
- Production deployment, production-access protection, and every accepted post-MVP capability
- The Owner's confirmation of the Local MVP result, which is theirs to give

## Acceptance criteria

- [ ] The complete suite ran against one exact approved delivery after a clean reset, and every result is recorded with its command, counts, and timestamp.
- [ ] All 57 criteria carry a verification against an approved commit, and the release run contradicts none.
- [ ] The Owner's own visual comparison is recorded with its date, coverage, and outcome, and every difference they report has a Task or an accepted-deviation record.
- [ ] The Owner's data is restored faithfully after the run, and no scenario row remains.
- [ ] The documentation sweep leaves no known disagreement between code and canonical documentation, and every superseded design-brief statement is annotated rather than silently rewritten.
- [ ] `F-010` and `M-001` record their completion gates, and the registry, dashboard, and project state match.
- [ ] No required follow-up is hidden: every discovered item has a Task or an Owner decision.

## Traceability

- MVP criteria: all 57, at release level
- ADRs: [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md), [ADR-0015](../../decisions/0015-readiness-and-completion-gates.md), [ADR-0016](../../decisions/0016-operational-reporting-and-projections.md), [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../process/development-governance.md`](../../process/development-governance.md), [`../../process/project-management.md`](../../process/project-management.md), [`../../design/T-003-v1/README.md`](../../design/T-003-v1/README.md), [`../../PROJECT_STATE.md`](../../PROJECT_STATE.md), [`../INDEX.md`](../INDEX.md), [`../../../PROJECT.md`](../../../PROJECT.md)

## Dependencies and blockers

- Dependencies: `T-043` through `T-046` `Done`; the Owner's own visual-comparison result
- Blockers: the `F-010` go-ahead; a functional defect found by `T-045` or `T-046` and not yet closed
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `docs/project/mvp-release-verification.md`, the `T-003-v1` package's status and superseded-statement annotations, this Task, `F-010`, `M-001`, registry, dashboard, project state
- Documentation that should remain unchanged: the locked criteria text, the `T-004-v0.4-frozen` manifest, every completed Task record

## Execution checklist

- [ ] Snapshot the Owner's data, reset, and run the complete suite against the approved tree.
- [ ] Record every command, count, and outcome, and restore the Owner's data.
- [ ] Fill the matrix with the release-run evidence and record the Owner's visual-comparison result as they report it.
- [ ] Sweep the documentation and annotate every superseded statement.
- [ ] Record the `F-010` and `M-001` completion gates and synchronize the three projections.
- [ ] Hand the Owner exactly one next action: their confirmation of the Local MVP result.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:unit`, `npm run test:components`, `npm run test:db`, `npm run test:repository`, and `npm run test:browser` on one worker across mobile Chromium and mobile WebKit, in a fresh isolated worktree at the exact approved delivery, after `npm run db:snapshot`, a clean `supabase db reset`, and with `npm run db:restore` afterwards. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-048: run the release verification and close the Local MVP`
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
- [ ] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
- [x] Scope fits one independently reviewable delivery commit
- [ ] Owner confirms transition to `Ready`

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
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | `T-047` was canceled, so this Task records the Owner's own visual comparison instead of citing a repository run |
