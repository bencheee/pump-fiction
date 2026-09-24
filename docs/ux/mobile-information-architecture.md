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
- Reorder by holding a row and dragging it, as the redesign's prototype does: the row lifts after 180 ms held still, an 8-pixel slip first gives the press back to the scroll, and the rows it passes move out of its way. The list says so in its heading (**Hold to reorder**) rather than leaving the gesture hidden. Every reorderable row is focusable and Alt with an up or down arrow moves it one place, so the keyboard and assistive technology keep a path that needs no pointer. The Owner approved this in step 5 of the second redesign, replacing the per-row move-up and move-down buttons.
- Require confirmation before removing populated workout data, deleting a historical workout, or discarding a workout.

## Overlay and safe-area behavior

- Sheets and dialogs are transient surfaces over the current route rather than independently deep-linkable destinations.
- Opening an overlay creates a dismissible browser-history entry. Browser or Android Back closes the topmost overlay first; Escape and the visible cancel/close action do the same where applicable.
- The application background may extend beneath browser or operating-system chrome, but top-bar content and every interactive control start below `env(safe-area-inset-top)`. Bottom-fixed controls include `env(safe-area-inset-bottom)`.
- The accepted reference PNGs contain only the app viewport. Safe-area insets are therefore additive implementation spacing and are not inferred from status-bar pixels in those images.

Screen-level contents are canonical in [`wireframe-decisions.md`](wireframe-decisions.md).
