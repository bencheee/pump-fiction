# Annotated low-fidelity mobile wireframes

These diagrams specify hierarchy and interaction intent, not visual styling. Produce every frame at both fixed reference viewports and verify reflow at `320` and `430` CSS-pixel widths.

## Shared frame rules

- Respect top and bottom safe areas. Normal screens use a sticky four-item bottom navigation; `S10` and `S12` use the focused workout shell without it.
- A top app bar may scroll away unless marked sticky. Sticky controls must not obscure focused fields when the keyboard opens.
- Minimum touch target is `44 × 44` CSS pixels. Focus order follows visual order. Visible drag handles also need an accessible non-drag reordering method.
- Use bottom sheets for short phone-context choices and dialogs for destructive confirmation. Sheet/dialog focus is trapped, labelled, and returned to the trigger.
- Never require horizontal scrolling for forms, tables, chips, charts, or long labels. Charts have a readable summary/list alternative.
- `Saving…`, `Saved`, and failure states keep a stable layout and use icon/text, not color alone.
- `†` denotes sticky UI; `[⋮⋮]` denotes a visible drag handle; `!` denotes inline validation; `↻` denotes retry.

## S01 — Today

```text
┌──────────────────────────────┐
│ Pump Fiction          Wed 26 │
│ TODAY                        │
│                              │
│ Next in your program         │
│ Lower Body — Squat, Hinge &  │
│ Unilateral Focus             │
│ Avg 1 hr 08 min · 7 workouts │
│                              │
│ [      Start Workout      ]  │
│ [ Choose Another Split    ]  │
│ [ One-Time Workout        ]  │
│                              │
│ Today's weight               │
│ [  kg            ] [ Add ]   │
│                              │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Primary action sits in thumb reach. Wrap the long split name; do not truncate critical identity. No-program state replaces the proposal card with the provided empty copy but retains one-time workout and weight actions. A restored workout card precedes the proposal and shows running/paused state plus **Return to Workout**; do not offer a second start action.

## S02 — Choose another split sheet

```text
┌──────────────────────────────┐
│ (Today dimmed)               │
│ ┌──────────────────────────┐ │
│ │ ━  Choose another split  │ │
│ │ Only for this workout.   │ │
│ │ Rotation will not move.  │ │
│ │ ○ Upper Push             │ │
│ │ ● Upper Pull             │ │
│ │ ○ Lower Body — Squat…    │ │
│ │ [ Start Upper Pull ]     │ │
│ │ [ Cancel ]               │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Do not label this as **Set as Next**. Empty variant explains that the active program has no other active split.

## S03 — One-time workout builder

```text
┌──────────────────────────────┐
│ ‹ Today   One-Time Workout   │
│ Name                         │
│ [ Quick Hotel Session     ]  │
│                              │
│ Exercises                    │
│ [⋮⋮] Pull-Up             [×] │
│ [⋮⋮] Banded Face Pull    [×] │
│ [ + Add Exercise ]           │
│                              │
│ Not linked to a split;       │
│ rotation will not change.    │
│ [      Start Workout      ]  │†
└──────────────────────────────┘
```

An empty exercise list is valid only as an unfinished form, not a startable workout. Removal of a selected exercise follows populated/empty confirmation logic if local data exists. Show name and exercise validation inline.

## S04 — Today weight entry sheet

```text
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │
│ │ ━  Add today's weight    │ │
│ │ 26 Aug 2026              │ │
│ │ [ 82.4             ] kg  │ │
│ │ [ Save Weight ]          │ │
│ │ Saved ✓                  │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Request a decimal numeric keyboard. After save, close or show the saved value on Today; never leave a second-entry prompt. Failure keeps value and retry action.

## S05 — Exercise Library

```text
┌──────────────────────────────┐
│ Exercises              [ + ] │
│ [ Search exercises        ]  │
│ [ Active ] [ Archived ]      │
│                              │
│ Barbell Back Squat        ›  │
│ Weights · 2 modes            │
│ Pull-Up                   ›  │
│ Bodyweight · 4 modes         │
│ Walking Lunge With Contra… › │
│                              │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Wrap long names to two lines before truncation. This destination contains definitions, not PRs/charts. Archived rows carry text badge and **Reactivate** on detail. Empty and search-no-results variants have different copy.

## S06 — Add/Edit Exercise

```text
┌──────────────────────────────┐
│ ‹ Exercises   Edit Exercise  │
│ Name [ Pull-Up            ]  │
│ Type [ Bodyweight       ▾ ]  │
│ Allowed modes                │
│ ☑ Bodyweight reps            │
│ ☑ Added kilograms            │
│ ☑ Resistance band            │
│ ☑ Assistance band            │
│ Exercise note                │
│ [ Start from a dead hang… ]  │
│                              │
│ Used by 3 splits             │
│ Changes affect future        │
│ workouts only.               │
│ [ Save Exercise ]            │†
│ [ Archive Exercise ]         │
└──────────────────────────────┘
```

