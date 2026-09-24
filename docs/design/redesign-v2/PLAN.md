# Redesign v2 — screen-by-screen implementation plan

Branch: `redesign-v2`. Started 2026-09-20, after the first attempt was reverted
on `main` for not carrying the design faithfully enough to keep.

This file is the contract for the work. Any context picking the work up reads
this file first and needs nothing else to start.

## Non-negotiables

1. **The only source of truth is `Workout App - Prototype.dc.html`** in the
   Claude Design project `Pump Fiction`. No other file in that project is
   authoritative; the earlier explorations are superseded by it.
2. **Always read it through the Claude Design MCP.** Never work from memory of
   it, never from a screenshot, never from another context's summary.
3. **Port each screen faithfully** — colour, size, radius, spacing, type,
   copy, and state.
4. **Every action button counts.** Each one opens a sub-screen or panel that is
   part of that screen's work, not a later cleanup.
5. **Animations and transitions are part of the screen**, not decoration added
   afterwards.
6. **One implementation per surface.** A modal, a button, a row, a chip, a
   field on one screen is the same component on every other screen. The
   consistency register below records where each shared surface was born; a
   later screen reuses it or changes it for everyone, never forks it.
7. **Verify in the browser with Playwright** after implementing a screen:
   drive it, look at it, compare against the prototype.
8. **The Owner approves each screen before it is committed.** Implementation
   plus verification, then ask, then commit.
9. **No tests are written until every screen is approved.** The existing suites
   stay as they are; do not weaken them to make an unstyled state pass.

## Reading the prototype

```text
project_id : b1b0f09a-7426-48c3-b1cf-0be515a07a28
path       : Workout App - Prototype.dc.html
total      : 3611 lines
etag       : 1789974108549442   (re-read the head if this has changed)
```

The etag moved again during step 6, from `1789919597314229` (3613 lines): the
Owner made both of that step's follow-up changes in the prototype as well, so
the file and the application agree. A whole-file diff of the two versions shows
exactly three edits — `rawMenu`'s m9 removed (two lines), and `continueBg` /
`continueColor` and `actContinueBg` / `actContinueColor` changed from the
accent pair to `#f2f7f4` on `#0a0e0c`. Nothing else in the file moved, so every
line number below the Actions panel is two lower than it was and no earlier
step's reading is stale.

The head was re-read at step 5, the etag having moved from `1789817275172843`
(3609 lines). All 37 keyframes but four are byte-identical to what phase 0 wrote
down; `wheelUpA`, `wheelUpB`, `wheelDownA` and `wheelDownB` were rewritten in the
prototype after phase 0 and now travel 54.5px through four stops with a blur,
where `globals.css` still carries the two-stop 35px pair. That is step 4's
surface, so it is the Owner's call, not step 5's.

Use `mcp__claude-design__read_file` with `offset` and `limit`. The file is
HTML-entity-escaped: `&lt;` `&gt;` `&amp;` stand for `<` `>` `&`.

Its shape:

- **lines 1–70** — the `<style>` block: eight `@font-face` rules and every
  `@keyframes` the design uses. Phase 0 reads this.
- **lines ~74–1620** — the markup. One `<sc-if>` block per screen, each opened
  by a comment banner and carrying a `data-screen-label`.
- **lines ~1625–3609** — the prototype's own state machine. **Every bound value
  lives here**: `{{ x.bg }}`, `{{ c.color }}`, `{{ ex.anim }}` are computed in
  this half, not in the markup. A screen is not read until both halves are.

### Markup anchors

Ranges are approximate to about twenty lines; the banner text and the
`data-screen-label` are the exact anchors. Read a little wide and confirm.

| # | Banner | `data-screen-label` | Around line |
| --- | --- | --- | --- |
| 1 | `TODAY` | Today | 77 |
| 2 | `ACTIVE QUEUE` | Active set | 131 |
| 3 | `OVERVIEW / START` | Start workout | 244 |
| 4 | `HISTORY LIST` | History list | 281 |
| 5 | `WORKOUT DETAIL` | Workout detail | 380 |
| 6 | `WORKOUT CORRECTION` | Correct workout | 437 |
| 7 | `EXERCISE STATISTICS` | Exercise statistics | 474 |
| 8 | `SPLIT STATISTICS` | Split statistics | 600 |
| 9 | `OVERLAY: SET CORRECTION` | Correct set | 700 |
| 10 | `PROGRAMS LIST` | Programs | 757 |
| 11 | `PROGRAM DETAIL` | Program | 782 |
| 12 | `SPLIT EDITOR` | Split editor | 838 |
| 13 | `EXERCISE LIBRARY` | Exercises | 900 |
| 14 | `EXERCISE DEFINITION` | Exercise definition | 950 |
| 15 | `BODY` | Body | 1040 |
| 16 | `MEASUREMENT DETAIL` | Measurement | 1120 |
| 17 | `OVERLAY: SCREEN ACTIONS` | Screen actions | 1190 |
| 18 | `OVERLAY: SET NEXT SPLIT` | Set next split | 1215 |
| 19 | `OVERLAY: ADD EXERCISE TO SPLIT` | Add exercise to split | 1240 |
| 20 | `OVERLAY: BODY ENTRY` | Body entry | 1265 |
| 21 | `OVERLAY: DATE PICKER` | Choose date | 1300 |
| 22 | `SET LOGGED FLASH` | — | 1340 |
| 23 | `TOAST` | — | 1355 |
| 24 | `OVERLAY: ACTIONS` | Actions overlay | 1370 |
| 25 | `OVERLAY: LAST TIME` | Last time | 1385 |
| 26 | `OVERLAY: NOTE VIEW` | Note | 1395 |
| 27 | `OVERLAY: TODAY'S NOTE` | Today's note | 1400 |
| 28 | `OVERLAY: ADD EXERCISE` | Add exercise | 1420 |
| 29 | `OVERLAY: SPLITS` | Choose split | 1460 |
| 30 | `OVERLAY: REVIEW & FINISH` | Review and finish | 1490 |
| 31 | `EXERCISE HANDOFF` | Exercise handoff | 1530 |
| 32 | `WORKOUT COMPLETE` | Workout complete | 1560 |
| 33 | `DIALOG` | — | 1590 |
| 34 | `BOTTOM NAV` | — | 1615 |

### State-machine regions

| Lines | Holds | Read in v1? |
| --- | --- | --- |
| 1625–1800 | helpers, `METRICS`, `KG`/`REPS` columns, seed fixtures | partly |
| 1800–1830 | the workout clock and its interval | partly |
| 1831–1958 | `notify`, `flashSet`, `adjust`, `advance`, `logSet`, `nextTarget`, `afterLog`, `startHandoff`, `finishHandoff`, `finish` | step 7 |
| 1959–2209 | `formatClock`, `setLoadText`, `goPage`, `historyVals()` — History list, workout detail, correction | **no** |
| 2210–2419 | set editor, exercise and split statistics, `chart()` | yes |
| 2420–3099 | `pagesVals()` — Programs, Exercises, Body | **no** |
| 3100–3180 | body entry panel, date-picker cells | yes |
| 3180–3330 | overview rows, library picker, up next, exercise menu, nav items | yes |
| 3330–3609 | Today and workout values, wheels, bands, stage animation, primary action, handoff, finish, drag | yes |

The rows marked **no** are why the first attempt drifted: the bound values for
Programs, Exercises, Body and for the set-logging flow were inferred from
patterns instead of read. Read them. The set-logging flow is the one the table
placed wrongly — it was listed with `pagesVals()` and is in fact at 1831–1958,
where step 7 read it; the row above now says so.

## Working order

Each step delivers one screen and whatever shared surface that screen is the
first to need. Nothing is built speculatively.

### Phase 0 — tokens and motion

Read lines 1–70. Produce `src/app/globals.css` with the palette, radii, type
scale, control sizing, elevation, and every keyframe the prototype declares,
named once and reused. Nothing else. No component work.

Where the prototype repeats a literal — `#35b57e`, `#141a17`, `999px`,
`cubic-bezier(.2,.8,.3,1)` — it becomes a token. Where it uses a value once,
it stays a literal on that screen.

### Screens

| Step | Screen | Routes | Prototype |
| --- | --- | --- | --- |
| 1 | Shell and bottom navigation | every route | 34, 3330–3609 |
| 2 | Today | `/today` | 1, 3330–3609 |
| 3 | Choose another split | Today panel | 29 |
| 4 | Active set (queue) | `/workout/current` | 2, 3180–3609 |
| 5 | Start workout (overview) | `/workout/current` | 3, 3180–3330 |
| 6 | Workout panels | active workout | 24, 25, 26, 27, 28, 30 |
| 7 | Set flash, handoff, complete | active workout | 22, 31, 32, **1831–1958** |
| 8 | History list | `/history/*` | 4, **1800–2209** |
| 9 | Workout detail | `/history/workouts/[id]` | 5, **1800–2209** |
| 10 | Workout correction and set panel | `.../[id]/edit` | 6, 9, 2210–2419 |
| 11 | Exercise statistics | `/history/exercises/[id]` | 7, 2210–2419 |
| 12 | Split statistics | `/history/splits/[id]` | 8, 2210–2419 |
| 13 | Programs list | `/programs` | 10, **2420–3099** |
| 14 | Program detail | `/programs/[id]/edit` | 11, 18, **2420–3099** |
| 15 | Split editor | `/splits/[id]/edit` | 12, 19, **2420–3099** |
| 16 | Exercise library | `/exercises` | 13, **2420–3099** |
| 17 | Exercise definition | `/exercises/new`, `.../edit` | 14, **2420–3099** |
| 18 | Body | `/body/weight`, `/body/measurements` | 15, **2420–3099** |
| 19 | Measurement detail | `/body/measurements/[typeId]` | 16, **2420–3099** |
| 20 | Body entry and date picker | Body panels | 20, 21, 3100–3180 |
| 21 | Screen actions, toast, dialog sweep | everywhere | 17, 23, 33 |

