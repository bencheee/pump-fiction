# ADR-0016: Operational reporting and projections

- **Status:** Accepted

## Context

Future chats need an immediately readable answer to who is doing what, when it changed, how it is progressing, what is blocked, and what must happen next. Detailed work-item files remain canonical, but loading all of them for routine orientation would defeat progressive disclosure.

## Decision

Maintain two derived views:

- root `PROJECT.md` as a concise operational dashboard;
- `docs/project/INDEX.md` as the complete registry and ID ledger.

The dashboard shows current phase and Milestone, exactly one immediate next action, ordered `Now` and `Next`, blockers, approval queue, approved Tasks ready for testing, five most recently completed Tasks, and a concise `Later` summary linking to the registry.

Displayed Tasks include ID, status, Executor, last-change timestamp, and next required action. The registry includes ID, parent, title, horizon/order, Task status or aggregate progress, responsible actor, last change, and canonical link.

Feature and Milestone progress is `Done required children / all required children`, accompanied by blocked and awaiting-approval counts.

Any change to status, scope, horizon/order, role, blocker, commit, approval, or test result updates the canonical work item, audit history, registry, dashboard where relevant, and parent rollups in the same Task. At work start, read the dashboard and active Task. At handoff, record the resulting state and exactly one next action.

If a projection conflicts with a canonical work-item file, the work-item file wins; correct and record the projection mismatch immediately.

## Consequences

- Routine orientation requires only a small dashboard.
- Full history remains available without cluttering the active view.
- Parent progress and approval/testing queues remain visible.
- Projection maintenance is an explicit completion obligation.
- The repository can answer who/what/when/how without external tooling.

## Related documents

- [`../../PROJECT.md`](../../PROJECT.md)
- [`../project/INDEX.md`](../project/INDEX.md)
- [`../process/project-management.md`](../process/project-management.md)
- [`0013-project-artifact-layout.md`](0013-project-artifact-layout.md)
- [`0015-readiness-and-completion-gates.md`](0015-readiness-and-completion-gates.md)