Type changes reveal only valid mode choices and must surface incompatible existing choices before save. Create omits usage/archive. Archived edit shows badge and **Reactivate Exercise**. Confirmation names the exercise but does not imply History deletion.

## S07 — Programs

```text
┌──────────────────────────────┐
│ Programs               [ + ] │
│ ACTIVE                       │
│ Strength & Hypertrophy…   ›  │
│ Next: Lower Body — Squat…    │
│ DRAFTS                       │
│ Hotel Gym Minimal Equip.  ›  │
│ ARCHIVED                     │
│ Spring Return-to-Training ›  │
│                              │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Status is always textual. Empty state leads to **Create Program**. An active program is singular and visually distinct without depending only on color.

## S08 — Program form/detail

```text
┌──────────────────────────────┐
│ ‹ Programs     Active        │
│ Strength & Hypertrophy —     │
│ Late Summer Block            │
│                              │
│ Split rotation               │
│ [⋮⋮] Lower Body…   NEXT  [›] │
│ [⋮⋮] Upper Push          [›] │
│ [⋮⋮] Upper Pull          [›] │
│ [ + Add Split ]              │
│                              │
│ [ Set Next Split ]           │
│ [ Save Changes ]             │†
│ [ Archive Program ]          │
└──────────────────────────────┘
```

Reorder retains the `NEXT` identity marker. **Set Next Split** opens an explicit persistent choice and must not resemble Today's override. Draft create uses **Save as Draft** and activation requires choosing the first next split. Reactivation uses the same choice and states that the currently active program will archive.

## S09 — Split form

```text
┌──────────────────────────────┐
│ ‹ Program       Edit Split   │
│ Name [ Lower Body — Squat… ] │
│                              │
│ [⋮⋮] Barbell Back Squat      │
│ Sets [3]  Reps [5] to [8]    │
│                         [×]  │
│ [⋮⋮] Dumbbell Romanian…      │
│ Sets [3]  Reps [8] to [10]   │
│                         [×]  │
│ [ + Add Exercise ]           │
│ [ Save Split ]               │†
│ [ Archive Split ]            │
└──────────────────────────────┘
```

Numeric fields request integer keyboards. Keep each prescription vertically readable at `320 px`. Duplicate exercise/name and rep-range errors sit beside the relevant control. Last-active archive rejection is a non-destructive explanatory dialog.

## S10 — Active workout

```text
┌──────────────────────────────┐
│ Lower Body…         24:18    │†
│ Saving…       [Continue Later]│
│                              │
│ [⋮⋮] Barbell Back Squat      │
│ 3 × 5–8 · Last: 82.5×6…     │
│ Note: Brace before unracking │
│                              │
│ SET  MODE       LOAD   REPS  │
│ ✓1  Weight      82.5    6    │
│ ▶2  Weight+band 75+Med  8 [✓]│
│  3  Weight      85     [ ]   │
│ [ + Add Set ]                │
│ Today's note [ Add/Edit ]    │
│                              │
│ [ + Add Exercise ]           │
│ [ Review & Finish ]          │†
└──────────────────────────────┘
```

On a real `320 px` frame, set rows may stack fields vertically; never create a horizontally scrolling table. Current set uses shape/icon/label plus color. Each set has a mode trigger and only applicable inputs; confirm is disabled or explains invalid input. Persistent exercise note is read-only and visually distinct from Today's note. Exercise/set menus include remove; populated removal uses `O01`. Reordering and all edits auto-save. A restored banner indicates running or paused state without resetting duration.

## S11 — Add workout exercise sheet

```text
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │
│ │ ━  Add Exercise          │ │
│ │ [ Search active library ]│ │
│ │ ○ Assisted Dip           │ │
│ │ ○ Banded Face Pull       │ │
│ │ ○ Single-Leg Calf Raise  │ │
│ │ [ Add Selected ]         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Archived exercises never appear. New workout exercise receives current definition and then becomes workout-local; no source-split edit implication.

## S12 — Finish review

```text
┌──────────────────────────────┐
│ ‹ Workout    Review & Finish │
│ Active duration     1:04:32  │
│ Exercises                 5  │
│ Confirmed sets           14  │
│ Empty planned sets        2  │
│                              │
│ Empty: Squat set 3; Calf 4   │
│ [ Complete Workout ]         │
│ [ Save as Incomplete ]       │
│ [ Continue Workout ]         │
│                              │
│ [ Discard Workout ]          │
└──────────────────────────────┘
```

