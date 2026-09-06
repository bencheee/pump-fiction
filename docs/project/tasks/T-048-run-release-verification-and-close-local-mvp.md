# T-048 — Run the release verification and close the Local MVP

- **Feature:** `F-010`
- **Status:** `Awaiting Approval`
- **Horizon:** `Next`
- **Order:** 6
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T18:24:00+02:00`
- **Started:** `2026-09-06T18:14:00+02:00`
- **Review started:** `2026-09-06T18:22:00+02:00`
- **Approval requested:** `2026-09-06T18:22:00+02:00`
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** The Owner's approval of the exact delivery commit, which authorizes the release run.

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

- Dependencies: `T-043` through `T-046` and `T-049` and `T-050` `Done`; the Owner's own visual-comparison result, which reaches the repository through an evidence commit when they report it
- Blockers: None; `T-045` and `T-046` found no functional defect, and all 57 criteria carry verification
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `docs/project/mvp-release-verification.md`, the `T-003-v1` package's status and superseded-statement annotations, this Task, `F-010`, `M-001`, registry, dashboard, project state
- Documentation that should remain unchanged: the locked criteria text, the `T-004-v0.4-frozen` manifest, every completed Task record

## Execution checklist

- [ ] Snapshot the Owner's data, reset, and run the complete suite against the approved tree.
- [ ] Record every command, count, and outcome, and restore the Owner's data.
- [ ] Fill the matrix with the release-run evidence and record the Owner's visual-comparison result as they report it.
- [x] Sweep the documentation and annotate every superseded statement.
- [ ] Record the `F-010` and `M-001` completion gates and synchronize the three projections.
- [ ] Hand the Owner exactly one next action: their confirmation of the Local MVP result.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Passed on `2026-09-06T18:22:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, the UI asset checksums, Markdown lint across 132 files, and all 1421 internal links. `git diff --check` was clean. This delivery changes documentation only. No feature test ran; the release run follows its approval.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:unit`, `npm run test:components`, `npm run test:db`, `npm run test:repository`, and `npm run test:browser` on one worker across mobile Chromium and mobile WebKit, in a fresh isolated worktree at the exact approved delivery, after `npm run db:snapshot`, a clean `supabase db reset`, and with `npm run db:restore` afterwards. Must not run before that approval; replacements inherit it under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md).
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb`
- **Subject:** `T-048: sweep the documentation for the release`
- **Committed scope:** the `T-003-v1` package status and its supersession table; the two router rows that called the design packages current; the archived state, the drag-handle mention, and the unapproved-package sentence in the design-collaboration process; the mobile UI foundation's status line; this Task. No application source, schema, migration, generated type, or test source changed.

## Why this Task delivers before it runs

`T-048` carries both a documentation change and the release run, and [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md) puts them in that order: the delivery commit holds the scoped change, approval follows, and the run happens against the approved tree with its results recorded by evidence commits. So the documentation sweep is the delivery, and the release run, the Owner's visual comparison, and the `F-010` and `M-001` completion records are the evidence that follows it.

## The documentation sweep

The release reading found seven statements that accepted decisions had moved past, all in documents no implementation Task had reason to open:

- the `T-003-v1` package still called itself `Draft for Task review`, though `T-003` delivered and the Owner approved it on 2026-08-26;
- that package predates ADR-0023 through ADR-0027 and the reorder decision, so archiving, confirmed sets, the focused shell, four exercise types with a per-set mode chooser, and drag handles all still appear throughout it. It is **not** rewritten — a brief records what was sent, and editing it would falsify what the design agent was asked for — so its README now carries one table naming each supersession and its decision;
- [`../../INDEX.md`](../../INDEX.md) called that package `Current` and the frozen return package a `candidate`, though one is historical and the other has been accepted since 2026-08-31;
- the design-collaboration process required an `archived` state in every future brief, named drag handles among the interaction rules a brief must carry, and still said the `T-003-v1` package remained unapproved;
- the mobile UI foundation still called itself `Implemented through T-016`, four Features and eleven Tasks ago.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T18:22:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** Nothing in the sweep changes behavior or a criterion. The design packages keep every word they were sent with; only their README says what has since been decided against them. What remains for the evidence commits is the release run, the Owner's own visual comparison, and the two completion records.

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
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | Claude Code primary agent / Planner | `Backlog` | `Backlog` | `T-047` was canceled, so this Task records the Owner's own visual comparison instead of citing a repository run |
| `2026-09-06T18:14:00+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed the close once `T-046` completed and all 57 criteria carried verification |
| `2026-09-06T18:14:00+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | The documentation sweep is delivered first; the release run follows its approval, and the Owner's visual comparison is recorded as evidence when they report it |
| `2026-09-06T18:22:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered the documentation sweep; approval authorizes the release run against this exact tree |
