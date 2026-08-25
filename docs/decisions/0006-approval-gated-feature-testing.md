# ADR-0006: Approval-gated feature testing

- **Status:** Accepted

## Context

The user requires feature implementation and commit scope to be fully confirmed before any testing occurs. Test execution must not run speculatively during implementation or before the relevant commit has explicit approval.

## Decision

Do not run automated or manual feature tests until the user explicitly confirms that the relevant commit is fully approved. Authorization to implement or create a commit does not imply authorization to test it.

After approval, tests may cover only the confirmed feature/commit scope. A subsequent change to that scope requires renewed confirmation before additional testing.

## Consequences

- Implementation and commit review occur before feature-test execution.
- Agents must not automatically run tests as part of implementation.
- The future project-management system must represent commit confirmation, test permission, and test results.
- The exact distinction between feature tests and other verification commands remains to be defined by the project-management workflow; ambiguity does not grant permission to run a test.

## Related documents

- [`../process/development-governance.md`](../process/development-governance.md)
- [`../process/project-management.md`](../process/project-management.md)
- [`../../AGENTS.md`](../../AGENTS.md)