Complete and incomplete outcomes explain statistics and applicable rotation effect. Discard is separated spatially and confirmed. Save progress prevents duplicate submission; failure retains review data and retry. **Continue Workout** returns without resetting the timer.

## S13 — Workout History

```text
┌──────────────────────────────┐
│ History                      │
│ Workouts Exercises Splits    │
│ Weight Body                  │
│ AUGUST 2026                  │
│ 24 Upper Pull          58m › │
│    6 exercises               │
│ 22 Lower Body…      1h12m  › │
│    5 exercises               │
│ 18 Upper Push         47m  › │
│    INCOMPLETE · 5 exercises  │
│ JULY 2026                    │
│ …                            │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Five History subsections must remain reachable without squeezing into an unreadable single row; a scrollable tab bar may be used only if each tab itself is reachable and content never becomes a horizontal table. Month groups are newest first. Incomplete uses badge/text, not color only.

## S14 — Workout detail/edit

```text
┌──────────────────────────────┐
│ ‹ Workouts       [ Edit ]    │
│ Lower Body — Squat…          │
│ 22 Aug · 17:42–18:54         │
│ Active 1 hr 12 min           │
│ Program: Strength & Hyper…   │
│                              │
│ Barbell Back Squat · 3×5–8   │
│ Snapshot note: Brace before… │
│ 1 82.5 kg × 6 ✓              │
│ 2 75 kg + med resist. × 8 ✓  │
│ Today's note: Knee felt good │
│ …                            │
│ [ Delete Workout ]           │
└──────────────────────────────┘
```

Edit mode exposes documented timing, order/content, set mode/values/reps, and workout-specific notes with auto-save feedback. It never edits the persistent snapshot note or source template. Incomplete detail shows exclusion message and **Mark Completed**; later completion explicitly says rotation will not change. Delete uses `O01` and recalculation feedback.

## S15 — Exercise History

```text
┌──────────────────────────────┐
│ History · Exercises          │
│ [ Search performance history]│
│ Barbell Back Squat        ›  │
│ Latest 85 kg × 6 · 22 Aug    │
│ Pull-Up                   ›  │
│ Latest +10 kg × 8 · 24 Aug   │
│ Cable Lateral Raise        › │
│ ARCHIVED · Latest 2 Jun      │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Only exercises with historical performance appear, including archived identities. This list lives in History and links to statistics, unlike `S05`.

## S16 — Exercise progress detail

```text
┌──────────────────────────────┐
│ ‹ Exercises  Barbell Squat   │
│ Latest: 85 kg × 6 · 22 Aug   │
│ PRs                          │
│ Highest 85 kg | Set vol 510  │
│ Workout volume 1,970 kg      │
│ [ Weight ▾ ] [ Quarter ▾ ]   │
│ ┌──────────────────────────┐ │
│ │      ╭─●                 │ │
│ │  ●──●                    │ │
│ │ ●                        │ │
│ └──────────────────────────┘ │
│ [ View data points ]         │
│ Performances                 │
│ 22 Aug · Lower Body…      ›  │
└──────────────────────────────┘
```

Metric options depend on type. Show band direction/strength as explicit categories and keep no-band separate. Assisted-kg variant labels lower assistance as improvement using text/icon and an axis explanation. Empty selected range keeps selectors and uses the provided no-data copy. Charts never stand alone.

## S17 — Split History

```text
┌──────────────────────────────┐
│ History · Splits             │
│ Program [ Strength & Hyp. ▾ ]│
│ Lower Body — Squat…       ›  │
│ 7 workouts · Avg 1h08        │
│ Latest 22 Aug                │
│ Upper Push                ›  │
│ 6 workouts · Avg 54m         │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Program identity/filter prevents same-named splits from merging. Empty state distinguishes no completed eligible split workouts from no configured split.

## S18 — Split progress detail

```text
┌──────────────────────────────┐
│ ‹ Splits      Lower Body…    │
│ Strength & Hypertrophy…      │
│ 7 completed · Total 7h56     │
│ Avg 1h08  Short 59m          │
│ Long 1h16  Latest 1h12       │
│ [ Quarter ▾ ]                │
│ ┌──────────────────────────┐ │
│ │ ●─●  ●──●  ●─●           │ │
│ └──────────────────────────┘ │
│ Workouts                     │
│ 22 Aug · 1h12             ›  │
└──────────────────────────────┘
```

One-time and incomplete workouts do not appear in aggregates/list. Provide accessible data points or the workout list as the chart alternative.

## S19 — Weight

```text
┌──────────────────────────────┐
│ History · Weight        [ + ]│
│ Latest 82.4 kg · 26 Aug      │
│ Since prior entry −0.3 kg    │
│ This week 82.63 kg           │
│ vs last week −0.42 · 3/7     │
│ Provisional until Sunday     │
│ [ Week Month Quarter Year ]  │
│ ┌──────────────────────────┐ │
│ │ daily ●─●                │ │
│ │ weekly ┄┄●               │ │
│ └──────────────────────────┘ │
│ Entries                      │
│ 26 Aug  82.4 kg  −0.3    ›  │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Daily and weekly-average series need distinct non-color cues and a legend. Missing prior week is unavailable, never zero. Editing/deleting returns here with visibly recalculated summary/chart.

