# ADR-0025: Active workout inside the main shell

- **Status:** Accepted

## Context

[`mobile-information-architecture.md`](../ux/mobile-information-architecture.md) and [`mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md) placed the active workout in a separate focused shell without bottom navigation, so starting a workout removed Today, History, Programs, and Exercises from reach until the workout was finished, paused, or discarded.

The Owner rejected that on 2026-09-05 after using the application: during a workout it must stay possible to look something up elsewhere in the app and come back. The timer already survives that, because the running segment is persisted server-side and only an explicit **Continue Later** pauses it.

## Decision

The active-workout and finish routes move into the same shell as every other screen, so the four-destination bottom navigation stays visible and usable throughout a workout. The `(focused)` route group and the `FocusedShell` primitive are removed, because no route needs them any more.

Leaving the workout screen changes nothing about the session: the workout stays active, its accumulated duration keeps growing, and returning shows the same state. Today keeps the current-workout card as the primary way back, and its action is named **Resume Workout**.

This supersedes the focused-shell rule in [`mobile-information-architecture.md`](../ux/mobile-information-architecture.md) and the two-shell route surface in [`mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md), both of which now describe this decision.

## Consequences

- One shell owns every screen, which removes a whole layout branch and its keyboard/safe-area duplication.
- Navigating away during a workout is ordinary navigation; the app offers no protection against leaving, which the release boundary already classifies as post-MVP.
- The bottom navigation highlights no destination while the workout screen is open, because the workout is not one of the four destinations.
- `MVP-REL-002` states the navigation boundary, so its second sentence changes with this decision: the bottom navigation stays visible during an active workout. That correction was missed here and delivered later by [`T-049`](../project/tasks/T-049-correct-two-locked-mvp-criteria.md), after [`T-043`](../project/tasks/T-043-record-release-verification-matrix.md) found the criterion still stating the superseded rule.
- `MVP-WRK-005`, `MVP-WRK-010`, `MVP-TOD-001`, and `MVP-UX-001` keep their accepted text; only the shell placement changes.

## Related documents

- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../architecture/mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md)
- [`../product/workouts.md`](../product/workouts.md)
- [`../project/tasks/T-024-keep-primary-navigation-during-workout.md`](../project/tasks/T-024-keep-primary-navigation-during-workout.md)
