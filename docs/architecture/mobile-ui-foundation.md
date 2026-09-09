# Mobile UI foundation

- **Status:** Implemented through `T-046`; every route of the Local MVP exists and no placeholder remains
- **Design source:** [`../design/T-004-v0.4-frozen/README.md`](../design/T-004-v0.4-frozen/README.md)

This document defines how later Feature Tasks consume the application-owned mobile shell, assets, tokens, routes, and shared UI. It does not add feature-screen behavior.

## Source hierarchy

Product and architecture documents remain authoritative for behavior. The frozen v0.4 package is authoritative for visual and interaction intent only where it does not conflict with those documents. In particular:

- the primary navigation order is **Today, History, Programs, Exercises**, as defined by [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md), even though the external prototype presents a different ordering;
- v0.4 tokens and specifications govern color, contrast, save/validation cue placement, and the corrected S09/S10 validation fixtures;
- the retained v0.3 PNGs remain structural references under the exclusions recorded in the frozen package manifest.

## Assets and licenses

Runtime assets are local and require no network request:

- `public/assets/fonts/` contains the eight frozen Barlow and Barlow Semi Condensed WOFF2 Latin subsets, their source manifest, and the SIL OFL 1.1 text;
- `public/assets/icons/` contains all 38 frozen Lucide SVG files from `lucide-static@1.34.0`, the geometry and checksum manifests, and the required ISC license text;
- icons render through the application-owned `Icon` mask wrapper, so their color is inherited from semantic UI state and feature code does not fetch an icon font or import a separate icon library;
- the body and numeric families use `font-display: swap`; the regular body face and semibold numeric face are preloaded, while fixed token line heights reserve layout during fallback.

The copied font and SVG binaries must continue to match their committed manifests. Replacing, removing, or adding a production asset requires a ready Task and an updated license inventory.

## Tokens and phone rules

[`../../src/app/globals.css`](../../src/app/globals.css) owns the `--pf-*` custom properties and exposes useful aliases through the Tailwind 4 theme. The token groups cover color, typography, spacing, radii, elevation, motion, control sizing, and interaction states.

- Base layout is phone-only and reflows from 320 through 430 CSS pixels without a desktop variant.
- Every interactive primitive has at least a 44 by 44 CSS pixel target; primary and secondary controls use the larger frozen values where applicable. The repeated controls inside an active-workout set row are the compact exception: its value inputs, optional-addition action, band select, and removal action are 32 CSS pixels high, accepted for the dense data-entry grid while labels and spacing keep adjacent targets distinct.
- Inputs use at least 16px text, numeric inputs request the decimal keyboard, and numeric values use Barlow Semi Condensed with tabular figures.
- Focus uses the non-removable two-pixel `--pf-focus` outline and two-pixel offset.
- Reduced-motion preference collapses every transition and animation duration to `0.01ms`.
- Top content begins after `env(safe-area-inset-top)`. Bottom navigation and sticky actions include `env(safe-area-inset-bottom)` plus the frozen 12px buffer.
- When `VisualViewport` reports an on-screen keyboard reduction greater than 150px, sticky action bars release to static positioning so a focused field is not covered.

## Shells and route surface

One shell owns every route: `(main)` provides one scroll container, the shell-owned toast, and the five-destination bottom navigation. `T-024` moved the active-workout and finish routes into it and removed the `(focused)` group and the `FocusedShell` primitive, so navigation stays available during a workout; see [ADR-0025](../decisions/0025-active-workout-in-the-main-shell.md). The bottom navigation highlights no destination while the workout screen is open.

The root route redirects to `/today`; `/history` redirects to `/history/workouts`. URLs use no trailing slash. Persisted-entity routes must validate parameters with `requireUuidRouteParam` from `src/shared/routing/uuid-route-param.ts` before querying. A malformed, missing, deleted, or otherwise unavailable identifier resolves through the shared App Router `not-found.tsx` boundary. The boundary deliberately uses neutral copy and returns to Today; feature-specific missing-record screens must not replace it.

