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

An active workout opens its own screen but keeps the bottom navigation, so the user can browse Today, History, Programs, and Exercises during a workout and come back; see [ADR-0025](../decisions/0025-active-workout-in-the-main-shell.md). Leaving the screen keeps the workout running, and only **Continue Later** pauses it. The user can finish, pause, or enter the discard flow. Because only one workout can be active, reopening the application returns the user to that persisted session, and Today offers **Resume Workout**.

## Mobile interaction rules

- Put primary actions within comfortable thumb reach.
- Use numeric keyboards for numeric inputs.
- Never require horizontal table scrolling.
- Clearly highlight the active set.
- Auto-save changes where specified, especially during active workouts.
- Use visible drag handles for reordering; do not rely on hidden long-press behavior alone.
- Require confirmation before removing populated workout data, deleting a historical workout, or discarding a workout.

## Overlay and safe-area behavior

- Sheets and dialogs are transient surfaces over the current route rather than independently deep-linkable destinations.
- Opening an overlay creates a dismissible browser-history entry. Browser or Android Back closes the topmost overlay first; Escape and the visible cancel/close action do the same where applicable.
- The application background may extend beneath browser or operating-system chrome, but top-bar content and every interactive control start below `env(safe-area-inset-top)`. Bottom-fixed controls include `env(safe-area-inset-bottom)`.
- The accepted reference PNGs contain only the app viewport. Safe-area insets are therefore additive implementation spacing and are not inferred from status-bar pixels in those images.

Screen-level contents are canonical in [`wireframe-decisions.md`](wireframe-decisions.md).
