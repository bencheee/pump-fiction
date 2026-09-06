# ADR-0010: Task lifecycle and test gate

- **Status:** Accepted

## Context

Tasks need an explicit lifecycle that shows implementation, review, user approval, test permission, and completion as separate states. The lifecycle must make it impossible to interpret review or commit creation as permission to test.

## Decision

Use this normal Task flow:

`Backlog → Ready → In Progress → In Review → Awaiting Approval → Approved → Testing → Done`

- A commit hash is required before entering `In Review`.
- The Reviewer moves accepted review work to `Awaiting Approval` or returns it to `In Progress` with findings.
- Only the user as Approver moves a Task from `Awaiting Approval` to `Approved`.
- `Approved` means the referenced commit is fully confirmed and feature testing is permitted only for that exact scope.
- If no tests are required, an approved Task may move directly to `Done` with the reason recorded.
- A change to an approved commit or its scope returns the Task to `In Progress` and clears approval and test permission.
- Passing the authorized tests moves `Testing` to `Done`; a failure or required code change returns it to `In Progress` and invalidates the prior approval.
- `Blocked` may temporarily interrupt an active non-terminal state and must record the blocking reason and prior state.
- `Canceled` is terminal for explicitly abandoned work.

## Consequences

- Review, approval, and testing are visible and cannot be conflated.
- Every tested feature can be traced to a user-approved commit hash.
- Any post-approval change requires a fresh review and approval cycle before retesting.
- Documentation-only or otherwise non-tested Tasks still require commit approval before completion.
- Feature and Milestone progress can roll up from Task states; their presentation remains part of reporting design.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`0006-approval-gated-feature-testing.md`](0006-approval-gated-feature-testing.md)
- [`0009-project-management-roles.md`](0009-project-management-roles.md)

## Subsequent refinement

[ADR-0021](0021-delivery-and-evidence-commit-model.md) defines how a post-delivery evidence commit records the delivery SHA and lifecycle events without requiring the delivery commit to contain its own SHA. Approval and testing remain bound to the exact delivery commit.

[ADR-0028](0028-replacements-inherit-task-approval.md) refines the clearing rule: a replacement that stays within the Task's scope inherits the Task's approval and is re-verified without a new decision; approval clears only when a change leaves the scope or the Owner rejects the delivery.
