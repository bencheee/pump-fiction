# Work-item registry

This is the complete derived registry for canonical Milestone, Feature, and Task files. Work-item files are authoritative if this registry ever disagrees with them.

## Next available identifiers

| Type | Next ID |
| --- | --- |
| Milestone | `M-002` |
| Feature | `F-011` |
| Task | `T-012` |

Allocated identifiers are never reused, including after cancellation.

## Milestones

| ID | Title | Horizon/order | Progress | Owner | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- |
| [`M-001`](milestones/M-001-local-mvp.md) | Local MVP | `Now / 1` | `4/10 Features Done` | User | `2026-09-02T08:55:13+02:00` | [`milestones/M-001-local-mvp.md`](milestones/M-001-local-mvp.md) |

## Features

| ID | Milestone | Title | Horizon/order | Progress | Owner | Updated | Canonical file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`F-001`](features/F-001-local-technical-architecture.md) | `M-001` | Local Technical Architecture | `Now / 1` | `1/1 Done` | User | `2026-08-25T16:27:49+02:00` | [`features/F-001-local-technical-architecture.md`](features/F-001-local-technical-architecture.md) |
| [`F-002`](features/F-002-mvp-delivery-planning.md) | `M-001` | MVP Delivery Planning | `Now / 2` | `1/1 Done` | User | `2026-08-25T16:49:33+02:00` | [`features/F-002-mvp-delivery-planning.md`](features/F-002-mvp-delivery-planning.md) |
| [`F-003`](features/F-003-mobile-ui-ux-design-package.md) | `M-001` | Mobile UI/UX Design Package | `Now / 1` | `2/2 Done` | User | `2026-08-31T12:06:31+02:00` | [`features/F-003-mobile-ui-ux-design-package.md`](features/F-003-mobile-ui-ux-design-package.md) |
| [`F-004`](features/F-004-application-and-data-foundation.md) | `M-001` | Application and Data Foundation | `Now / 1` | `5/5 Done` | User | `2026-09-02T08:55:13+02:00` | [`features/F-004-application-and-data-foundation.md`](features/F-004-application-and-data-foundation.md) |
| [`F-005`](features/F-005-exercise-library.md) | `M-001` | Exercise Library | `Now / 1` | `0/2 Done` | User | `2026-09-02T09:43:39+02:00` | [`features/F-005-exercise-library.md`](features/F-005-exercise-library.md) |
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
| [`T-003`](tasks/T-003-prepare-mobile-design-agent-brief.md) | `F-003` | Prepare mobile design-agent brief and wireframes | `Now / 1` | `Done` | Codex primary agent | `2026-08-26T12:46:10+02:00` | [`tasks/T-003-prepare-mobile-design-agent-brief.md`](tasks/T-003-prepare-mobile-design-agent-brief.md) |
| [`T-004`](tasks/T-004-audit-and-accept-design-handoff.md) | `F-003` | Request, audit, and accept design handoff | `Now / 1` | `Done` | Codex primary agent | `2026-08-31T12:06:31+02:00` | [`tasks/T-004-audit-and-accept-design-handoff.md`](tasks/T-004-audit-and-accept-design-handoff.md) |
| [`T-005`](tasks/T-005-initialize-application-and-static-quality.md) | `F-004` | Initialize application and static-quality baseline | `Now / 1` | `Done` | Codex primary agent | `2026-08-31T14:19:48+02:00` | [`tasks/T-005-initialize-application-and-static-quality.md`](tasks/T-005-initialize-application-and-static-quality.md) |
| [`T-006`](tasks/T-006-establish-local-database-schema.md) | `F-004` | Establish local database schema and generated types | `Now / 1` | `Done` | Codex primary agent | `2026-08-31T15:26:48+02:00` | [`tasks/T-006-establish-local-database-schema.md`](tasks/T-006-establish-local-database-schema.md) |
| [`T-007`](tasks/T-007-build-server-data-boundaries.md) | `F-004` | Build server data and application boundaries | `Now / 1` | `Done` | Codex primary agent | `2026-08-31T15:49:04+02:00` | [`tasks/T-007-build-server-data-boundaries.md`](tasks/T-007-build-server-data-boundaries.md) |
| [`T-008`](tasks/T-008-build-active-workout-durability.md) | `F-004` | Build active-workout command durability foundation | `Now / 1` | `Done` | Codex primary agent | `2026-09-01T09:15:05+02:00` | [`tasks/T-008-build-active-workout-durability.md`](tasks/T-008-build-active-workout-durability.md) |
| [`T-009`](tasks/T-009-build-mobile-shell-and-ui-foundation.md) | `F-004` | Build mobile shell and shared UI foundation | `Now / 5` | `Done` | Codex primary agent | `2026-09-01T17:04:42+02:00` | [`tasks/T-009-build-mobile-shell-and-ui-foundation.md`](tasks/T-009-build-mobile-shell-and-ui-foundation.md) |
| [`T-010`](tasks/T-010-build-exercise-library-operations.md) | `F-005` | Build exercise-library operations | `Now / 1` | `Approved` | Codex primary agent | `2026-09-02T09:43:39+02:00` | [`tasks/T-010-build-exercise-library-operations.md`](tasks/T-010-build-exercise-library-operations.md) |
| [`T-011`](tasks/T-011-build-exercise-library-mobile-experience.md) | `F-005` | Build Exercise Library mobile experience | `Next / 1` | `Backlog` | Codex primary agent | `2026-09-02T08:59:17+02:00` | [`tasks/T-011-build-exercise-library-mobile-experience.md`](tasks/T-011-build-exercise-library-mobile-experience.md) |

## Templates

- [`templates/milestone.md`](templates/milestone.md)
- [`templates/feature.md`](templates/feature.md)
- [`templates/task.md`](templates/task.md)

See [`../process/project-management.md`](../process/project-management.md) for the accepted workflow and [ADR-0016](../decisions/0016-operational-reporting-and-projections.md) for reporting rules.