## S20 — Weight entry

```text
┌──────────────────────────────┐
│ ‹ Weight       Edit Weight   │
│ Date   [ 26 Aug 2026      ]  │
│ Weight [ 82.4            ]kg │
│ ! Date cannot be in future   │
│ [ Save Weight ]              │†
│ [ Delete Entry ]             │
└──────────────────────────────┘
```

Create defaults to today; retrospective date remains available. Duplicate/future/decimal errors are inline and announced. Delete exists only in edit mode and uses confirmation.

## S21 — Body measurement types

```text
┌──────────────────────────────┐
│ History · Body          [ + ]│
│ Waist at Navel — Relaxed… ›  │
│ 84.2 cm · change −0.6         │
│ Left Upper Arm — Flexed    › │
│ 36.8 cm · change +0.3         │
│ ARCHIVED                     │
│ Chest · 103.4 cm           › │
│ Today History Programs Exer. │†
└──────────────────────────────┘
```

Changes are neutral in meaning; do not universally color increase green or decrease red. Archived types retain values/history and a reactivate path.

## S22 — Measurement type form

```text
┌──────────────────────────────┐
│ ‹ Body       Edit Type       │
│ Name                         │
│ [ Waist at Navel — Relaxed,  │
│   Morning, Before Breakfast ]│
│ Unit                    cm   │
│ [ Save Type ]                │†
│ [ Archive Type ]             │
└──────────────────────────────┘
```

Unit is fixed/read-only `cm`. Archived variant uses **Reactivate Type** and explains that existing entries remain. Long label must wrap in list, form, chart header, and entry screen.

## S23 — Measurement detail

```text
┌──────────────────────────────┐
│ ‹ Body  Waist at Navel… [ + ]│
│ Latest 84.2 cm · 25 Aug      │
│ Latest change −0.6 cm        │
│ Total change −5.8 cm         │
│ [ Month Quarter Year All ]   │
│ ┌──────────────────────────┐ │
│ │ ●─●──●─●                 │ │
│ └──────────────────────────┘ │
│ Entries                      │
│ 25 Aug 84.2 cm −0.6       ›  │
│ 10 Aug 84.8 cm −0.6       ›  │
└──────────────────────────────┘
```

Chart and summary use neutral semantics. Archived detail remains readable and offers reactivate but no new-entry action until active. Empty history has no fabricated zero/changes.

## S24 — Measurement entry

```text
┌──────────────────────────────┐
│ ‹ Waist…       Edit Entry    │
│ Date  [ 25 Aug 2026       ]  │
│ Value [ 84.2             ]cm │
│ [ Save Measurement ]         │†
│ [ Delete Entry ]             │
└──────────────────────────────┘
```

Use decimal numeric keyboard. Validation and destructive behavior mirror `S20`, scoped to the current type. Saved edit/delete recalculates latest, previous, first, changes, and chart.

## Shared overlay sketches

### O01 — Destructive confirmation

```text
┌──────────────────────────────┐
│ Remove populated Set 2?      │
│ 75 kg + medium resistance    │
│ band × 8 will be removed.    │
│ [ Cancel ] [ Remove Set ]    │
└──────────────────────────────┘
```

Use a target-specific title/body/action. Initial focus is the safe action. Workout discard states that no History record is created; historical delete states that derived statistics recalculate and rotation does not change.

### O02 — Load mode chooser

```text
┌──────────────────────────────┐
│ Select mode for Pull-Up      │
│ ○ Bodyweight reps            │
│ ○ Added kilograms            │
│ ○ Resistance band            │
│ ● Assistance band            │
└──────────────────────────────┘
```

Only definition-enabled modes appear. Changing mode clears or explicitly reconciles incompatible fields; the designer must flag any proposed hidden conversion as a conflict.

### O03/O07 — Persistence and restoration

```text
Saving…   | Saved ✓   | ! Couldn't save [Retry]
Restored workout · Running 24:18 | Paused 41:06
```

Reserve stable space where practical. Use live-region semantics without repeatedly interrupting set entry.
