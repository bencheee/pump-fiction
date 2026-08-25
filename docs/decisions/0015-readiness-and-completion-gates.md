# ADR-0015: Readiness and completion gates

- **Status:** Accepted

## Context

Lifecycle labels alone cannot guarantee that work is sufficiently defined before execution or genuinely complete afterward. The project needs explicit gates that enforce scope clarity, documentation currency, user approval, and authorized verification.

## Decision

A Task is `Ready` only when it has an ID and parent, clear scope and out-of-scope, observable acceptance criteria, relevant MVP/ADR/document links, named Executor and Reviewer, resolved blockers, known dependencies, documentation impact, an execution checklist, a static-check plan, and `test_required` with an unexecuted test plan or reason for no tests. Its scope must fit one delivery commit, and the Owner must approve entry into `Ready`.

A Task is `Done` only when review is satisfied, the user approved the exact commit SHA, scope and acceptance criteria are satisfied, documentation and ADRs are current, authorized tests passed or the no-test reason is recorded, static-check and audit records are complete, projections and parent progress are current, and no follow-up scope is hidden inside the completed Task.

A Feature or Milestone is ready when its outcome, boundaries, acceptance/completion criteria, relationships, dependencies, and child breakdown are clear. It is done only when all required children are `Done`, documentation is current, its outcome criteria are satisfied, and the user confirms the result.

## Consequences

- Undefined work remains in `Backlog` rather than starting on assumptions.
- Documentation and decision records are enforceable completion requirements.
- User approval is required at both commit and aggregate outcome boundaries.
- Follow-up work remains visible as new Tasks instead of disappearing into completion notes.
- Templates can encode the accepted gates consistently.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../project/templates/milestone.md`](../project/templates/milestone.md)
- [`../project/templates/feature.md`](../project/templates/feature.md)
- [`../project/templates/task.md`](../project/templates/task.md)
- [`0010-task-lifecycle-and-test-gate.md`](0010-task-lifecycle-and-test-gate.md)
- [`0014-commit-approval-and-verification-records.md`](0014-commit-approval-and-verification-records.md)

## Subsequent refinement

[ADR-0021](0021-delivery-and-evidence-commit-model.md) clarifies that “one commit” means one delivery commit. Narrow evidence commits record post-delivery review, approval, authorized testing, projections, and completion without expanding Task scope.
