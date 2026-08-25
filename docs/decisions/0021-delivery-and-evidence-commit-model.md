# ADR-0021: Delivery and evidence commit model

- **Status:** Accepted

## Context

The original commit-evidence model required a Task's delivery commit to contain its own full SHA before the Task entered review. That is technically impossible: a commit SHA depends on its complete tree and metadata, so writing that SHA into a tracked Task file creates a different commit with a different SHA.

Review, approval, test authorization, and results still need durable repository-native evidence tied to one immutable delivery snapshot. Recording those events also necessarily happens after the delivery commit exists. Treating each record update as a new delivery change would create an infinite approval regress.

The repository additionally has no pre-existing Git commit. `T-001` therefore needs one explicit bootstrap rule for the already accepted specification, governance, project-management, and architecture documents that predate its formal delivery commit.

## Decision

### Delivery commit

Each Task targets one independently reviewable **delivery commit** with subject:

`T-###: imperative summary`

The delivery commit contains the Task's complete implementation or documentation outcome and every canonical documentation change required by that outcome. It does not attempt to contain its own SHA. Scope that requires another independently reviewable delivery commit becomes another Task.

Canonical product, UX, architecture, and process documents in the delivery tree describe accepted system state without embedding a future Task review, approval, or completion status. Those lifecycle projections belong only in the project-management evidence paths so they can change after delivery without making canonical specification stale or changing the delivery scope.

The delivery commit SHA is the immutable object that the Reviewer reviews, the user approves, and authorized tests exercise. Any change to delivered code, behavior, architecture, specification, configuration, test source, or other scoped outcome requires a new delivery commit SHA, returns the Task to `In Progress`, and clears review, approval, and test authorization for the replaced SHA.

### Evidence commits

After the delivery commit exists, use one or more repository-native **evidence commits** to record events that cannot exist inside it:

- delivery commit SHA and transition into review;
- review timestamp, outcome, and findings;
- approval request and user approval of the exact delivery SHA;
- authorized test start and results;
- completion status, transition history, parent rollups, registry, dashboard, and project-state projections.

Evidence commits use the subject format:

`PM T-###: record event`

They may change only project-management evidence and projections in:

- `PROJECT.md`;
- `docs/PROJECT_STATE.md`;
- the Task's canonical file;
- its parent Feature and Milestone files;
- `docs/project/INDEX.md`.

They must not change product behavior, architecture, canonical product/process specification, application source, database artifacts, dependency configuration, test source, or the delivery scope. An evidence commit that crosses that boundary is invalid as evidence and requires normal Task planning and delivery approval.

Evidence commits are administrative records, not additional Task delivery commits. They do not require their own Task, review, approval, or tests; otherwise evidence recording would recurse forever. They never replace the recorded delivery SHA and do not invalidate approval of that SHA. Corrections to evidence use another evidence commit without rewriting history.

An evidence commit does not record its own SHA in the files it changes. Its `PM T-###: record event` subject, Git history, and recorded event content identify it without recreating the same self-reference. Work-item files record the delivery SHA and event facts, not the evidence commit's identifier.

### Lifecycle and exact-SHA testing

Create the delivery commit while the Task is `In Progress`. Then create an evidence commit that records its full SHA and the `In Review` transition. Review and approval always name that delivery SHA.

When the user approves it, an evidence commit records `approved_commit`, actor, timestamp, note, and `Approved` transition. If tests are required, execute them against the exact delivery tree, not against later evidence-only history, and record results in a subsequent evidence commit. A documentation-only Task with an accepted no-test reason may move from `Approved` to `Done` through evidence recording without running tests.

### T-001 bootstrap exception

Because this repository has no earlier commit, the `T-001` delivery commit establishes the initial repository documentation baseline in addition to delivering the accepted local technical architecture. It may therefore contain all user-approved specification, UX, architecture, governance, project-management, work-item, and agent-guide Markdown accumulated before the formal Task existed.

This exception applies only to the first `T-001` delivery commit. It introduces no application code, dependencies, database, migrations, tests, or deployment artifacts and does not weaken future Task scope rules.

## Consequences

- No commit is required to contain its own cryptographic identifier.
- The independently reviewable delivery snapshot remains one exact SHA.
- Review, approval, testing, and completion remain durable and repository-native.
- Administrative record commits are visibly distinct from delivery commits and narrowly path-limited.
- Tests can be executed against the approved delivery tree even though later evidence commits exist on the branch.
- Project history gains a small number of evidence commits per Task, which is the cost of auditable post-commit events.
- `T-001` can establish a truthful initial Git baseline without reconstructing artificial historical commits.

## Supersedes and refines

- Supersedes the self-referential evidence mechanism in [ADR-0014](0014-commit-approval-and-verification-records.md), while preserving its static-check and approval-gated test boundary.
- Refines the one-commit target in [ADR-0008](0008-milestone-feature-task-hierarchy.md) to mean one delivery commit, excluding narrow evidence commits.
- Refines lifecycle recording in [ADR-0010](0010-task-lifecycle-and-test-gate.md) and completion evidence in [ADR-0015](0015-readiness-and-completion-gates.md).

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`../project/templates/task.md`](../project/templates/task.md)
- [`../project/tasks/T-001-define-local-technical-architecture.md`](../project/tasks/T-001-define-local-technical-architecture.md)
