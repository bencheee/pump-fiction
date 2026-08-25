# ADR-0012: Now, Next, and Later planning

- **Status:** Accepted

## Context

The project needs to show when work is intended and when events actually occurred without introducing speculative sprint commitments, story points, or artificial estimates. The system must remain practical for a private project executed by a small number of people or agents.

## Decision

Use ordered `Now`, `Next`, and `Later` planning horizons.

- Work items are explicitly ordered within their horizon.
- Each Executor may have at most one Task in `In Progress`.
- Do not use sprints, story points, or mandatory duration estimates initially.
- `target_date` is optional and may be set by the Owner only when a real commitment exists.
- Record actual lifecycle timestamps and every status transition.
- Timestamps use ISO 8601 with an explicit local UTC offset, for example `2026-08-25T14:30:00+02:00`.

## Consequences

- `Now` exposes current focus, `Next` exposes the ordered queue, and `Later` retains accepted work without pretending it is scheduled.
- WIP is constrained so ownership and current action remain clear.
- Planned dates communicate actual commitments rather than guesses.
- Status history preserves who changed what, when, and why.
- Sprints or estimation may be introduced only through a later explicit decision.

## Related documents

- [`../process/project-management.md`](../process/project-management.md)
- [`0010-task-lifecycle-and-test-gate.md`](0010-task-lifecycle-and-test-gate.md)
