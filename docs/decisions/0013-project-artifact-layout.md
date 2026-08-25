# ADR-0013: Project-management artifact layout

- **Status:** Accepted

## Context

Project state needs a fast operational entry point, a complete registry, durable canonical work-item records, and reusable schemas. Moving completed files into archive folders would break stable links, while putting all detail in one dashboard would make routine context too large.

## Decision

Use this repository layout:

```text
PROJECT.md
docs/project/
  INDEX.md
  milestones/
  features/
  tasks/
  templates/
```

- `PROJECT.md` is a concise derived operational dashboard.
- `docs/project/INDEX.md` is the derived complete work-item registry and next-ID ledger.
- Every Milestone, Feature, and Task has one canonical Markdown file in its type directory.
- A work-item file is authoritative for its scope, status, roles, relationships, documentation impact, approval, and audit history.
- Work-item files never move after creation; completed and canceled records remain at their original paths.
- Dashboard and registry projections update in the same Task as every relevant canonical work-item change.
- Reusable Milestone, Feature, and Task templates are added under `docs/project/templates/` when their complete schemas are accepted.

If a derived view conflicts with a canonical work-item file, the work-item file wins and the stale projection must be corrected immediately.

## Consequences

- Future chats can read one small dashboard before opening detailed work items.
- All active and historical work remains auditable through stable links.
- Registry counters prevent identifier reuse.
- Status duplication in projections requires disciplined same-Task updates.
- Templates cannot be finalized until remaining required fields and completion rules are accepted.

## Related documents

- [`../../PROJECT.md`](../../PROJECT.md)
- [`../project/INDEX.md`](../project/INDEX.md)
- [`../process/project-management.md`](../process/project-management.md)
- [`0007-repository-native-project-management.md`](0007-repository-native-project-management.md)
