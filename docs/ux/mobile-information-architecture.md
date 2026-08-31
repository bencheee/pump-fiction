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

## Overlay and safe-area behavior

- Sheets and dialogs are transient surfaces over the current route rather than independently deep-linkable destinations.
- Opening an overlay creates a dismissible browser-history entry. Browser or Android Back closes the topmost overlay first; Escape and the visible cancel/close action do the same where applicable.
- The application background may extend beneath browser or operating-system chrome, but top-bar content and every interactive control start below `env(safe-area-inset-top)`. Bottom-fixed controls include `env(safe-area-inset-bottom)`.
- The accepted reference PNGs contain only the app viewport. Safe-area insets are therefore additive implementation spacing and are not inferred from status-bar pixels in those images.

Screen-level contents are canonical in [`wireframe-decisions.md`](wireframe-decisions.md).
