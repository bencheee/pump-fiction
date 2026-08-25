# ADR-0009: Project-management roles and approval authority

- **Status:** Accepted

## Context

Every work item must make responsibility visible without implying that an agent can approve its own scope or bypass the user's commit-confirmation and testing gate. The project is currently private and user-directed, while execution or review may later be assigned to Codex agents or other collaborators.

## Decision

Use four logical roles:

- **Owner** — the user; owns product scope, priorities, and accepted decisions.
- **Executor** — the named Codex agent or person responsible for completing a Task and updating all affected documentation.
- **Reviewer** — the named Codex agent or person responsible for reviewing the proposed commit against Task scope, acceptance criteria, decisions, and documentation without running feature tests.
- **Approver** — the user only; gives final commit approval, which unlocks testing for that confirmed scope under ADR-0006.

Every Task records an Executor and Reviewer. Roles are logical responsibilities, so one actor may hold more than one role, but no actor other than the user may perform final approval. Assignment of a Codex reviewer does not authorize spawning or delegating to an agent unless the user separately requests it.

## Consequences

- Product authority and final approval stay with the user.
- Task records always show who performs and who reviews the work.
- Review is distinct from test execution and cannot bypass the testing gate.
- A Reviewer may recommend approval or request changes but cannot grant final approval unless the Reviewer is the user acting as Approver.
- The project-management lifecycle must include an explicit state where work awaits user approval.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`0006-approval-gated-feature-testing.md`](0006-approval-gated-feature-testing.md)