Step 21 is a reconciliation pass, not new work: by then every surface exists,
and it confirms that the actions panel, the toast and the confirm dialog look
and behave identically wherever they appear.

## Per-screen procedure

For every step:

1. **Read.** The markup anchor and the matching state-machine region, through
   the MCP. Both halves, before writing anything.
2. **Write down the bound values** the screen uses — every `{{ x.bg }}`,
   `{{ c.color }}`, `{{ ex.anim }}` — with the value the state machine gives
   them. If a value cannot be found, say so rather than choosing one.
3. **Implement.** Reuse what the consistency register already lists; add to the
   register anything new.
4. **Cover the action buttons.** List them from the markup; every one of them
   opens something, and that something is part of this step.
5. **Cover the motion.** Entry animation, state transitions, press feedback,
   and whatever the state machine attaches to a change.
6. **Verify with Playwright.** Drive the screen in the browser, exercise each
   action button and its panel, and look at it at 390×844 and 320×720.
7. **Report and wait.** Say what was built, what was verified, and anything
   that could not be matched. The Owner approves, then it is committed.

## Consistency register

One row per shared surface. Filled in as the work proceeds; a later screen
reuses the listed component or changes it for everyone.

| Surface | Component | Born in step | Reused by |
| --- | --- | --- | --- |
| Tokens and keyframes | `src/app/globals.css` | Phase 0 | all |
| Shell frame and stage | `shared/ui/shell.{tsx,css}` | 1 | all |
| Bottom navigation | `shared/ui/shell.{tsx,css}` | 1 | all |
| Screen transition | `useStageAnimation` in `shared/ui/shell.tsx` | 1, changed in 9 | all |
| Screen frame and title bar | `shared/ui/page-frame.{tsx,css}` | 1 | root screens |
| Top bar | `shared/ui/page-frame.{tsx,css}` | 1 | 5, 6, 7, 8, 11, 12, 14, 15, 17, 19 |
| Scroll region (the prototype's `.sx`) | `shared/ui/page-frame.css` | 1 | all |
| Icon | `shared/ui/icon.{tsx,css}` | 1 | all |
| Full-screen panel | `Sheet` in `shared/ui/overlays.{tsx,css}` | 3 | every panel |
| Panel heading (22px) | `[data-panel-heading]` in `shared/ui/overlays.css` | 6 | 6, 9, 20 |
| Back to set pill (56px) | `[data-panel-back]` in `.../set-queue.css` | 6 | 6 |
| Add exercise picker | `src/app/(main)/add-exercise-sheet.{tsx,css}` | 6, moved in 10 | 4, 5, 10 |
| Review and finish panel | `.../review-finish-sheet.{tsx,css}` | 6 | 4, 7 |
| Stage portal (where a full-screen surface renders) | `usePanelContainer` in `shared/ui/panel-container.tsx` | 1 | 3, 6, 7 |
| Set logged flash | `SetLoggedFlash` in `.../workout-interstitials.{tsx,css}` | 7 | 7 |
| Interstitial screen (badge, kicker, chips, card) | `Interstitial` in `.../workout-interstitials.{tsx,css}` | 7 | 7 |
| Delivery alert card | `.../delivery-cue.css` | 6 | 4, 5 |
| Primary and secondary action | `shared/ui/action.{tsx,css}` | 2 | all |
| Add pill (54px, tinted) | `[data-variant="add"]` in `shared/ui/action.css` | 5 | 5, 14, 15 |
| Row icon action (44px) | `[data-variant="row-icon"]` in `shared/ui/action.css` | 5 | 5, 15 |
| List row | `shared/ui/list-row.{tsx,css}` | 8, `program` variant in 13 | lists |
| Chip | `shared/ui/chip.{tsx,css}` | 8 | 8, 10, 11, 12, 18, 19 |
| List filter field (52px) | `shared/ui/search-field.{tsx,css}` | 8 | 8, 16 |
| Value wheel | `shared/ui/value-wheel.{tsx,css}` | 4, fixed in 10, changed in 12 | 4, 10 |
| Bar chart | `shared/ui/bar-chart.{tsx,css}` | 11 | 11, 12, 18, 19 |
| Disclosure row (44px, chevron) | `shared/ui/disclosure.{tsx,css}` | 11 | 11, 18, 19 |
| Segmented tabs | `shared/ui/subsection-navigation.{tsx,css}` | 8 | 8, 18 |
| Stepper | `shared/ui/stepper.{tsx,css}` | 10 | 10, 15 |
| Date picker | — | 20 | 20 |
| Actions panel | `shared/ui/actions-panel.{tsx,css}` | 6, lifted in 9 | 6, 9, 10, definition screens |
| Actions pill (58px) | `[data-variant="actions"]` in `shared/ui/action.css` | 9 | 9, 14, 15, 17 |
| Note editor panel | `NoteEditorSheet` in `shared/ui/note-sheet.{tsx,css}` | 6, lifted in 10 | 6, 10 |
| Set chip (tinted) | `SetChip` in `shared/ui/status.{tsx,css}` | 4, lifted in 10 | 4, 10 |
| Unsaved chip | `UnsavedChip` in `shared/ui/status.{tsx,css}` | 10 | 10, 14, 15, 17 |
| Commit pill (58px) | `[data-variant="commit"]` in `shared/ui/action.css` | 10 | 10, 19 |
| Quiet pill (50px) | `[data-variant="quiet"]` in `shared/ui/action.css` | 10 | 10 |
| Failed-command card | `AlertCard` in `shared/ui/status.{tsx,css}` | 9, lifted in 10 | 9, 10 |
| Toast | `shared/ui/toast.{tsx,css}` | 6 | all |
| Confirm dialog | `DestructiveDialog` in `shared/ui/overlays.{tsx,css}` | 9 | 6, 7, 9, 10, destructive actions |
| Outline badge | `Badge` in `shared/ui/status.{tsx,css}` | 8, lifted in 9, `statistics` size in 12 | 8, 9, 10, 11, 12 |
| Tinted badge (`Current`, `Next`) | `Badge tone="accent"` in `shared/ui/status.{tsx,css}` | 13 | 13, 14, 18 |
| Note card | `[data-note-card]` in `shared/ui/status.css` | 8, lifted in 13 | 8, 9, 10, 11, 12, 13 |
| Title add (44px, round) | `[data-variant="title-add"]` in `shared/ui/action.css` | 13 | 13, 16 |

Component styling lives in a CSS file beside its component, keyed on the same
data attributes the markup already carries, and is imported by it. `globals.css`
stays what phase 0 made it: tokens and motion, nothing else. Step 1 is where
that split was set (Owner, 2026-09-20).

Step 2 departs from the prototype in six places, all of them the application
knowing something the prototype does not:

- The **weight and measurement cards leave Today**. The prototype's Today ends
  at the rotation line; `MVP-TOD-004` and `MVP-TOD-005` put both cards there.
  The Owner chose the prototype (2026-09-20), so the two criteria need their
  own amendment and the day's entry is reached from Body.
- **Prototype copy wins over the existing test assertions** (Owner,
  2026-09-20). No test file is touched until every screen is approved, so the
  assertions that name the old copy stay red until that pass.
- The **exercise scheme keeps a unit only when it is measured in seconds**
  (`3 × 30–60 sec`). The prototype writes `3 × 5–8` and has no exercise
  measured in seconds to distinguish.
- The **saved-workout card is not built**. It is the one part of this screen
  with no data behind it: the prototype fills it in `finish()` (line 1950), and
  the application has no signal on Today until step 7 builds that flow.
- **Two states the prototype has no screen for**: the day with no program, and
  a start the server refuses. Both are built from this screen's own surfaces —
  the exercises card and the accent text action the saved card uses for `Open
  in History` — and neither invents a colour, a radius or a size.
- The 48px outline pill carries `box-sizing: border-box`, which the prototype
  gets from the user-agent stylesheet because its pill is a `<button>`. Today's
  One-time workout is a link and needs it written down to resolve to the same
  48px. There is no global reset: the prototype has none either, and its `body`
  is `content-box`.

`PageFrame` grew two things this step, both the prototype's: a `screen` name so
a screen's own stylesheet can reach the shared frame, and the `trailing` slot
the title bar has always had `space-between` for — Today's date chip is the
first thing to sit in it. The toast moved to step 6 in the register above: the
two cards that raised one on Today are the two that left it.

Step 3 departs from the prototype in five places, four of them the application
knowing something the prototype does not:

- **Set as Next leaves this panel.** The prototype's Choose split has two
  actions per card and no third; the application's sheet had one. Both the
  prototype (screen 18, `OVERLAY: SET NEXT SPLIT`, step 14) and
  `docs/product/programs-and-splits.md` put Set as Next on program editing, and
  `programs/program-form.tsx` already calls `setNextSplitAction`, so
  `MVP-PRG-004` keeps a screen and nothing became unreachable.
- **No `Proposed` badge.** `sp.bg` (line 3335) tints the split that is on Today
  now, which is the proposal until an alternate replaces it, and the prototype
  marks nothing else. Today's own kicker still says which of the two it is
  showing.
- **Prototype copy wins over the existing test assertions**, as in step 2:
  `Choose Another Split` becomes `Choose another split`, the lead paragraph
  loses the `— <split> stays next.` tail the application appended, `Train This
  Today` becomes `Train today` — the aria-label stays `Train this today` — and
  the paragraph contrasting the two actions goes, the prototype having none.
  Today's rotation line already says alternates never advance it.
- **The splits are sorted by `position`.** `splitOptions` is `SPLITS` itself,
  the program's own order; the view model hands over the proposal and then the
  alternates.
- **The panel is modal.** The prototype leaves the bottom navigation live under
  its overlays; `Sheet` portals into the stage so the bar stays drawn in the
  same place, but a Radix dialog holds it inert while the panel is open. That
  keeps Escape, Back and the focus return the application has always had and
  the browser suite asserts.

Both actions close the panel before they act, which is the prototype's own
(`startSplit` and `select` each clear `sheet`): a start that the server refuses
then raises its error on Today, where step 2 put it.

`Sheet` grew a `panel` name this step, the same hook `PageFrame` has, and lost
three things that were not the prototype's: the scrim behind it — the panel is
opaque — the spacer in its bar, and an 18px close icon where the prototype
draws 16.

Step 1 departs from the prototype in three places, all of them the prototype
having no notion of a real device rather than a choice about how it looks:
the frame takes the viewport instead of `390x844`; the bottom bar adds
`env(safe-area-inset-bottom)` under its 18px so a home indicator does not sit on
the destinations; and the screen element keeps the `.sx` scroll behaviour itself
so a screen that has not been ported yet is still reachable. A ported screen
puts its own scroll region in front of that one and it never engages.

The icon is reached through the `data-icon` attribute the strip left on
`shared/ui/icon.tsx`, not through the prototype's `.ic` class: the mask, the
colour and the box all come from CSS, so no component carries a style
attribute for an icon (Owner, 2026-09-20). Its `size` prop has to grow — the
prototype also draws icons at 17, 28 and 30px. The 25 icons it uses are all in
`public/assets/icons`, byte-identical to the design project's copies.

Step 4 is the first step whose screen the application already had, and it
departs from the prototype wherever the application knows something the
prototype does not. The value wheel is the shared surface this step was the
first to need: the Correct set overlay (screen 9, step 10) writes the same
declarations, so it is a component from the start.

- **A set is recorded by its values, not by a press.** `logSet()` flips a
  `done` flag; the application derives the same state from what is entered
  (`isSetRecorded`, and `workout_set_is_recorded` in the database). So the
  wheels write the set and `Log set` is what `advance()` (line 1871) always
  was: the move to the next set. A set left untouched stays unrecorded, its
  segment stays unlit, and the finish review counts it — the safety net the
  application already had.
- **The wheel commits when the finger lifts.** `adjust()` mutates on every
  step; here every step would be a command in the outbox and a request of its
  own, so one drag is one `update_set`. The wheel captures the pointer, which
  the prototype does for its row drag and not for the wheel, so a drag that
  leaves the 196px box still writes the value it is showing.
- **Zero on the load column is the application's null.** The prototype's `KG`
  starts at 0 and `setLoadText` (line 1966) reads a 0 as no load; the
  application refuses a zero kilogram, so the column's 0 is stored as null and
  the numeral reads `—`, which is `kg0`'s own answer for a set without one.
- **The columns take in what the application holds.** `REPS` stops at 40
  because nothing the prototype prescribes goes further; some exercises here
  are measured in seconds and prescribe 30–60, so the reps column runs to
  whichever is higher — 40, the exercise's own maximum, or the value already
  entered — and the load column takes in a value off its 2.5 grid.
- **The unit follows the set's load mode.** `loadUnit` is `kg` or `+kg`; the
  application also has assistance modes, which take `−kg`, the sign
  `formatSetSummary` already writes for one, and `reps` becomes `sec` for a
  seconds-measured exercise.
- **A second empty state.** `addPicked` (line 3444) gives a new exercise as
  many sets as it plans; `add_exercise` gives it none, so a workout can hold
  exercises and still have no set to show — and the queue's own Add exercise
  would otherwise dead-end on it. It is built from this screen's own surfaces
  and points at the overview, where a set is added.
- **The pointer is a set id.** The prototype clamps `ei`/`si` whenever
  something is removed; the pointer here is the set's own id, resolved against
  the workout and re-pinned when that set goes.
- **A candidate at the end of a column is a box, not a button.** The prototype
  draws an empty `<button>`; the same empty box here carries no control, so
  nothing focusable is nameless. Each wheel is also a named `role="group"`,
  which the prototype has no notion of.
- **The bottom navigation keeps Today lit through a workout**, which is the
  prototype's own — `s.page` stays `"today"` while `screen` walks to `overview`
  and `workout` — and which `isCurrentDestination` did not know. A step 1
  surface changed for everyone, not forked.
- **Delivery signals.** The prototype has no notion of a command that has not
  reached the server. The saved cue stays in the accessibility tree and out of
  the picture; a failure and an undone change stay visible and unstyled until
  step 6 gives every screen the toast.

**Which screen `/workout/current` opens with follows the action, not the
route.** `startSplit` (line 3301) and `startOneTime` (3326) both set
`screen: "overview"`, and only `resumeWorkout` (3331) — Today's restored-workout
card — goes straight to the set queue, where the overview's own primary reads
`Start workout` until something is recorded. One route holds both screens, so
the two start paths carry `?view=overview` and a reload or a Back press can
still read it. Step 4 first shipped without this and opened the queue on a
start; the Owner caught it on 2026-09-20 and it was corrected the same day.
Until step 5 ports screen 3, a start therefore lands on the unstyled exercise
list.

Four things this screen reaches are other steps' and are left reachable rather
than built twice: `Last`, `Note` and `More` are screens 25, 26 and 24 (step 6)
and open the shared panel with the content the application already holds,
unstyled; `Review & finish` and the completed primary land on the review screen
the application already has until step 6 ports screen 30; `goOverview` switches
to the exercise list the application already has, with a plain Back control,
until step 5 ports screen 3; and the flash, the handoff and the complete screen
are step 7's, so the press advances at once and `stageAnim`'s flash branch is
not wired. The button and its state on this screen are ported in every case —
`historyColor`, `noteColor` and the press bounce are all the prototype's.

Two things could not be matched. The prototype's own completed primary — solid
accent, `Review & finish` — cannot be driven to in the prototype: logging the
last set sends it to the Workout complete screen instead, so only its two
values (line 3411) and the geometry of the other state are evidence. And the
clock can raise a React hydration mismatch when the second turns between the
server render and hydration; that is not this step's — Today's restore card
does the same — but it is on this screen too and wants a decision. That
decision came after step 7; the step 5 defect list below records it.

Step 5 replaces the exercise list `/workout/current` opened on before step 4, so
the accordion card, its set rows and the finish panel they carried are gone from
`active-workout-experience.tsx`; the review lives on `/workout/current/finish`,
which has always had its own delivery of the terminal command. The screen
departs from the prototype in six places, five of them the application knowing
something the prototype does not:

- **A row with no sets carries an Add set.** `addPicked` (line 3444) gives a new
  exercise as many sets as it plans; `add_exercise` gives it none, and the set
  queue's own empty state (step 4) points at this screen for one. The prototype
  computes `ex.addSet` on this very row (line 3208) and draws it nowhere — the
  set chips it once fed are gone from the markup, along with `ex.sets` and
  `ex.jump`. The control is the row's own 44px icon button and appears only on
  the row that would otherwise dead-end.
- **Reordering keeps a keyboard path.** The drag is the prototype's, hold for
  hold (180ms, an 8px slip cancels it, the pointer is captured, the passed rows
  move one row height). Its `<section>` is not focusable and has no other way in;
  the screen this one replaces had a named Move control on every row, so the row
  here is focusable and Alt with an arrow moves it. It draws nothing, and the
  `Move X up` buttons `tests/browser/active-workout.spec.ts:122` names are gone.
- **The pointer is a set id** and **a set is recorded by its values**, both
  step 4's. `ex.bg` and `ex.metaColor` mark the exercise the pointer's set is
  in, and `x.sets.filter(done)` reads `isSetRecorded` instead.
- **The prescription tail drops when there is none** — a one-time workout, or an
  exercise added to this one, has no `plannedSets` — and a seconds-measured
  exercise keeps its unit, as step 2 settled. The prototype has neither.
- **An exercise whose `add_exercise` has not been acknowledged** is the row it is
  about to become, under the name it was added with, with no control on it and
  no drag: neither its id nor its position exists anywhere but here yet.
- **`Remove <name>`, not `Remove exercise`.** Line 247 is the only place the
  prototype leaves this button unnamed; its own second copy, the split editor's
  (line 861), writes `aria-label="Remove {{ ex.name }}"`, and six rows of the
  same control need it.

`goBack` (line 3345) returns to `prevScreenName`, which is the queue when the
overview was opened from it and Today when a start landed here; the two screens
live in one route, so the component carries that rather than the history stack.
`useScreenAnimation` became `useStageAnimation` for the same reason: `navAll()`
gives the prototype's Today page three screens at depths 0, 1 and 2, and the
queue (step 4) now takes the transition too — a step 1 surface changed for
everyone rather than forked.

The 54px Add pill and the 44px row icon button are shared surfaces from the
start, as the register above records: the prototype writes each of them
identically on screens this plan reaches at steps 14 and 15.

Two things are reachable but not ported, as in step 4: `Add exercise` opens the
picker the application already has until step 6 ports screen 28, and the confirm
dialog behind a populated removal is the unported one every destructive action
still uses. One hole the prototype shares: a workout with no exercises can be
neither finished nor discarded from either screen — the prototype's empty queue
offers only `Add exercise` too — and step 6's review panel is where that lands.

Two defects found while verifying, neither this step's:

- **The value wheel's candidate buttons cannot be tapped.** `ValueWheel` captures
  the pointer on `pointerdown` (step 4, `shared/ui/value-wheel.tsx`), which sends
  the following `click` to the wheel instead of the button under the finger, so
  the prototype's `kgUp1`/`repsDown1` steppers (lines 3361-3364) do nothing on a
  press. The same buttons work from the keyboard, and dragging the wheel works.
- **The clock still raises a React hydration mismatch** when the second turns
  between the server render and hydration, which step 4 already flagged.
  Fixed after step 7. `Date.now()` in the client render is read twice — once in
  the server render, once at hydration — and the two are apart by however long
  the HTML took to arrive, so React reports a text mismatch and pays for it by
  regenerating the tree. Both routes are `force-dynamic`, so the server's own
  reading comes down as a `serverNow` prop
  (`src/server/application/rendered-at.ts`) and the two renders format the same
  second; the one-second interval each clock already runs moves it to the
  device's own on its first tick, which is the whole of the behaviour given up.
  The active workout's clock and Today's restore card are baselined alike.
  Verified against the dev server with every script held back three seconds, so
  hydration lands well after the HTML: no mismatch on `/workout/current`,
  `?view=overview` or `/today`.

Step 6 ports the five panels the active workout opens and the toast every
screen raises. The review is the one surface the application drew twice: the
prototype opens it over the workout (`openFinish`, line 3484) and
`docs/product/workouts.md` already called it "an in-place sheet from the current
client workout snapshot", so `/workout/current/finish` and its `FinishReview`
are gone and the URL redirects to `/workout/current?panel=finish`, which opens
the panel over the queue. The deep link is still the recovery path
`docs/architecture/mobile-ui-foundation.md` describes.

The Actions panel is a two-step control, not a menu of buttons: a press picks an
entry and `Continue` runs it (`menuRun`, line 3428), a press on the panel away
from any control gives the pick back (`menuBlur`, 3427), and the entries arrive
`ovRow`-staggered 45ms apart after a 40ms head start. The only entry that can be
refused is `Remove this set` on an exercise down to one, and it takes the faint
colour the prototype gives it.

The screen departs from the prototype in eight places, seven of them the
application knowing something the prototype does not:

- **The panels are five `Sheet`s, not one slot.** The prototype holds one
  `s.sheet` and writes another name into it to move between panels; each panel
  here carries its own history entry, so Back closes it and focus returns. An
  entry that opens another panel therefore waits for the Actions panel to give
  its entry back before taking one — that is `pendingRef` in `set-queue.tsx`.
  `Sheet` grew `overlay` for a panel the screen opens itself, `returnFocusRef`
  for one with no trigger to hand focus back to, and `onBodyClick` for
  `menuBlur`; `DestructiveDialog` grew the same `overlay`, which is the
  prototype's single `s.dialog` (line 3491).
- **The optional load is the exercise's own.** `rawMenu`'s m3 (line 3263) knows
  one addition — weight on a bodyweight exercise, a band on any other. The
  application reads `allowedLoadModes`, so the row also names an assistance
  mode, and `exerciseOptionalModeRemoveLabels` carries the prototype's own
  "Remove added weight" and "Remove resistance band" beside the two it has no
  word for.
- **The review names the sets it counts.** `outstandingLabel` (3487) gives a
  count; `MVP-WRK-011` asks the review to name the planned sets left without
  values, so they are listed inside the same card in its 13px muted meta.
- **A one-time workout has no prescription**, so it has no outstanding count at
  all and the same card says so. The prototype has no such workout.
- **The finish is a command.** `finish()` (1940) is done the moment it is
  called; here the terminal command has to drain before Today is reached, which
  is what the disabled `Finishing…` holds. `notify` (1957) fires with the press;
  the sentence is only true once the command has saved, and a toast raised
  earlier would sit over the failure notice, so it is raised with the
  navigation instead.
- **The empty queue can reach the review.** The prototype's empty queue offers
  only `Add exercise`, so a workout with no exercises can be neither finished
  nor discarded from either screen — the hole step 5 recorded. The control is
  the 48px outline pill step 2 was the first to need; it invents nothing.
- **`addPicked` lands on the overview** when the workout had nothing in it
  (line 3480), which the application needs more than the prototype does:
  `add_exercise` gives an exercise no sets, so the queue would still have none
  to show.
- **The delivery signals take the review's alert card.** The prototype has no
  notion of a command that has not reached the server. The saved cue stays in
  the accessibility tree; a failure and an undone change take the card the
  review draws its outstanding line in (line 1495) and sit where the toast sits,
  so nothing on the screen moves when one appears.

Three changes the Owner asked for on 2026-09-21, after seeing the panels, and
made in the prototype at the same time:

- **Review & finish leaves the Actions panel.** `rawMenu`'s m9 is gone from the
  prototype too. The round accent button beside More opens the review, and so
  do the completed primary, the empty queue's pill and the deep link, so
  nothing became unreachable.
- **The button that runs a pick does not take the accent.** With the picked
  entry already filled accent, a second accent fill read as a second choice.
  `continueBg` / `continueColor` are now `#f2f7f4` on `#0a0e0c` — the plain
  text colour over the page's own black — and the Owner made the same edit to
  `actContinueBg` (line 2902), so **the rule is the panel's, not this
  screen's**: wherever picking an option fills it with the accent, the control
  that runs it does not. Step 21 inherits it with screen 17.
- **The wheels offer the last set's numbers.** The prototype never needs this:
  its fixtures and `addPicked` (3442) give every set a kilogram and a
  repetition count the moment it exists, so a set always arrives with numbers.
  `add_exercise` and `add_set` give a set none, and the application knows where
  the numbers would have come from — `suggestedValuesFor` takes the nearest
  earlier set of that exercise in this workout, and failing that the last set
  of its previous performance. The load only carries when it still means the
  same thing (kilograms on the bar are not kilograms on a belt); repetitions
  always carry.

  That change reaches the primary action. An offer you cannot accept is
  decorative, so `Log set` now writes the numbers it was showing into the set
  and then does what `advance()` (1869) always did — which is `logSet()` (1858)
  restored, and it softens step 4's "a set is recorded by its values, not by a
  press" to "by its values, or by pressing Log set on the values it is
  offering". A set with nothing to offer is left exactly as it was, so the
  review's outstanding count and the finish safety net are unchanged, and a set
  you never press Log on still counts as outstanding. The offer looks like an
  entered value because it is the one the press will write; the segment bar
  still says the set is not recorded, and a visually-hidden "suggested" on the
  numeral says the same to anything that cannot see the bar.

Two things could not be matched. The prototype's own preview does not paint the
`circle-alert` on the review's outstanding card — the element is there, 15px and
`#808e88`, and the served SVG is 8KB where the file is 364 bytes, so the mask
resolves to nothing; the markup declares the icon and the port draws it from the
byte-identical copy in `public/assets/icons`. And the empty-queue review pill is
built but was not driven: reaching that state means removing every exercise from
the live local workout, which a second session may be verifying against.

Four things step 6 leaves for later steps, as step 4 and 5 did: the set flash,
the handoff and the Workout complete screen are step 7's, so the completed
primary opens the review directly; the confirm dialog behind a populated
removal and behind `Discard workout` is the unported one every destructive
action still uses (step 9); screen 17, the Screen actions overlay, is a
different surface from screen 24 and stays step 21's; and the already-approved
screens do not get their notices rerouted through the toast beyond the active
workout's own.

Step 7 ports the three surfaces the queue's primary action raises — the set
logged flash, the exercise handoff and the Workout complete screen — and the
flow that decides which of them a press leads to: `primaryAction` (3411),
`flashSet` (1837), `logSet` (1888), `nextTarget` (1886), `afterLog` (1898),
`startHandoff` (1909), `finishHandoff` (1928). The handoff and the complete
screen are one frame with two tones, which is what the prototype writes twice.

The screen departs from the prototype in seven places, six of them the
application knowing something the prototype does not:

- **The values are written with the press, not at the end of the flash.**
  `primaryAction` flashes and calls `logSet()` 2300ms later, and nothing is
  lost by a `done` flag that waits. Here the write is a command in the outbox,
  and a press whose command waits 2.3 seconds is a press a navigation can lose,
  so the fill goes out with the press and only `afterLog`'s move waits. The
  segment under the flash therefore lights at once — as it already did before
  this step for every set whose values were entered on the wheels.
- **A set is recorded by its values**, step 4's, so `afterLog` runs against the
  workout as it stands after the press. A set the press could not fill — one
  with nothing to offer — is still not recorded, and the outcome is the plain
  advance step 6 shipped rather than a handoff or the complete screen.
- **The handoff chip carries the application's own load vocabulary.**
  `setLoadText` (1966) knows a bar, a bodyweight and a band letter;
  `formatSetLoad` knows the assistance modes too, and a seconds-measured
  exercise keeps its unit — `60 kg × 12`, `BW + 20 kg × 8`, `BW × 30 sec`.
- **The prescription tail drops when there is none**, as on every screen since
  step 2: a one-time workout and an exercise added to this one have no
  `plannedSets`, so the handoff's meta reads `1 set recorded` with no
  `· planned …` after it, and the Up next line is `Set 1 of 1` with no
  `· … planned`.
- **The complete screen's rotation line is the workout's own.** The prototype
  writes `Rotation advanced to the next split.` whatever the workout was; the
  application knows that only a proposed split advances the rotation and writes
  the sentence its own finishing toast writes.
- **The clock on the complete screen is frozen at the number it was showing.**
  `afterLog` stops the prototype's clock (`running: false`, 1902); the
  application's active duration keeps accruing until `finish_workout` is
  delivered and the server computes it, so what is frozen is the chip, not the
  workout's duration.
- **The finish is a command**, step 6's. `doneDone` (3458) is
  `finish("completed")` (1933), which the prototype is done with the moment it
  is called; `Back to Today` holds the screen with the same disabled
  `Finishing…` the review panel's `Complete workout` holds, and the toast is
  raised with the navigation.

And one that is the prototype's own defect rather than something the
application knows better: **the faded stage takes no pointer.** `pickerFade`
carries the stage to opacity 0 for the three seconds the flash owns and leaves
it pressable, so a second press there lands on a `Log set` nobody can see and
flashes the same set again. Here the stage takes no pointer for as long as it
cannot be seen. It is the flash that makes it so and not the animation name:
`stageAnim` keeps the string it last returned, so `pickerFade` is still on the
stage after the flash has cleared.

Three things the port keeps exactly as the prototype has them, each of which
reads like a defect and is not:

- **The arrow points left while it bounces.** The markup turns `arrow-left` a
  quarter turn in its style attribute (1521) and `hoArrow` writes `transform`
  itself, so the rotation holds only until the animation's 400ms delay is up.
  The prototype's own preview does the same.
- **After a flash the next set arrives without a `stageIn`.** The pointer
  moving under a flash, and the flash clearing afterwards, both leave
  `pickerFade` on the stage, and the new set comes back on its tail.
- **Neither interstitial can be dismissed.** They carry no close control, no
  Escape and no history entry of their own, exactly as `handoffOn` and `doneOn`
  are cleared only by the screen's own action. Back still leaves the route,
  which the prototype has no notion of, and the workout is resumable from
  Today — so the application is not the dead end the prototype is.

The completed primary (`Review & finish`) is now as unreachable by logging as
it is in the prototype — the last set's press ends on the complete screen —
which is what step 4 recorded it could not drive to there either. It is still
reached by entering the last set's values on the wheels, or by jumping back to
a recorded set from the segment bar, neither of which the prototype can do.

Step 8 ports the History list and the four shared surfaces it is the first to
need: the list row, the segmented tab bar, the 52px filter field and the chip.
The row is written three times on this screen alone — a saved workout (284), an
exercise (308) and a split (327) — and the three are one declaration but for
the split's vertical padding and its program line, so it is a component from
the start. The filter field is byte-identical to the Exercise library's (906,
step 16). The chip is the same three-value triple the statistics screens' metric
and range chips write (2266, 2401).

