# Work-item registry

This is the complete derived registry for canonical Milestone, Feature, and Task files. Work-item files are authoritative if this registry ever disagrees with them.

## Next available identifiers

| Type | Next ID |
| --- | --- |
| Milestone | `M-002` |
| Feature | `F-002` |
| Task | `T-002` |

Allocated identifiers are never reused, including after cancellation.

## Milestones

| ID | Title | Horizon/order | Progress | Owner | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- |
| [`M-001`](milestones/M-001-local-mvp.md) | Local MVP | `Now / 1` | `0/1 registered; breakdown incomplete` | User | `2026-08-25T16:21:35+02:00` | [`milestones/M-001-local-mvp.md`](milestones/M-001-local-mvp.md) |

## Features

| ID | Milestone | Title | Horizon/order | Progress | Owner | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`F-001`](features/F-001-local-technical-architecture.md) | `M-001` | Local Technical Architecture | `Now / 1` | `0/1` | User | `2026-08-25T16:21:35+02:00` | [`features/F-001-local-technical-architecture.md`](features/F-001-local-technical-architecture.md) |

## Tasks

| ID | Feature | Title | Horizon/order | Status | Executor | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`T-001`](tasks/T-001-define-local-technical-architecture.md) | `F-001` | Define and document local technical architecture | `Now / 1` | `In Progress` | Codex primary agent | `2026-08-25T16:21:35+02:00` | [`tasks/T-001-define-local-technical-architecture.md`](tasks/T-001-define-local-technical-architecture.md) |

## Templates

- [`templates/milestone.md`](templates/milestone.md)
- [`templates/feature.md`](templates/feature.md)
- [`templates/task.md`](templates/task.md)

See [`../process/project-management.md`](../process/project-management.md) for the accepted workflow and [ADR-0016](../decisions/0016-operational-reporting-and-projections.md) for reporting rules.
