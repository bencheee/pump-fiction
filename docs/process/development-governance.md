# Development governance

- **Status:** Accepted

This document defines non-optional rules for future decision-making, implementation, commits, documentation, and feature testing. The architectural rationale is preserved in [ADR-0005](../decisions/0005-documentation-as-system-of-record.md), and the testing gate in [ADR-0006](../decisions/0006-approval-gated-feature-testing.md).

## Documentation as part of the work

Documentation must remain synchronized with the actual accepted system at all times.

- Every architectural decision is recorded in an ADR.
- Every architectural change updates its ADR status and all affected canonical architecture, product, process, and project-state documents in the same task.
- A small local decision is recorded in its canonical topic document; a cross-cutting decision receives an ADR.
- No architectural decision may exist only in chat, code, a commit message, or an agent's assumptions.
- Documentation updates are part of the change itself, not later cleanup.
- Work is not complete while relevant documentation is missing, stale, contradictory, or describes behavior the implementation does not provide.
- When implementation and documentation disagree, stop and report the mismatch. Resolve it explicitly; do not silently choose either source.
- Superseded decisions remain in history and link to their replacements.

## Commit approval and feature-testing gate

No automated or manual feature test may run until the user explicitly confirms that the relevant commit is fully approved.

- Permission to plan, implement, stage, or commit does not grant permission to test.
- Do not run a test suite, targeted feature test, or manual feature test before that explicit confirmation.
- After confirmation, test only the approved feature and commit scope.
- If the commit changes after confirmation, the change must stay within the approved Task scope. A replacement that does inherits the Task's approval and is re-verified in full without a new confirmation, per [ADR-0028](../decisions/0028-replacements-inherit-task-approval.md); a change that leaves the scope is a new Task and needs its own confirmation.
- Record test permission and eventual results through the project-management system once that system is defined.

The project-management design must define the precise commit lifecycle and how confirmation is represented, without weakening this gate.

The accepted representation is the Task lifecycle in [ADR-0010](../decisions/0010-task-lifecycle-and-test-gate.md): only the user's transition of the exact commit from `Awaiting Approval` to `Approved` unlocks feature testing.

Per [ADR-0021](../decisions/0021-delivery-and-evidence-commit-model.md), review and each verification run bind to one exact delivery commit, while narrow evidence commits durably record later events. Per [ADR-0028](../decisions/0028-replacements-inherit-task-approval.md), the approval itself is the Task's: the Owner approves the first delivery once, and replacements within scope inherit it. Feature tests include unit, integration, end-to-end, application execution for behavioral validation, and manual feature scenarios. Formatting, linting, type checking, compilation/build, and documentation-link validation are permitted static checks; they do not authorize feature testing.

## Required sequence

1. Keep decisions and canonical documentation current.
2. Define the project-management system.
3. Define and accept the local technical architecture.
4. Initialize implementation only after both systems are documented.
5. Apply the commit-approval gate before any feature testing.
