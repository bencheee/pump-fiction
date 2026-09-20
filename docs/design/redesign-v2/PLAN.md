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
total      : 3609 lines
etag       : 1789817275172843   (re-read the head if this has changed)
```

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
| 1800–2209 | `historyVals()` — History list, workout detail, correction | **no** |
| 2210–2419 | set editor, exercise and split statistics, `chart()` | yes |
| 2420–3099 | `pagesVals()` — Programs, Exercises, Body; `logSet`, `advance`, `flashSet`, `finishHandoff` | **no** |
| 3100–3180 | body entry panel, date-picker cells | yes |
| 3180–3330 | overview rows, library picker, up next, exercise menu, nav items | yes |
| 3330–3609 | Today and workout values, wheels, bands, stage animation, primary action, handoff, finish, drag | yes |

The two rows marked **no** are why the first attempt drifted: the bound values
for Programs, Exercises, Body and for the set-logging flow were inferred from
patterns instead of read. Read them.

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
| 7 | Set flash, handoff, complete | active workout | 22, 31, 32, **2420–3099** |
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
| Screen transition | `useScreenAnimation` in `shared/ui/shell.tsx` | 1 | all |
| Screen frame and title bar | `shared/ui/page-frame.{tsx,css}` | 1 | root screens |
| Top bar | `shared/ui/page-frame.{tsx,css}` | 1 | 5, 6, 7, 8, 11, 12, 14, 15, 17, 19 |
| Scroll region (the prototype's `.sx`) | `shared/ui/page-frame.css` | 1 | all |
| Icon | `shared/ui/icon.{tsx,css}` | 1 | all |
| Full-screen panel | — | 3 | every panel |
| Primary and secondary action | `shared/ui/action.{tsx,css}` | 2 | all |
| List row | — | 8 | lists |
| Chip | — | 11 | statistics, Body |
| Value wheel | — | 4 | 4, 10 |
| Bar chart | — | 11 | 11, 12, 18, 19 |
| Segmented tabs | — | 8 | 8, 18 |
| Stepper | — | 10 | 10, 15 |
| Date picker | — | 20 | 20 |
| Actions panel | — | 9 | definition screens |
| Toast | — | 6 | all |
| Confirm dialog | — | 9 | destructive actions |

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

## Progress

| Step | State | Approved | Commit |
| --- | --- | --- | --- |
| Phase 0 | done | 2026-09-20 | — |
| 1 | done | 2026-09-20 | — |
| 2 | done | 2026-09-20 | — |

Update this table in the same change that delivers a step.