`T-032` added a History layout under `/history` that owns a subsection navigation. `T-052` generalized that bar into `src/shared/ui/subsection-navigation.tsx` and gave `/body` the same one rather than a second implementation of it: both sit inside the main shell, so the bottom navigation stays visible, and both mark the current tab with `aria-current`, a weight change, and an underline rather than color alone.

History carries Workouts, Exercises, and Splits. Body carries Weight and Measurements and redirects `/body` to `/body/weight`. `T-034` replaced the Exercises placeholder with `S15` and `S16`, `T-036` replaced the Splits placeholder with `S17` and `S18`, `T-039` built `S19` and `S20`, and `T-042` built `S21` through `S24`; `T-052` moved the last two pairs to `/body` under [ADR-0030](../decisions/0030-body-is-its-own-destination.md) and deleted their create routes, because Body reads and corrects but never creates. **No placeholder route remains.**

A weigh-in is addressed by its local date rather than by a UUID, so `T-039` adds `requireLocalDateRouteParam` beside `requireUuidRouteParam` in `src/shared/routing/`. It accepts a real `YYYY-MM-DD` calendar date and sends everything else through the same shared not-found boundary. `S19` and `S23` carry no add action at all since `T-052`: the only way to record a value is Today. `T-053` put the measurement card there beside the weight card, and gave the write its own transaction — `create_measurement_entries` applies every value or none, so a day is never half recorded.

`T-034` rendered the first chart in the application and `T-036` reused it, which moved the component to `src/features/history/ui/progress-chart.tsx`, the feature's own `ui` module, as the rule two paragraphs above requires. Recharts loads only on the two detail routes that use it, inside a Client Component that receives a finished series and computes nothing; it accepts an axis-label formatter so a duration series reads in minutes while its values stay in seconds. The chart element is `aria-hidden`, its line animation is off so reduced-motion preferences hold, and nothing about it needs hover: the textual summary above it and the expandable value list below it carry the same data, which is what [ADR-0020](../decisions/0020-mobile-ui-charting-and-quality-tooling.md) requires.

`T-039` taught it a second line. A series may carry a companion, and the component merges the two into one dataset keyed by date so they share an axis. The daily weigh-ins of `S19` are solid and the weekly averages dashed, told apart by a named legend that is real text outside the hidden chart, never by color. A series that sits far from zero passes `frame="data"` so the axis frames the values instead of the origin; every earlier chart keeps the axis it had.

The remaining initial route files expose only shell and title structure. Their domain content remains owned by later Feature Tasks.

## Shared UI boundary

Reusable implementation lives under `src/shared/ui` and is exported through its `index.ts`. Current shared primitives are:

- the main shell, bottom navigation, page frame, top bar, and sticky action bar;
- actions, text/numeric/textarea fields, validation wiring, and selectable chips;
- bottom sheet and destructive alert dialog wrappers;
- save status with one retry control, a sticky action bar that forwards its container attributes, badges, list rows, stat cards, skeletons, empty states, icons, and the shell-owned transient toast with its `useToast`, `useSaveOutcome`, and `useSavedSnapshot` helpers.

The sheet and destructive dialog are application-owned wrappers around Radix. They provide modal semantics, focus containment, Escape dismissal, trigger focus restoration, and cancel-safe initial focus for destructive confirmation. Feature modules must import these wrappers, not Radix directly.

Feature-specific set rows, workout exercise cards, reorder behavior, restored-workout cards, and chart rendering are intentionally absent from `src/shared/ui`. Later Tasks implement them within a Feature first and promote only reuse that is demonstrated across Features. Business calculations never move into shared presentation components.

Reuse demonstrated across Features moves into the owning feature's `ui` module rather than into `src/shared/ui`. `T-032` promoted the workout clock, set summary, and last-performance formatters from the active-workout route folder to `src/features/active-workout/ui/workout-presentation.ts`, because History reads the same saved sets. History keeps its own date, month, and duration formatting in its route folder, since no other Feature needs it yet.

## Definition-form save contract

`T-018` makes every definition form behave the same way, so a save is an act of leaving the screen rather than a state shown on it.

