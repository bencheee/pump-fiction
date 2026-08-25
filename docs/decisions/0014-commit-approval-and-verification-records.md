# ADR-0014: Commit approval and verification records

- **Status:** Superseded by [ADR-0021](0021-delivery-and-evidence-commit-model.md)

## Context

The accepted Task lifecycle requires durable evidence that review, user approval, test authorization, and test results all refer to the same immutable commit. It also needs a clear boundary between prohibited pre-approval feature testing and safe static checks.

## Decision

Use the following commit and evidence model:

- A Task targets one commit whose subject is `T-###: imperative summary`.
- The commit includes both implementation and every required documentation update.
- Before `In Review`, the Task records the full commit SHA.
- Review records Reviewer, timestamp, outcome, and findings without feature-test execution.
- User approval records `approved_commit`, `approved_by`, `approved_at`, and an approval note in the Task file. Chat approval is not durable until copied into that record.
- Any change to the approved SHA or scope clears approval and test authorization.
- A test plan may be written before approval but may not be executed.
- Authorized test results record commit SHA, command or manual scenario, Executor, timestamp, outcome, and relevant evidence.

Feature tests include unit, integration, end-to-end, running the application to validate behavior, and manual feature scenarios. They require `Approved` status.

Formatting, linting, type checking, compilation/build, and documentation-link validation are static checks rather than feature tests. They may run before approval and their results are recorded in the Task. Static checks do not grant permission to execute feature tests.

## Consequences

- Every approval and test result is traceable to an exact commit.
- A chat message alone cannot become the only long-term approval record.
- Documentation cannot be deferred to a later commit for the same Task.
- Safe code-quality feedback remains available before approval without exercising feature behavior.
- Post-approval changes always require a new review and approval cycle.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`0006-approval-gated-feature-testing.md`](0006-approval-gated-feature-testing.md)
- [`0010-task-lifecycle-and-test-gate.md`](0010-task-lifecycle-and-test-gate.md)
- [`0021-delivery-and-evidence-commit-model.md`](0021-delivery-and-evidence-commit-model.md)