The prototype holds one screen and three tabs in `s.tab`; the application holds
three routes, and it keeps them: each tab is a separate read, each has been its
own URL since `T-032`, and six back links on the screens steps 9, 11 and 12
will port point at them. What the prototype gets for free from one screen is
therefore arranged rather than given up:

- **The tab bar and the sliding pill live in the layout.** A pill rendered by
  the page would remount on every tab move and have nothing to slide from;
  `history/layout.tsx` stays mounted while the page under it changes, so the
  pill slides the prototype's own 320ms. `SubsectionNavigation` is where it
  went — the bar Body already shares, changed for everyone rather than forked,
  which gives Body the same control at step 18.
- **The count and the scroll region come up from the page**, because the count
  is the tab's own read (`tabCount`, line 2183) and the region is what changes.
  The title bar is therefore split across the layout boundary, and a grid on
  the frame puts the four pieces back in the order the prototype draws them:
  `1fr auto` holding the title against the count is what `space-between` does,
  and the two diffed at 0 pixels.
- **The panel's direction is handed down by context.** `panelAnimStr`
  (1992-1998) is computed in the layout, where the previous tab index still
  exists, and read by the page's own region. A screen that is not a tab leaves
  the direction exactly as it was, which is the prototype's own: `tab` does not
  move while the stack grows, and the panel replays its last direction when the
  stack pops back to the list.
