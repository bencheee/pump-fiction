# Work-item registry

This is the complete derived registry for canonical Milestone, Feature, and Task files. Work-item files are authoritative if this registry ever disagrees with them.

## Next available identifiers

| Type | Next ID |
| --- | --- |
| Milestone | `M-002` |
| Feature | `F-011` |
| Task | `T-005` |

Allocated identifiers are never reused, including after cancellation.

## Milestones

| ID | Title | Horizon/order | Progress | Owner | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- |
| [`M-001`](milestones/M-001-local-mvp.md) | Local MVP | `Now / 1` | `2/10 Features Done` | User | `2026-08-26T12:40:26+02:00` | [`milestones/M-001-local-mvp.md`](milestones/M-001-local-mvp.md) |

## Features

| ID | Milestone | Title | Horizon/order | Progress | Owner | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`F-001`](features/F-001-local-technical-architecture.md) | `M-001` | Local Technical Architecture | `Now / 1` | `1/1 Done` | User | `2026-08-25T16:27:49+02:00` | [`features/F-001-local-technical-architecture.md`](features/F-001-local-technical-architecture.md) |
| [`F-002`](features/F-002-mvp-delivery-planning.md) | `M-001` | MVP Delivery Planning | `Now / 2` | `1/1 Done` | User | `2026-08-25T16:49:33+02:00` | [`features/F-002-mvp-delivery-planning.md`](features/F-002-mvp-delivery-planning.md) |
| [`F-003`](features/F-003-mobile-ui-ux-design-package.md) | `M-001` | Mobile UI/UX Design Package | `Now / 1` | `0/2 Done` | User | `2026-08-26T12:40:26+02:00` | [`features/F-003-mobile-ui-ux-design-package.md`](features/F-003-mobile-ui-ux-design-package.md) |
| [`F-004`](features/F-004-application-and-data-foundation.md) | `M-001` | Application and Data Foundation | `Next / 2` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-004-application-and-data-foundation.md`](features/F-004-application-and-data-foundation.md) |
| [`F-005`](features/F-005-exercise-library.md) | `M-001` | Exercise Library | `Next / 3` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-005-exercise-library.md`](features/F-005-exercise-library.md) |
| [`F-006`](features/F-006-programs-and-splits.md) | `M-001` | Programs and Splits | `Next / 4` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-006-programs-and-splits.md`](features/F-006-programs-and-splits.md) |
| [`F-007`](features/F-007-today-and-active-workout.md) | `M-001` | Today and Active Workout | `Next / 5` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-007-today-and-active-workout.md`](features/F-007-today-and-active-workout.md) |
| [`F-008`](features/F-008-history-and-statistics.md) | `M-001` | History and Statistics | `Next / 6` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-008-history-and-statistics.md`](features/F-008-history-and-statistics.md) |
| [`F-009`](features/F-009-weight-and-body-progress.md) | `M-001` | Weight and Body Progress | `Next / 7` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-009-weight-and-body-progress.md`](features/F-009-weight-and-body-progress.md) |
| [`F-010`](features/F-010-local-mvp-integration.md) | `M-001` | Local MVP Integration | `Next / 8` | `0/0; breakdown pending` | User | `2026-08-25T16:35:55+02:00` | [`features/F-010-local-mvp-integration.md`](features/F-010-local-mvp-integration.md) |

## Tasks

| ID | Feature | Title | Horizon/order | Status | Executor | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`T-001`](tasks/T-001-define-local-technical-architecture.md) | `F-001` | Define and document local technical architecture | `Now / 1` | `Done` | Codex primary agent | `2026-08-25T16:27:49+02:00` | [`tasks/T-001-define-local-technical-architecture.md`](tasks/T-001-define-local-technical-architecture.md) |
| [`T-002`](tasks/T-002-define-mvp-delivery-and-design-workflow.md) | `F-002` | Define MVP delivery and external-design workflow | `Now / 1` | `Done` | Codex primary agent | `2026-08-25T16:49:33+02:00` | [`tasks/T-002-define-mvp-delivery-and-design-workflow.md`](tasks/T-002-define-mvp-delivery-and-design-workflow.md) |
| [`T-003`](tasks/T-003-prepare-mobile-design-agent-brief.md) | `F-003` | Prepare mobile design-agent brief and wireframes | `Now / 1` | `In Review` | Codex primary agent | `2026-08-26T12:40:26+02:00` | [`tasks/T-003-prepare-mobile-design-agent-brief.md`](tasks/T-003-prepare-mobile-design-agent-brief.md) |
| [`T-004`](tasks/T-004-audit-and-accept-design-handoff.md) | `F-003` | Request, audit, and accept design handoff | `Next / 2` | `Backlog` | Codex primary agent | `2026-08-25T16:35:55+02:00` | [`tasks/T-004-audit-and-accept-design-handoff.md`](tasks/T-004-audit-and-accept-design-handoff.md) |

## Templates

- [`templates/milestone.md`](templates/milestone.md)
- [`templates/feature.md`](templates/feature.md)
- [`templates/task.md`](templates/task.md)

See [`../process/project-management.md`](../process/project-management.md) for the accepted workflow and [ADR-0016](../decisions/0016-operational-reporting-and-projections.md) for reporting rules.