- A successful save raises a toast and returns to the form's parent screen: `/exercises` for an exercise, `/programs` for a program, and the owning program's edit screen for a split. The parent is refreshed so the saved value is visible immediately.
- A failed save, including client-side validation, raises a toast and keeps the form mounted with its entered values, its field-level errors, and the existing retry control for retryable failures.
- The toast lives in the shell above the routed screens, so a toast raised immediately before navigation is shown on the destination screen. `MainShell` owns exactly one toast.
- `SaveStatus` reports `clean`, `unsaved`, `saving`, or `failure`. A form that still matches the state it opened with renders no text at all; only a real difference from that baseline reads `Unsaved changes`. Forms compare a normalized snapshot of their own editable values and rebase that baseline when an in-place action, such as reordering split exercises, auto-saves.

The parent-return rule applies to explicit save actions. Auto-saving surfaces, such as the active workout, have no save action and keep their own cue.

## Today and workout-start composition

`T-015` keeps Today data access in the server composition boundary and passes the serializable `TodayView` aggregate into a feature-owned client experience. The client may make a temporary today-only split selection, start the proposed or alternate split through the thin workout Server Action, or use the existing program operation to persistently **Set as Next**; the copy and controls distinguish those two rotation effects. When a current workout exists, the restore card replaces every second-start entry point and derives a running display from the persisted accumulated duration plus the active segment start without resetting the timer.

`T-054` first read each available split through the program boundary to render its preview. `T-055` removes that post-aggregate waterfall: `get_today_view` now nests each current-program split's ordered prescriptions in `TodayView`, so Today receives the complete preview with its existing aggregate request. The independently optional weight and measurement reads remain parallel and non-blocking to the workout result.

The one-time route loads only active Exercise Library definitions on the server. Its client form owns arbitrary-name validation, add/remove/up/down ordering, retained input after failure, and the ordered IDs sent to the same workout-start action. Successful starts enter `/workout/current`; generic persistence failures expose retry while unavailable sources remain non-retryable.

`T-040` adds the weight surface `T-015` left out. The Today page reads the day's weigh-in beside the Today aggregate rather than inside it, so `TodayView` and `get_today` are unchanged, and a weigh-in that cannot be read simply leaves the card out instead of failing Today. The card offers the entry in an `S04` sheet fixed to the local date while the day has none, and shows the recorded value with a link to Weight once it does. Because the sheet's date cannot be edited or be in the future, the only refusal it can receive is a weigh-in that appeared meanwhile; it treats that as resolved rather than failed, closes the create path, and reloads Today onto the value that now exists. `weight-presentation.ts` moved to `src/features/history/ui/` when Today became its second reader, under the demonstrated-reuse rule above.

`T-042` puts Body on the same shapes. `/history/body/types/...` is a static segment beside the dynamic `/history/body/[typeId]`, so the type forms and the measurement detail never collide; entry routes are keyed by type and local date and validate both with `requireUuidRouteParam` and `requireLocalDateRouteParam`. `S22` offers deletion only while the type holds nothing and otherwise explains why, rather than disabling a control without saying so, and `body-presentation.ts` keeps the centimetre formatting beside the weight formatting in the feature's `ui` module.

## Active-workout composition

`T-016` put the `/workout/current` and `/workout/current/finish` pages in the server composition boundary. `T-055` keeps the direct finish URL as a recovery/deep-link composition, while the ordinary active-workout flow opens its review from the client snapshot already on screen. `/workout/current` loads only the authoritative current-workout aggregate and redirects to Today when none exists; its Add Exercise sheet requests the active library only when opened. The feature-owned client experiences apply every mutation through the accepted command union and delivery controller; there is no parallel mutation path.

