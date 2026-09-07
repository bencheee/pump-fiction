# Mobile information architecture

## Device boundary

The product is designed only for phones. No desktop layout or desktop-specific navigation is required. This boundary is accepted in [ADR-0001](../decisions/0001-private-mobile-only-app.md).

## App shell

The app shell has five bottom-navigation destinations:

| Destination | Responsibility |
| --- | --- |
| Today | Next workout, workout entry points, today's weight prompt |
| History | Workouts, exercise and split statistics |
| Programs | Programs, splits, rotation, templates |
| Exercises | Exercise definition library |
| Body | Weigh-in history and body measurements |

History owns three subsections—Workouts, Exercises, and Splits—under [ADR-0003](../decisions/0003-history-information-architecture.md). Body owns two of its own, Weight and Measurements, and is a destination rather than a subsection: [ADR-0030](../decisions/0030-body-is-its-own-destination.md) separated it from History, because weight and measurements are read on their own rhythm and answer a different question than workout history.

Body reads and corrects but never creates. Today owns entry for the local date — the weigh-in it already offered, and now the measurements beside it — so a value is recorded on the day it belongs to. The accepted cost is that a day missed is a day not recorded: nothing fills one in afterwards.

## Active-workout shell

An active workout opens its own screen but keeps the bottom navigation, so the user can browse every destination during a workout and come back; see [ADR-0025](../decisions/0025-active-workout-in-the-main-shell.md). Leaving the screen keeps the workout running, and only **Continue Later** pauses it. The user can finish, pause, or enter the discard flow. Because only one workout can be active, reopening the application returns the user to that persisted session, and Today offers **Resume Workout**.

## Mobile interaction rules

- Put primary actions within comfortable thumb reach.
- Use numeric keyboards for numeric inputs.
- Accept a dot or a comma as the decimal separator, because a phone offers whichever its locale uses. A value carrying more than one separator stays refused rather than guessed at. Integer inputs take neither.
- Never require horizontal table scrolling.
- Clearly highlight the active set.
- Auto-save changes where specified, especially during active workouts.
- Reorder through a named control on every row — a move-up and a move-down button, each at least 44 by 44 CSS pixels, disabled at the ends of the list — rather than a drag handle. A named button is reachable by touch, keyboard, and assistive technology alike, states its target in its own name, and needs no pointer to hold a position on a scrolling phone list. Never rely on hidden long-press behavior.
- Require confirmation before removing populated workout data, deleting a historical workout, or discarding a workout.

## Overlay and safe-area behavior

- Sheets and dialogs are transient surfaces over the current route rather than independently deep-linkable destinations.
- Opening an overlay creates a dismissible browser-history entry. Browser or Android Back closes the topmost overlay first; Escape and the visible cancel/close action do the same where applicable.
- The application background may extend beneath browser or operating-system chrome, but top-bar content and every interactive control start below `env(safe-area-inset-top)`. Bottom-fixed controls include `env(safe-area-inset-bottom)`.
- The accepted reference PNGs contain only the app viewport. Safe-area insets are therefore additive implementation spacing and are not inferred from status-bar pixels in those images.

Screen-level contents are canonical in [`wireframe-decisions.md`](wireframe-decisions.md).
