# ADR-0008: Milestone, Feature, and Task hierarchy

- **Status:** Accepted

## Context

The project-management system needs enough structure to connect product outcomes to daily work without turning every implementation step into a separately managed artifact. The commit-approval and testing gate also benefits from a smallest work unit with a clear review boundary.

## Decision

Use exactly three managed work-item levels:

1. **Milestone** — a larger approved delivery outcome, such as the local MVP.
2. **Feature** — a cohesive user-facing or cross-cutting capability within a Milestone.
3. **Task** — the smallest independently reviewable change, targeted to one delivery commit.

Implementation steps smaller than a Task remain checklist items inside that Task and do not receive their own lifecycle. If a checklist item needs independent ownership, blocking, approval, or a separate commit, promote it to a Task.

## Consequences

- Every Task belongs to one Feature, and every Feature belongs to one Milestone.
- Progress can roll up from Tasks to Features and Milestones.
- Commit confirmation and later test authorization can attach to a Task-sized scope.
- Work that grows beyond one independently reviewable delivery commit should be split into multiple Tasks.
- The exact identifier syntax remains a separate project-management decision.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`../process/development-governance.md`](../process/development-governance.md)
- [`0006-approval-gated-feature-testing.md`](0006-approval-gated-feature-testing.md)

## Subsequent refinement

[ADR-0021](0021-delivery-and-evidence-commit-model.md) clarifies that a Task targets one independently reviewable delivery commit. Narrow post-delivery evidence commits record review, approval, test, and completion events and do not count as additional delivery commits.
