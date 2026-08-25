# Mobile information architecture

## Device boundary

The product is designed only for phones. No desktop layout or desktop-specific navigation is required. This boundary is accepted in [ADR-0001](../decisions/0001-private-mobile-only-app.md).

## App shell

The default app shell has four bottom-navigation destinations:

| Destination | Responsibility |
| --- | --- |
| Today | Next workout, workout entry points, today's weight prompt |
| History | Workouts, exercise and split statistics, Weight, Body |
| Programs | Programs, splits, rotation, templates |
| Exercises | Exercise definition library |

History owns its five subsections—Workouts, Exercises, Splits, Weight, and Body—as established by [ADR-0003](../decisions/0003-history-information-architecture.md).

## Active-workout shell

An active workout opens a separate focused screen without bottom navigation. The user can finish, pause with **Continue Later**, or enter the discard flow. Because only one workout can be active, reopening the application returns the user to that persisted session.

## Mobile interaction rules

- Put primary actions within comfortable thumb reach.
- Use numeric keyboards for numeric inputs.
- Never require horizontal table scrolling.
- Clearly highlight the active set.
- Auto-save changes where specified, especially during active workouts.
- Use visible drag handles for reordering; do not rely on hidden long-press behavior alone.
- Require confirmation before removing populated workout data, deleting a historical workout, or discarding a workout.

Screen-level contents are canonical in [`wireframe-decisions.md`](wireframe-decisions.md).
