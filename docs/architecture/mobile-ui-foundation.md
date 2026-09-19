# Mobile UI foundation

- **Status:** Implemented; every route exists and no placeholder remains
- **Design source:** the 2026-09-19 redesign, recorded in [ADR-0032](../decisions/0032-redesigned-mobile-visual-language.md)

This document defines the application-owned mobile shell, assets, tokens, routes, and shared UI.

## Source hierarchy

Product and architecture documents remain authoritative for behavior. The
redesign prototype is authoritative for visual and interaction intent, and
[ADR-0032](../decisions/0032-redesigned-mobile-visual-language.md) records where
following it changed a decision this repository had already taken. The primary
navigation order stays **Today, History, Programs, Exercises, Body**, as
[`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
defines it. The frozen v0.4 package is superseded and kept only as history.

## Assets and licenses

Runtime assets are local and require no network request:

- `public/assets/fonts/` contains the eight frozen Barlow and Barlow Semi Condensed WOFF2 Latin subsets, their source manifest, and the SIL OFL 1.1 text;
- `public/assets/icons/` contains all 38 frozen Lucide SVG files from `lucide-static@1.34.0`, the geometry and checksum manifests, and the required ISC license text;
- icons render through the application-owned `Icon` mask wrapper, so their color is inherited from semantic UI state and feature code does not fetch an icon font or import a separate icon library;
- the body and numeric families use `font-display: swap`; the regular body face and semibold numeric face are preloaded, while fixed token line heights reserve layout during fallback.

The copied font and SVG binaries must continue to match their committed manifests. Replacing, removing, or adding a production asset requires an updated license inventory.

## Tokens and phone rules

[`../../src/app/globals.css`](../../src/app/globals.css) owns the `--pf-*` custom properties and exposes useful aliases through the Tailwind 4 theme. The token groups cover color, typography, spacing, radii, elevation, motion, control sizing, and interaction states. It also owns the redesign's motion set as named keyframes, so an animation is declared once and reused; the `-a`/`-b` pairs exist so the same animation can retrigger in place without remounting the element that carries it.

- Base layout is phone-only and reflows from 320 through 430 CSS pixels without a desktop variant.
- Every interactive primitive has at least a 44 by 44 CSS pixel target; primary and secondary controls use the larger frozen values where applicable. The repeated controls inside an active-workout set row are the compact exception: its value inputs, optional-addition action, band select, and removal action are 32 CSS pixels high, accepted for the dense data-entry grid while labels and spacing keep adjacent targets distinct.
- Inputs use at least 16px text, numeric inputs request the decimal keyboard, and numeric values use Barlow Semi Condensed with tabular figures.
- Focus uses the non-removable two-pixel `--pf-focus` outline and two-pixel offset.
- Reduced-motion preference collapses every transition and animation duration to `0.01ms`.
- Top content begins after `env(safe-area-inset-top)`. Bottom navigation and sticky actions include `env(safe-area-inset-bottom)` plus the frozen 12px buffer.
- When `VisualViewport` reports an on-screen keyboard reduction greater than 150px, sticky action bars release to static positioning so a focused field is not covered.

## Shells and route surface

One shell owns every route: `(main)` provides the shell-owned toast and the five-destination bottom navigation. Each screen scrolls its own body under a fixed title row or top bar, rather than sharing one scroll container, so a title, a tab strip, or a search field stays in place while its list moves. The active-workout and finish routes live in it, so navigation stays available during a workout; see [ADR-0025](../decisions/0025-active-workout-in-the-main-shell.md). The bottom navigation highlights no destination while the workout screen is open.

The root route redirects to `/today`; `/history` redirects to `/history/workouts`. URLs use no trailing slash. Persisted-entity routes must validate parameters with `requireUuidRouteParam` from `src/shared/routing/uuid-route-param.ts` before querying. A malformed, missing, deleted, or otherwise unavailable identifier resolves through the shared App Router `not-found.tsx` boundary. The boundary deliberately uses neutral copy and returns to Today; feature-specific missing-record screens must not replace it.

History and Body each render their own frame, because the count beside the title belongs to the tab being shown. The shared `src/shared/ui/subsection-navigation.tsx` draws the tabs as a segmented control whose filled thumb slides under the current tab; the tab is still marked with `aria-current` and a weight change, so the cue is never color alone. It tolerates a missing pathname instead of throwing.

History carries Workouts, Exercises, and Splits. Body carries Weight and Measurements and redirects `/body` to `/body/weight`. Under [ADR-0032](../decisions/0032-redesigned-mobile-visual-language.md), Body records as well as corrects: an entry is made in a full-screen panel that picks its day on a month grid, any past date is allowed and a future one is not offered. Today no longer carries the weight and measurement cards. **No placeholder route remains.**

A weigh-in is addressed by its local date rather than by a UUID, so `requireLocalDateRouteParam` sits beside `requireUuidRouteParam` in `src/shared/routing/`. It accepts a real `YYYY-MM-DD` calendar date and sends everything else through the shared not-found boundary. `S19` and `S23` carry the add action and the date picker; the edit routes remain the deep-linkable way into an existing entry. Measurements are recorded one at a time from their own screen, so no operation writes a whole day at once.

`src/shared/ui/bar-chart.tsx` draws every chart; `src/features/history/ui/progress-chart.tsx` adapts a chart series to it, so feature screens keep passing the series they always passed. The reading above the bars follows the selected bar, and the summary sentence and the collapsible value list carry the same numbers. Every bar is a button labelled with its date and value, so nothing depends on hover or on seeing the drawing, as [ADR-0020](../decisions/0020-mobile-ui-charting-and-quality-tooling.md) requires. A series that improves downwards says so rather than assuming larger is better, and a noun that does not pluralize with an `s` supplies its own plural.

Bars start at zero, so there is no axis-framing option, and a companion series no longer shares the axis. Weight shows its weekly average in the stat tile beside the chart and keeps the full list of averages in its own collapsible list.

## Shared UI boundary

Reusable implementation lives under `src/shared/ui` and is exported through its `index.ts`. Current shared primitives are:

- the main shell, bottom navigation, page frame, top bar, screen body, and sticky action bar;
- actions, text/numeric/textarea/search fields, validation wiring, and selectable chips;
- the full-screen overlay and the destructive alert dialog;
- the two-step actions panel and its `···` trigger;
- the bar chart, the kg/reps value wheels and their option columns, the month-grid date picker, collapsible regions, data rows, stepper rows, and hold-to-drag reordering;
- save status with one retry control, a sticky action bar that forwards its container attributes, badges, kickers, list rows, stat cards, skeletons, empty states, icons, and the shell-owned transient toast with its `useToast`, `useSaveOutcome`, and `useSavedSnapshot` helpers.

The overlay and destructive dialog are application-owned wrappers around Radix. They provide modal semantics, focus containment, Escape dismissal, trigger focus restoration, and cancel-safe initial focus for destructive confirmation. Feature modules must import these wrappers, not Radix directly. Both can be opened from elsewhere — an actions panel, for instance — by passing `open`/`onOpenChange` from `useTransientOverlay`, which keeps the history-backed close.

A wheel column always contains the value it is showing, so an off-grid number recorded earlier is never rounded away by being opened, and a wheel with no value yet starts from the value before it so it can be turned at all.

Feature-specific set rows, workout exercise cards, reorder behavior, restored-workout cards, and chart rendering are intentionally absent from `src/shared/ui`. Reuse is promoted only after it is demonstrated across features. Business calculations never move into shared presentation components.

Reuse demonstrated across features moves into the owning feature's `ui` module rather than automatically into `src/shared/ui`. The workout clock, set summary, and last-performance formatters live in `src/features/active-workout/ui/workout-presentation.ts` because History reads the same saved sets. History keeps its own date, month, and duration formatting in its route folder because no other feature needs it.

## Definition-form save contract

Every definition form follows the same contract, so a save is an act of leaving the screen rather than a state shown on it. Under [ADR-0032](../decisions/0032-redesigned-mobile-visual-language.md) the action is reached through the screen's `···` panel: one action is selected there and Continue commits it, so a destructive action is never one stray tap away. The top bar carries the Unsaved badge while the form differs from what it opened with.

- A successful save raises a toast and returns to the form's parent screen: `/exercises` for an exercise, `/programs` for a program, and the owning program's edit screen for a split. The parent is refreshed so the saved value is visible immediately.
- A failed save, including client-side validation, raises a toast and keeps the form mounted with its entered values, its field-level errors, and the existing retry control for retryable failures.
- The toast lives in the shell above the routed screens, so a toast raised immediately before navigation is shown on the destination screen. `MainShell` owns exactly one toast.
- `SaveStatus` reports `clean`, `unsaved`, `saving`, or `failure`. A form that still matches the state it opened with renders no text at all; only a real difference from that baseline reads `Unsaved changes`. Forms compare a normalized snapshot of their own editable values and rebase that baseline when an in-place action, such as reordering split exercises, auto-saves.

The parent-return rule applies to explicit save actions. Auto-saving surfaces, such as the active workout, have no save action and keep their own cue.

## Today and workout-start composition

Today reads only the workout aggregate: weight and measurements are recorded in Body. Its data access stays in the server composition boundary and passes the serializable `TodayView` aggregate into a feature-owned client experience. The client may make a temporary today-only split selection or start the proposed or alternate split through the thin workout Server Action. **Set as Next** is not offered here: moving the rotation pointer belongs to Programs, which is the only place that does it. When a current workout exists, the restore card replaces every second-start entry point and derives a running display from persisted accumulated duration plus the active segment start without resetting the timer.

`get_today_view` nests each current-program split's ordered prescriptions in `TodayView`, so Today receives the complete preview in one aggregate request. The independently optional weight and measurement reads remain parallel and non-blocking to the workout result.

The one-time route loads only active Exercise Library definitions on the server. Its client form owns arbitrary-name validation, add/remove/up/down ordering, retained input after failure, and the ordered IDs sent to the same workout-start action. Successful starts enter `/workout/current`; generic persistence failures expose retry while unavailable sources remain non-retryable.

Body owns entry. The weight tab and each measurement's detail carry an add control that opens the shared entry panel: a month grid for the date, a numeric field for the value, and the `···` panel to commit it. The grid offers no future day, so the only refusal the panel can receive is an entry that already exists for that date.

Measurement-type routes and detail routes do not collide; entry routes are keyed by type and local date and validate both with `requireUuidRouteParam` and `requireLocalDateRouteParam`. The type editor offers deletion only while the type holds nothing and otherwise explains why, rather than disabling a control without saying so. `weight-presentation.ts` and `body-presentation.ts` keep their formatting in the feature's `ui` module.

## Active-workout composition

The `/workout/current` and `/workout/current/finish` pages use the server composition boundary. The direct finish URL remains a recovery/deep-link path, while the ordinary active-workout flow opens review from the client snapshot already on screen. `/workout/current` loads only the authoritative current-workout aggregate and redirects to Today when none exists; its Add Exercise sheet requests the active library only when opened. Feature-owned client experiences apply every mutation through the command union and delivery controller; there is no parallel mutation path.

The workout is worked through one set at a time.

- The 58px header carries the pause toggle, the live clock, and the way into the overview. A segment per set runs across the whole workout under it, coloured for recorded, current, and outstanding, and tapping one jumps to that set.
- The stage names the set and its exercise, then holds the value on two drag wheels: load where the mode has one, a Bodyweight tag where it does not, and the count in reps or seconds. A band row appears when the mode needs one. The wheels hold a draft, so turning one costs no command; the set is written when it is logged.
- A set with no values yet starts from the set before it, then the previous performance, then the lowest planned count, so the common case is one tap.
- The primary action logs the set, plays the banked-set flash, and moves on. Once every set is recorded it becomes Review & finish instead. Logging sends the same `update_set` command the previous layout sent, and a set counts as recorded exactly when [ADR-0027](../decisions/0027-a-set-is-recorded-by-its-values.md) says it does.
- An exercise handoff screen sits between two exercises, naming what was finished and what waits. A completion screen sits before the terminal command when every planned set is recorded.
- Last time, the note, the exercise actions, and the review are full-screen panels. The exercise actions panel carries the optional addition, adding a set, and both removals; a populated removal still raises the destructive dialog and sends explicit confirmation evidence.
- The overview shows every exercise with what it has recorded, reorders by holding a card — the arrow keys move a focused card as well — removes one, adds from the library, and returns to the set in hand.
- One cue beside the stage carries the first validation message, the save state, and the refused-change notice with its Retry or Refresh.
- The round check action opens the review synchronously from the client snapshot; opening it performs no route or database read. The sheet derives active duration, exercise count, recorded sets, and — for split-sourced workouts only — the planned sets left without values. Selecting Complete or confirmed Discard starts the full-viewport busy layer, drains pending delivery, reads the authoritative current workout once, and then delivers `finish_workout` through the same queue before returning to Today.

## Overlay history

Sheets and dialogs are transient parent-route state. Opening a wrapped overlay pushes the current URL with an application-owned marker stack in `history.state`. Browser or Android Back consumes the top marker and closes that overlay before the parent route can change. Visible close/cancel, scrim dismissal, and Escape request the same history-backed close. Nested overlays close last-opened first.

Overlay state must not be encoded as a deep-linkable route or query parameter in the local MVP.

## Verification

React Testing Library, `user-event`, DOM matchers, and jsdom cover component accessibility and interaction. Playwright checks the 390 by 844 and 360 by 800 phone references at an explicit 3x device scale, shell geometry, horizontal overflow, overlay Back behavior, cancel-safe focus, Escape, and focus restoration. It builds and starts the production application, polls `/today` for readiness, never reuses an unknown local server, and writes line and HTML reports. v0.4 colors and other frozen-package exclusions are not compared against stale v0.3 pixels.

The foundation spec drives its assertions through `/test-support/mobile-ui-foundation`, a route that exists only for that spec. It is hidden unless the server is started with `PF_ENABLE_TEST_SUPPORT=1`, the single rule [ADR-0029](../decisions/0029-one-visibility-rule-for-test-support-routes.md) gives both test-support harnesses, and `npm run test:browser` sets that flag on its own production server. A default production start exposes neither harness.

These commands remain separate from `npm run check`:

```sh
npm run test:components
npm run test:browser -- tests/browser/mobile-ui-foundation.spec.ts
```