- **A tab move is not a screen transition.** `tabs[i].go` (2181) moves `s.tab`
  and never touches the stack, so `useScreenAnimation` answers for the three
  list routes under one key and only `panFwd`/`panBack` plays. A step 1 surface
  changed for everyone, as `/workout/*` folding into Today already was.
- **Every other route under `/history` keeps its own bar.** The frame renders
  its children bare when the path is not one of the three, so a workout, an
  exercise or a split is the screen of its own that the prototype's stack makes
  it. The layout used to draw the subsection bar over those screens too.

Two values the prototype draws had no data behind them, and the Owner chose to
build both (2026-09-21). One additive migration extends two read functions;
no table, constraint or write path moves.

- **The trend badge** (`w.trend`, 2027-2030) compares the volume a workout
  moved against the last workout of the same name. `list_workout_history` now
  returns `volumeKgReps` per workout and `workoutVolumeTrends` in the History
  domain does the comparison. The prototype sums load by reps over every set;
  the application knows two kinds of set the prototype has none of, so neither
  counts — assistance kilograms are not work done, and a seconds-measured
  exercise's value is not a repetition count. A workout of those alone reads 0
  and carries no trend, which is what the prototype already does with a
  bodyweight-only workout.
- **`· N performances`** (`x.detail`, 2049) needed a count the exercise list
  did not carry; `list_exercise_history` now returns `performanceCount`,
  counting what `isEligiblePerformance` counts. The row's best set is the
  heaviest by volume, which is the prototype's own sort — the application had
  been showing the first recorded set under that name.