- Set rows adapt per load mode with only applicable inputs, an explicitly labelled band-strength control, and the band direction derived from the mode. `T-020` replaced the per-set mode sheet: a row renders its snapshot's implied mode and, when the snapshot permits an addition, one control that applies or removes exactly that addition. The resulting mode change keeps reps, carries a kilogram value only between modes that share the same kilogram field meaning, clears everything else, and names what was cleared in an inline notice. `T-029` then removed confirmation entirely: a set becomes recorded when its values satisfy its mode, and the first outstanding validation message is mirrored into the single sticky-cue live region beside Review & Finish; the same cue owns save state and exactly one Retry (or conflict Refresh) control.
- The finish review keeps every finish action, including the separately confirmed discard, inside one labelled sticky action group. Populated set/exercise removal is gated by the shared destructive dialog and sends explicit confirmation evidence; empty rows remove directly. Reordering uses explicit up/down buttons that deliver the complete identity order. Workout exercise notes auto-save on blur.
- `T-054` keeps those commands but compacts their presentation: exercise cards form a controlled accordion, all closed initially, and opening one closes the other before aligning the new card below the sticky workout header. A card has no decorative drag handle and places its visually small up/down/remove icons in the title row while retaining 44-pixel hit areas. Each set compresses its number, applicable numeric inputs, compact optional-addition action, compact band select when applicable, and icon-only removal into one horizontal row. Those repeated row controls are 32 pixels high, exercise guidance uses the warning-yellow token, and Add Set is unbordered green text aligned right. Last time carries its date in the heading and uses one reps-first line per set.
- `T-055` removes the accordion chevrons while retaining the named expanded state on the title/card trigger. The header compresses workout name, text-only timer action, and live clock into one 40-pixel row beyond safe area. `T-023` removed the restored-session banner and its session-scoped marker; a reopen simply replays pending commands without resetting the timer.
- The round lower-right check action opens an application-owned review sheet synchronously from the active client snapshot; opening it performs no route or database read. The sheet derives active duration, exercise count, recorded sets, and — for split-sourced workouts only — the planned sets left without values, listing those prescribed rows. Selecting Complete, Save as Incomplete, or confirmed Discard starts the full-viewport busy layer, drains pending delivery, reads the authoritative current workout once, and then delivers `finish_workout` through the same queue before returning to Today. That preflight closes the cross-reload acknowledgement window without delaying the review itself. Start and finish transitions keep the busy layer above the shell until their asynchronous persistence/navigation completes.

## Overlay history

Sheets and dialogs are transient parent-route state. Opening a wrapped overlay pushes the current URL with an application-owned marker stack in `history.state`. Browser or Android Back consumes the top marker and closes that overlay before the parent route can change. Visible close/cancel, scrim dismissal, and Escape request the same history-backed close. Nested overlays close last-opened first.

Overlay state must not be encoded as a deep-linkable route or query parameter in the local MVP.

## Approval-gated verification

`T-009` adds React Testing Library, `user-event`, DOM matchers, and jsdom for component accessibility and interaction source. It also prepares Playwright checks for the accepted 390 by 844 and 360 by 800 phone references at an explicit 3x device scale, shell geometry, horizontal overflow, overlay Back behavior, cancel-safe focus, Escape, and focus restoration. Playwright builds and starts the production application, polls the production `/today` route for readiness, never reuses an unknown local server, and writes both line and HTML reports so reference captures remain available for structural review without the Next.js development indicator. v0.4 colors and other frozen-package exclusions are not compared against the stale v0.3 pixels. An authorized browser verification runs against a checkout of the exact approved commit. A `git worktree` reaches `node_modules` only through a real directory: Turbopack refuses a symlink that leaves the project root, and the production build fails before any test runs. A hard-link copy, `cp -Rl node_modules <worktree>/node_modules`, takes about half a minute and works. `T-039` found this.

The foundation spec drives its assertions through `/test-support/mobile-ui-foundation`, a route that exists only for that spec. It is hidden unless the server is started with `PF_ENABLE_TEST_SUPPORT=1`, the single rule [ADR-0029](../decisions/0029-one-visibility-rule-for-test-support-routes.md) gives both test-support harnesses, and `npm run test:browser` sets that flag on its own production server. A default production start exposes neither harness.

These commands remain separate from `npm run check`:

```sh
npm run test:components
npm run test:browser -- tests/browser/mobile-ui-foundation.spec.ts
```

Do not run either command, the application for manual validation, or visual comparison before the user approves the exact `T-009` delivery commit.
