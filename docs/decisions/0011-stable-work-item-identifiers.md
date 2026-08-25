# ADR-0011: Stable work-item identifiers

- **Status:** Accepted

## Context

Work items need short identifiers that remain valid in documentation, commits, approvals, and test records. Encoding hierarchy into an identifier would make it misleading or require renaming when an item moves.

## Decision

Assign globally unique, type-specific, zero-padded identifiers:

- Milestone: `M-001`, `M-002`, …
- Feature: `F-001`, `F-002`, …
- Task: `T-001`, `T-002`, …

Each type has its own monotonically increasing numeric sequence. Identifiers are immutable and never reused, including after cancellation or archival. Parent relationships are stored as explicit fields rather than encoded in the identifier.

Renaming or moving a work item does not change its identifier. References in commits, ADRs, canonical documentation, approvals, and test records use the stable identifier.

## Consequences

- Links and historical references survive renames and hierarchy changes.
- Parentage remains explicit and queryable instead of implicit in a string.
- Canceled identifiers leave intentional gaps and are not recycled.
- The project-management artifact layout may use the identifier in filenames without making the filename itself canonical identity.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`0008-milestone-feature-task-hierarchy.md`](0008-milestone-feature-task-hierarchy.md)