The screen departs from the prototype in five more places, all of them the
application knowing something the prototype does not:

- **The row reads its own contents.** The prototype names each row
  `aria-label="{{ w.name }}"`, which hides the detail and the trend from
  anything that cannot see them; the row here has always read its full text. A
  bare `+12%` does not say what it measures, so a visually-hidden `workout
  volume` follows it — the application's own metric label, hidden the way step
  6's `suggested` is.
- **The program chip row is hidden when there is one program.**
  `showProgramChips` (2196) is `programs.length > 1`, which is what the
  application already did, and the prototype's markup never reads the value it
  computes. The Owner settled on the value (2026-09-21): with one program the
  row would hold `All programs` and that program, which says nothing.
- **An empty Splits tab says so.** `noSplits` (2198) is only the filtered
  emptiness — the prototype draws nothing at all when there is no split history
  and leaves the tab blank. The application's own sentence goes in the
  prototype's own card.
- **A read can fail.** Three `force-dynamic` reads, so each tab also has the
  failure the prototype has no notion of: the note card the other two tabs
  answer an emptiness with, carrying the message and a retry link.
- **The rows are a list.** The prototype's rows are children of the panel and
  of a month section with no list element around them; `<ul>`/`<li>` is what
  carries their number here, so the list adds no box of its own and the
  entrance animation sits on the item.

Everything else is the prototype's, including the two things that look like
mistakes and are not: the pill is 2.7px wider than a tab and therefore drifts
about 1.3px against the tab it covers, because `calc((100% - 8px) / 3)` divides
the padding box while the tabs divide the content box; and the exercise rows
replay their staggered entrance on every keystroke, because `rowAnim`'s
signature (2051) holds the query.

Verification. The tab bar (350x50 at 3x), the title and the empty-workouts card
diff at **0 pixels** against the prototype, the program chips and the no-match
note are identical on every property read off both rendered pages, and the
remaining differences in a 21-element computed-style sweep are all data or the
grid's own margins. The entrance stagger runs 0, 34 … 306ms and stops there;
the panel plays `panFwdA`, `panFwdB`, `panBackA`, `panFwdB`, `panBackA` across
five tab moves with the stage animation staying `none`; Today → History gives
`scFwdA` and History → Programs `scFwdB`; the panel is the scroll region and the
tab bar does not move with it; 320x720 raises no horizontal scroll. The two
database suites that read the changed functions fail the same two and four
count assertions before and after the change — the Owner's own local rows
inflate them, and `supabase test db` cannot run here at all while a current
workout exists.

Two things could not be driven. The workouts tab's empty card needs a History
with no workouts, which neither side can reach without deleting the Owner's
own; the prototype's markup for it was rendered inside the prototype beside the
port and compared property by property instead. And the program chip row needs
a second program, which this database does not have, so the same was done with
its markup.

Step 9 ports the Workout detail and the two surfaces its one action button
reaches: the Screen actions panel (17) and the confirm dialog (33). Both are
shared, and the step is as much a lift as a port — the panel already existed
inside the set queue, where step 6 built it, and the badge inside the list row,
where step 8 wrote it. Neither was forked:

- **The Actions panel left `set-queue`** for `shared/ui/actions-panel.{tsx,css}`,
  rules and markup unchanged. The prototype writes it twice — a screen's own
  actions (1188) and the set under the finger in a workout (1330) — and the two
  are one declaration but for the meta line's font and the layer the panel
  takes, which is the whole of the component's `kind`. A screen's own sits at
  z-index 27, over the toast, because a message must not cover the entries it is
  asking you to choose between; every other panel, the queue's among them, stays
  at 20. `Sheet` grew `layer` for that one difference.
- **The badge left `list-row.css`** for `status.{tsx,css}`. The prototype writes
  it five times to say the same kind of thing; the three that are one
  declaration are now one, and the statistics screens' hair-wider padding is
  theirs to add at steps 11 and 12. The margin above it stays the context's —
  the row writes 8px, the card 10px.
- **`prescriptionText` asks for the four values** rather than for a current
  workout's exercise, so a saved workout answers it too and `Planned 4 × 5–8`
  is written once.
- **`useStageAnimation` keeps the stack** instead of counting path segments
  (Owner, 2026-09-22). This is the first screen that can reach a sibling at its
  own depth — `/history/exercises/[id]` is three segments, exactly as
  `/history/workouts/[id]` is — and going back from it took the forward
  transition, where `navAll()` (2476) compares its own stack depth and plays
  the back one. One stack per page now, as the prototype keeps `s.stack`,
  `s.pStack`, `s.xStack` and `s.bStack`: a key already on it is a pop back to
  it, anything else a push. A caller whose screens have a depth of their own
  still says so, which is the workout pair — one route holding `overview` at 1
  and `workout` at 2, whichever of the two it opens on. Step 1's surface,
  changed for everyone rather than for this screen.

The confirm dialog is the step's own: one surface for every destructive action,
as the prototype's single `s.dialog` slot is. It portals into the stage, so the
bottom navigation stays drawn under its scrim exactly as it does under a panel,
and Radix draws the scrim beside the content rather than around it, so the
centring the prototype writes on its scrim is written on the frame.

The screen departs from the prototype in nine places, all of them the
application knowing something the prototype does not:

- **`Finished` is the saved timestamp**, not `start + duration` (2198). A
  workout that was paused finished later than its active time says, and the
  application knows when. When it ended on another day the date leads the time,
  which the prototype's fixture never needs.
- **`Performed` counts the exercises that hold a recorded set**, where
  `wdPerformed` (2199) counts every exercise in the workout. It is the count the
  row this screen was opened from already shows, and what the tile is labelled.
- **`N sets recorded` counts the sets that were given values.** A saved workout
  here can hold a set that never was; the prototype's cannot.
- **Two kinds of note.** `ex.note` (2066) is the workout's own; the application
  also keeps the note that belongs to the definition. Both take the prototype's
  one card, each named.
- **Exercise statistics is a link**, because it is a route, and it names its
  exercise. The prototype labels all six of them `Open exercise statistics`,
  which does not say which one — the same reason step 5 named the overview's
  remove button.
- **Three states the prototype has no screen for**: a saved workout with no
  exercises, a read that failed, and a delete the server refused. The first two
  take the note card the History list answers an emptiness with; the third takes
  the card step 6 gave the active workout's delivery signals, and stays until
  the press is repeated.
- **An entry's work waits for the panel to close.** The prototype writes into
  `s.dialog` from the panel it has just closed (2204); each panel here carries
  its own history entry, so what an entry runs is held until the Actions panel
  has given its entry back — `pendingRef`, step 6's mechanism.
- **The panel and the dialog are modal**, as step 3 settled: Escape, Back and the
  focus return the application has always had, over the prototype's own drawing.
- **The zone is read on the server** and handed to the screen, so the server
  render and the hydration format the same minute. `toLocaleString()` would put
  the two apart wherever the device disagrees with the configured zone, which is
  the trap the workout clock fell into before step 5 baselined it.

Verification. The Claude Design MCP could not be reached in the session that
finished this step, so the prototype could not be rendered and driven beside the
port. Two things were done instead, and a later step should re-render it:

- **Every declaration the prototype writes was compared to the app's own
  `getComputedStyle`**, read from the byte-exact local copy at the etag above:
  **680 declarations across the screen, both copies of the panel, the picked
  state, the dialog and the badge, and one differs** — `a.scale` (2894), which
  neither side renders, because the same element's `ovRow … both` fills
  `transform` and outranks the declaration. Removing the animation in the page
  gives `scale(0.985)`, which is what the prototype declares.
- **Where both sides write the same words, the pixels were diffed** against the
  prototype's own renders of this etag: the confirm dialog's card, from above
  its title to below Cancel, is **0 of 555,300 pixels different**, and the
  armed `Continue` differs in **39 of 184,800**, all of them in the eleven rows
  of its top antialiased edge — the prototype's heading wraps to two lines, so
  the pill inherits a quarter-pixel offset from the line above it.

The flows were driven on a workout seeded and deleted for the purpose: the panel
opens and closes on Escape and on Back with focus returning to the pill, a press
away from the entries gives the pick back (`actBlur`), `Continue` runs the pick,
Cancel leaves the workout in place, `Edit workout` lands on `.../edit`, and
`Delete workout` deletes it, raises the prototype's own toast and returns to the
list. The transitions are `navAll()`'s own, re-driven after the stack
change: list → detail `scFwdA`, detail → exercise statistics `scFwdB`, back from
it `scBackA`, detail → list `scBackB`, a second detail after that `scFwdB`,
Today → History `scFwdA`, Programs → Today `scBackB`, the three tabs moving the
panel alone while the stage holds, and the workout pair still `scFwdA` into the
queue and `scBackB` back to the overview. The exercise cards arrive 0, 34, 68,
102, 136, 170ms apart. 320x720 raises
no horizontal scroll on the screen or the panel. The queue's own Actions panel
was re-driven after the lift — 127 declarations, none differing, layer 20, the
set's meta in the numerals, `Add today's note` still opening its panel over it —
and the workout it needed was discarded, leaving `app_settings` untouched.

Two things could not be driven:

- **A workout whose exercise left the library**, which this database has none of
  and the test-support harness was off for. The app's own badge markup was
  inserted into the rendered page and measured there: 25 declarations, none
  differing, 10px above it as the card writes.
- **The two assertions in `workout-history.test.tsx`** fail, as steps 2, 3 and 8
  left theirs: both render this screen and reach for a `Delete workout` button
  on it, which the prototype replaces with the Actions panel. No test file is
  touched until every screen is approved. Seventeen of the 245 tests in the unit
  suite fail — these two and the fifteen earlier steps left — and the shared
  component suite passes, 10 of 10.

Step 10 ports the Workout correction screen and the Correct set overlay it
opens, and is the first step whose reading was not made through the Claude
Design MCP: it would not connect (`FIRST_PARTY_AUTH_REJECTED`, and a
non-interactive session cannot run `/design-login`), so both halves were read
from a byte-exact local copy of the prototype at the etag above — 3611 lines,
283,529 bytes, no injected preview harness. Nothing was taken from memory or
from another context's summary.

Seven surfaces are the step's own, three of them lifts:

- **The stepper** (`shared/ui/stepper.{tsx,css}`), the row the prototype writes
  three of inside the correction card. The card around them stays the screen's,
  because the split editor writes three of the same rows in a grid with no card
  at all (line 858); step 15 adds that shape to this component rather than
  forking it.
- **The commit pill and the quiet pill** (`[data-variant="commit"]` and
  `[data-variant="quiet"]`). The prototype writes the 58px commit three times —
  Save corrections (468), Apply to set (740) and Record measurement (1182) —
  and the 50px outline twice, both on this step's two screens (469, 741). Only
  the copies whose colour is bound carry the fade between the two: `data-armed`
  for the save that has nothing to save, and the screen's own rule for the
  remove that cannot run.
- **The Unsaved chip** (`UnsavedChip`), written four times identically (432,
  781, 842, 943), so steps 14, 15 and 17 take this one.
- **The set chip left `set-queue.css`** for `status.{tsx,css}`: the prototype
  writes it on the two screens a set is entered from (151, 703) and the two are
  one declaration but for the line the queue's own copy adds, which stays in
  the queue's stylesheet.
- **The note editor left `set-queue.tsx`** for `shared/ui/note-sheet.{tsx,css}`,
  rules and markup unchanged. It is the prototype's screen 27 and it edits the
  note that belongs to an occurrence of an exercise; the queue writes today's,
  this screen writes a saved workout's, and what differs is only the two words
  the callers name it with.
- **The alert card left `workout-detail.css`** for `status.{tsx,css}`, where
  step 9's copy and this one are the same card.
- **The Add exercise picker moved** from `workout/current` to
  `src/app/(main)/add-exercise-sheet.{tsx,css}`. It is the register's shared
  surface and now has a third consumer outside the active workout; it cannot
  live in `shared/ui`, which may not import a route adapter's action.

The wheel was fixed rather than ported. **Its five candidate buttons could
never be pressed.** Step 4 captured the pointer on `pointerdown` so a drag that
leaves the 196px box still writes its value; a capture retargets the pointer up,
and with it the click the browser derives from the pair, so every press on a
candidate landed on the wheel instead of the button. The capture now waits for
the first step of an actual drag, which leaves both behaviours whole: a press
moves one row, and a drag that leaves the box still reports. The queue was
re-driven after the change.

The screen departs from the prototype in eight places, all but one of them the
application knowing something the prototype does not:

- **The third stepper is the finish, not the duration.** The prototype corrects
  `date`, `start` and `dur`; the application's active duration is measured and
  deliberately not recalculated from the timestamps, because paused wall-clock
  time cannot be reconstructed. The third row moves `finishedAt` by the five
  minutes the prototype gives its start, neither time may cross the other — the
  clamp `dur` has at a minute (2094) — and the lead paragraph says the duration
  stays as measured. A workout that crossed midnight says so in the row's label,
  which start-plus-duration never has to.
- **The card carries the exercise's own actions.** MVP-HIS-003 has the user
  correcting exercise order and content and the workout's notes; the prototype's
  correction screen has no control for any of them. All four are entries in the
  Actions panel the queue opens on a set, reached from a 44px round button in
  the head the split editor gives its card (860): add a set, the note, move up,
  move down, remove the exercise. The list ends with the add pill and the
  picker, as the overview and the split editor end theirs.
- **A correction that changes the shape of the workout is a command of its
  own**, not a line in the draft: the shape lives on the server, so adding,
  removing and reordering run at once and reload the workout. They are refused
  while the draft holds an edit that the reload would discard, which the
  footnote the split editor closes its list with (888) says in words, and the
  note — which is part of the draft — stays available.
- **The set editor carries the mode and the band.** The prototype's set is
  kilograms or bodyweight; the application's has seven load modes, and a set
  entered in the wrong one is exactly the kind of thing this screen exists to
  correct. Both take the chip step 8 built, under the heading.
- **`Recorded` states the saved value**, where `se.original` (2107) states what
  the draft held when the panel opened — which is what the wheels already show.
  The saved value is what the word means and what the tint on the button is
  measured against, and a set that was never given values reads `Not recorded
  yet`.
- **Removing a set asks first when it holds values**, as every destructive
  action in the application does, and the confirm dialog is step 9's. The
  prototype removes from its draft and says `Save to apply`; here it is a
  command, so the toast says what happened.
- **Three states the prototype has no screen for**: a workout with no exercises,
  an exercise with no sets, and a correction the server refused. The first takes
  the note card the History list answers an emptiness with, the second a line in
  the card, and the third the alert card lifted from step 9, which stays until
  the press is repeated.
- **The stepper says its value out loud.** A press moves it without moving
  focus, so nothing would tell a screen reader what it now reads; the value is
  a polite live region and the two time steppers name which of them each button
  moves, as step 5's remove button names its exercise.

Verification. The Claude Design MCP could not be reached, so the prototype could
not be rendered and driven beside the port, and the pixel diffs step 9 could
still fall back on were not available either — this step's two screens share no
wording with a render from an earlier session. What was done instead:

- **Every declaration the prototype writes on both screens was compared to the
  app's own `getComputedStyle`**, read from the byte-exact local copy:
  **294 declarations across the screen clean, the screen dirty and the panel,
  and one differs** — the load wheel's `width`, which the prototype now writes
  at 146px and the application at 132. That is the shared wheel's, not this
  screen's; see the open question below.
- **The flows were driven** on `/history/workouts/{id}/edit` at 390x844 and
  320x720, neither raising a horizontal scroll on the screen or on the panel.
  A stepper arms the save and the Unsaved chip and disarms them again; pressing
  the save with nothing to correct raises the prototype's own `Nothing to
  correct yet.`; a set opens the editor, a candidate press and a drag both move
  the wheel, `Apply to set` tints the button and states the value in the accent,
  and `Save corrections` lands on the Workout detail with the prototype's toast
  and the corrected value on it. Add a set, remove it, add an exercise, remove
  it, move an exercise down and back up, the confirm dialog on a populated
  exercise and on a populated set, the note panel written and saved into the
  draft, and the duplicate the server refuses — which is what put the alert card
  on the screen — were all driven, and the workout was left exactly as it was
  found. Escape and Back close both panels with focus returning to the control
  that opened them; the cards arrive 0, 34, 68, 102, 136 and 170ms apart; and
  the transitions are `navAll()`'s own — detail to correction `scFwd`, and
  `scBack` back from it whether the save, the bar's Back or `Discard changes`
  made the move.
- **The queue was re-driven** after the three lifts and the wheel fix: its chip
  draws the same seven declarations it always did, its candidate buttons now
  answer a press, and `Add today's note` still opens the same panel. The workout
  it needed was discarded rather than finished, so History and the rotation
  pointer are as they were.

One question for the Owner, which is the shared wheel's and not this screen's.
**The prototype's wheel has moved on since step 4** and five declarations now
differ; changing them changes the Active set queue, which was approved as it
stands:

1. the load wheel is 146px wide, not 132;
2. its value sits in a `100%`-wide box with `0 8px` of padding and shrinks from
   52px to 46px and then 40px as the numeral grows, so a long load stays inside
   the window;
3. `wheel{Up,Down}{A,B}` travel 54.5px through four stops with a 1.4px blur,
   where `globals.css` still carries phase 0's two-stop 35px pair;
4. the slide runs 340ms on `cubic-bezier(.22,.9,.26,1)`, not 170ms on the
   default ease;
5. a drag spends 30px per step, not 34.

Step 5 raised (3) and left it as the Owner's call; (1), (2), (4) and (5) are
this step's finding. They are one decision, and the work is small.

Step 11 is the first step the Claude Design MCP could not be reached for from
the start, so the prototype was read from the byte-exact local copy of
`Workout App - Prototype.dc.html` — 3611 lines, 283,529 bytes, which is the
etag this file records. Nothing was read from memory or from another context's
summary; where a line is cited below it is a line of that file.

Two shared surfaces are born here. The **chart card** is byte for byte the same
on Exercise statistics (line 541) and Split statistics (639), so it is one
component and step 12 takes it; the Body pair (1044) writes three declarations
of its own — the bars are centred, 4px apart and capped at 46px wide, and their
corners are 6px — which steps 18 and 19 add as a variant rather than a second
card. The **disclosure row** is the same button and the same 0fr-to-1fr grid on
both of this screen's lists and on Body's chart values. Neither owns what it
draws: the caller hands over the formatted value and the height a bar stands
at, as ADR-0020 requires, and the summary sentence and the values list under
the bars are the caller's words, so the chart is never the only representation.

The screen departs from the prototype in eleven places, all but two of them the
application knowing something the prototype does not:

- **One records card per comparison category.** The prototype's exercise is
  Weights or Bodyweight and has exactly one card (`xdCategory`, 2261); the
  application compares a band direction and strength only against themselves —
  `MVP-HIS-009` — so an exercise carries one card per category it was performed
  in, each the prototype's card, and the heading names which.
- **A record a smaller number wins says so.** `Least assistance` carries
  `(less is better)` after its label, in the grey one step quieter than the
  label. `MVP-HIS-010` asks that lower kilogram assistance read as progress and
  the prototype has no record of that kind.
- **The chart is measured the other way up for such a series.** `b.h` (2371) is
  the value against the tallest in range; for a series a smaller number wins the
  values are reflected across the range first, so the best result is the tallest
  bar. It is the reversed axis the Recharts line carried, drawn in bars, and the
  reading over them always states the value itself.
- **The trend sentence has a fourth ending.** The prototype's three are
  `Unchanged over this range.`, `Moving in the better direction.` and `Below
  where the range started.` (2388); a series a smaller number wins that rose
  says `Above where the range started.`, which is the same sentence the other
  way up.
- **A volume record states the product alone.** The prototype's `Best set` is
  `82.5 kg × 6` and a kilogram record here reads the same way, because the
  record carries the reps behind it; a volume already has those reps inside the
  product it is measured in, and saying them again beside it counts them twice.
- **The chips answer in the same frame.** The screen used to ask the server for
  a new series on every chip press. Every performance is already on the screen
  and `chartSeries` is the same pure function the server called for the first
  paint, so the chips compute it there: no round trip, and the bars move under
  the 380ms transition rather than redrawing. The server still computes what
  arrives with the page.
- **Three states the prototype has no screen for**: an exercise whose
  performances hold no recorded set, an exercise with no saved performance at
  all, and a read that failed. All three take the note card the History list
  answers an emptiness with, the third inside the screen's own frame as step 9's
  Workout detail does.
- **The unit vocabulary is the application's.** `sec` for a seconds-measured
  exercise, `kg·reps` for a volume, and a set stated through `formatSetSummary`,
  where the prototype's set is kilograms or bodyweight and nothing else.
- **The badge keeps the register's padding.** The prototype writes `5px 11px` on
  the two statistics screens (486, 616) and `4px 10px` on the History list (322,
  346) and Workout detail (401). One implementation per surface is the rule, so
  the badge stays the one step 8 built and this screen is 1px tighter than the
  prototype draws it. Moving all four is the Owner's call.
- **Back is a route, not a pop.** `pop()` returns to whatever pushed the screen;
  `Back` here goes to `/history/exercises`, as every ported screen's bar goes to
  its own list. It is visible now that step 9 links here from a workout, and it
  is the same choice steps 9 and 10 made.
- **Recharts stays** until it has no consumer. Body and Split statistics still
  draw the old line, so `ProgressChart` and the dependency remain and ADR-0020
  still names them; steps 12, 18 and 19 take this card, and the ADR is updated
  when the last one goes.

Verification. The MCP could not be reached, so the prototype could not be
rendered and driven beside the port. What was done instead:

- **Every declaration the prototype writes on the screen was compared to the
  app's own `getComputedStyle`**, each one applied to a probe of the prototype's
  own element inside the target's parent so that `em`, `currentColor`,
  percentages and every shorthand resolve on both sides alike: **557 to 562
  declarations per exercise across six shapes — weights, one performance only,
  seconds-measured, resistance band, added weight, pure bodyweight — and
  assistance, and none differs.** The one surface that could not be reached from
  this database is the retired badge, which no exercise here carries; the app's
  own markup was inserted into the rendered page and measured there, as step 9
  did: **25 declarations, and the four padding longhands differ by 1px**, which
  is the single-surface decision above.
- **The flows were driven** at 390x844 and 320x720, neither raising a horizontal
  scroll on the screen. Both disclosures open and close, the collapsed region is
  `inert` so nothing inside a closed list answers the tab key or a reader, and
  the chevron turns 180 degrees. A bar press moves the reading and the accent,
  and replays `read{A,B}`; a metric or a range press recomputes the series in
  place, replays `barIn{A,B}`, and drops the selection back to the most recent
  point, as `barSel: null` does (2270, 2400). The bars arrive 26ms apart and the
  performance cards 34ms, both capped at the tenth. `Week` on an exercise last
  performed a fortnight ago raises the prototype's own `No workout falls inside
  this range.`
- **The assistance series was created and taken away again.** This database
  holds no assistance-mode set, and the four branches `least_load` reaches are
  exactly what `MVP-HIS-010` asks for, so `Dip` was added to two saved workouts
  through step 10's own correction screen, its set recorded as assistance, and
  the exercise removed from both afterwards — the two workouts are as they were
  found and the exercise history list no longer lists `Dip`. With 20 kg on 31
  Aug and 12.5 kg on 21 Sept the record read `Least assistance (less is better)
  · 12.5 kg × 10`, the summary `best 12.5 kg. Moving in the better direction.`,
  and the bars 85px and 136px of the 136px track — the better result the taller.
  Raising the later set to 25 kg turned the summary into `best 20 kg. Above
  where the range started.` and the heights into 136px and 108.8px.
- **The transitions are `navAll()`'s own**, re-driven end to end: Today to
  History `scFwd`, the Exercises tab moving the panel alone, list to statistics
  `scFwd`, a performance card to the workout `scFwd`, `Back` to the list
  `scBack`, and a return to a screen already on the page's stack drawn as the
  pop step 9 made it.

Three things for the Owner:

1. **The load chart is nearly flat, and faithfully so.** `b.h` scales from zero,
   and a lifter's loads sit far from zero: ten bench sessions between 70 and
   75 kg draw ten bars between 92% and 100% of the track. The Body chart floats
   its base instead (`min - max(0.4, (max - min) * 0.9)`, line 2601). The
   prototype writes both, each on its own screen, and this is the one it writes
   here; whether the exercise chart should float its base too is a design
   decision, not a port decision.
2. **Nothing in the redesign honours `prefers-reduced-motion`.** The prototype
   declares none and no ported screen has added any, so this is not step 11's;
   ADR-0020 asks for it, and step 21 is where one rule can cover every screen.
3. **The wheel question from step 10 is still open**, and this step did not
   touch it.

Step 12 read the prototype from the same byte-exact local copy as step 11 —
3611 lines, 283,529 bytes — and the Owner confirmed it had not changed.

The Owner answered the four questions steps 10 and 11 left open (2026-09-24),
and all four are carried in this step:

1. **The wheel takes the prototype's five declarations**: the load box is
   146px, its value sits in a full-width box padded `0 8px` and steps from
   52px down to 46px at four characters and 40px at five or more (`kgSize`,
   line 3353), `wheel{Up,Down}{A,B}` travel 54.5px through four stops with a
   1.4px blur, the slide runs 340ms on `cubic-bezier(.22,.9,.26,1)` — which the
   prototype writes four times, all of them the wheel, so it is the token
   `--ease-wheel` — and a drag spends 30px per step. Both wheels take it, the
   Active set queue's and the correction panel's, because it is one component.
   `--dur-170` left `globals.css` with it: the prototype no longer writes 170ms
   anywhere.
2. **The exercise chart floats its base** as the Body chart does (`bodyChart`,
   lines 2601-2613): the base sits nine tenths of the spread below the smallest
   value, and never less than 0.4 below it. The bench loads that drew between
   92% and 100% now draw between 47% and 100%. Split statistics keeps the
   prototype's zero-based `b.h`, which is what its screen writes, and a
   duration's spread is wide enough to read.
3. **The badge takes the prototype's padding per screen**: `5px 11px` on the
   two statistics screens and `4px 10px` everywhere else. It is the badge's
   `statistics` size, not a second badge.
4. **`prefers-reduced-motion` stays with step 21**, one rule for every screen.

The screen departs from the prototype in four places:

- **The six tiles are this screen's own.** Step 9 left open whether the Workout
  detail's pair (line 375) and these tiles are one surface. They are not: the
  prototype states the pair's value at 22px and this one at 21px, binds all
  three of this tile's colours so the first can be drawn on the accent, and
  writes the Body tiles (1024) a third way, with the detail 6px under the
  value at 1.4. Three declarations, so three tiles, each on its own screen.
- **The chips answer in the same frame**, as step 11's do: every workout of the
  split is on the screen, and `entryDurationSeries` is the domain function the
  server's own `durationSeries` now goes through. The server action stays for
  the suites that still call it.
- **A read that failed** takes the note card inside the screen's own frame, as
  the exercise screen's does. The prototype has no screen for it.
- **Back is a route, not a pop**: `/history/splits`, as every ported screen's bar
  goes to its own list.

Verification. The MCP was not used; the prototype was read from the local copy
as in step 11.

- **Every declaration the prototype writes on the screen was compared to the
  app's own `getComputedStyle`**, each applied to a probe of the prototype's own
  element appended to the target's parent: **313 declarations**, the accent and
  a neutral tile, both chip states, the chart card, the footnote, a workout row
  and its three children, **and none differs**. The first pass inserted each
  probe before its target, which moved the target off `:first-child` and gave
  42 false differences; appending it gave none. The retired badge, which no
  split in this database carries, was measured on injected markup: **30
  declarations, none differs**, and 10px stands between it and the program.
- **The flows were driven** at 390x844 and 320x720, with no horizontal scroll at
  either; at 320 the range chips wrap to a second row, as the prototype's
  `flex-wrap` lets them. The tiles arrive 34ms apart and the workout rows 34ms
  apart, both on `ovRowA`. Each range chip recomputes the series in place,
  replays `barIn{A,B}` and puts the reading back on the most recent point; a
  bar press moves the reading and replays `read{A,B}`; `Chart values` opens,
  turns its chevron 180 degrees and takes the region out of `inert`. `Week`
  on Upper body holds one workout and says `Unchanged over this range.`
- **The transitions are `navAll()`'s own**: the split list to this screen
  `scFwd`, a workout row to the workout `scFwd`, and `Back` to the list
  `scBack`.
- **The wheel was driven on the correction panel**: 146px, `72.5` at 46px with
  the reps at 52px, a press replaying `wheelDownA` for 340ms on the new ease
  through the four stops, and a 61px drag moving the reps two steps. The draft
  was left unsaved. The exercise chart's load bars read 47.4% and 100%.

One thing for the Owner: **the volume chart is now nearly flat the other way.**
A floated base lets one outlier set the spread. Bench's ten volumes run from
2,257 to 2,417 kg·reps with one session of 435, and the nine full sessions draw
between 95% and 100% while that one draws 47%. That is the formula doing what
it says, and it is the Body chart's formula; whether the exercise chart should
use it on every metric or only on the load is a design decision. The Owner
approved step 12 as it stands and put the charts' scaling off until every
screen is done (2026-09-24).

Step 13 read the prototype from the same byte-exact local copy.

Three shared surfaces are born here and one is lifted:

- **The tinted badge** is the `Current` and `Next` marker. The prototype writes
  it three times with the same five declarations — the Programs list (line 762),
  a program's split rows (807) and Set next split (1223) — so it is the badge's
  `accent` tone, which status.css had reserved for it since step 9.
- **The round add button** in a root screen's title bar is written twice, the
  same ten declarations each time: Programs (752) and Exercises (902). It is
  the action's `title-add` variant, a link here because both open a route.
- **The program row** is the shared list row's `program` variant: the frame is
  the same row, the border is transparent rather than the fill's own colour so
  the tinted current program carries no darker edge, and the name at 16.5px,
  the badge beside it and the 13px detail under it are this row's type. The
  row takes `current` for `p.bg` and a `titleBadge` slot for the marker.
- **The note card** leaves `history-list.css` for `status.css`, and
  `data-history-note` becomes `data-note-card`. Programs is the first screen
  outside History to need it. No declaration changed, and a History note was
  measured again after the move: 25 declarations, none differs.

The screen departs from the prototype in two places, both states the prototype
has no screen for: **no program at all** and **a read that failed**. Both take
the note card, the first with `Add program` inside it and the second with `Try
again`. The lead paragraph stays above both, because it says what the screen is
for whatever it holds.

Verification. The MCP was not used; the prototype was read from the local copy.

- **Every declaration the prototype writes on the screen was compared to the
  app's own `getComputedStyle`**, each applied to a probe of the prototype's own
  element appended to the target's parent: **161 declarations** — the title
  bar, its heading, the add button and its glyph, the scroll region, the lead,
  the current program's row, its text, heading, name, badge, detail and
  chevron — **and none differs**. Both hovers were read under a real pointer:
  the add button takes `#35b57e` on `#0f2a1d`, and the row's border `#2a332e`.
- **The flows were driven** at 390x844 and 320x720, with no horizontal scroll at
  either. The row arrives on `ovRowA`, 34ms a row. The row opens the program
  `scFwd`, its Back returns `scBack`, and the add button opens `/programs/new`
  `scFwd`; both targets are step 14's screen.
- This database holds one program, the current one, so **a row that is not the
  current program was not seen**. It takes the list row's own `#141a17`, which
  the History rows were measured on in step 8. The empty list and the failed
  read were not reached either.

## Progress

| Step | State | Approved | Commit |
| --- | --- | --- | --- |
| Phase 0 | done | 2026-09-20 | — |
| 1 | done | 2026-09-20 | — |
| 2 | done | 2026-09-20 | — |
| 3 | done | 2026-09-20 | — |
| 4 | done | 2026-09-20 | — |
| 5 | done | 2026-09-20 | — |
| 6 | done | 2026-09-21 | — |
| 7 | done | 2026-09-21 | — |
| 8 | done | 2026-09-21 | — |
| 9 | done | 2026-09-22 | — |
| 10 | done | 2026-09-22 | — |
| 11 | done | 2026-09-22 | — |
| 12 | done | 2026-09-24 | — |
| 13 | done | 2026-09-24 | — |

Update this table in the same change that delivers a step.
