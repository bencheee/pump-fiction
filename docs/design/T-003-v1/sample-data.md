# Design sample data

Use this dataset consistently across frames so flows can be followed visually. Dates and copy are examples, not new product rules. Local time zone is `Europe/Zagreb`; display units are `kg` and `cm`.

## User, working name, and current context

- Working product text: `Pump Fiction`.
- Today: Wednesday, 26 August 2026.
- Active program: `Strength & Hypertrophy — Late Summer Block`.
- Proposed next split: `Lower Body — Squat, Hinge & Unilateral Focus`.
- Historical average duration: `1 hr 08 min` across `7` completed workouts.
- Current workout restore variants:
  - running: `24:18`, last saved `Just now`;
  - paused: `41:06`, paused at `11:42`, action **Continue Workout**;
  - failure: `Couldn't save latest changes`, action **Retry**.

## Exercise definitions and every load mode

| Exercise | Type | Allowed per-set modes | Persistent note |
| --- | --- | --- | --- |
| Barbell Back Squat | Weights | kg + reps; kg + resistance band + reps | Brace before unracking. Keep pressure through the whole foot. |
| Dumbbell Romanian Deadlift | Weights | kg + reps | Keep the dumbbells close and stop before the lower back rounds. |
| Pull-Up | Bodyweight | reps only; added kg + reps; resistance band + reps; assistance band + reps | Start from a dead hang; drive elbows toward the ribs. |
| Assisted Dip | Assisted | assistance kg + reps; assistance band + reps | Keep shoulders down and use a controlled bottom position. |
| Banded Face Pull | Band | resistance-band strength + reps | Pull toward eyebrow height and pause with external rotation. |
| Walking Lunge With Contralateral Front-Rack Kettlebell | Weights | kg + reps | Long-label case: keep the torso stacked while the load stays opposite the working leg. |
| Single-Leg Calf Raise | Bodyweight | reps only; added kg + reps | Use a full stretch and a one-second pause at the top. |
| Cable Lateral Raise | Weights | kg + reps | Archived exercise example retained in History. |

### Active workout set examples

| Exercise and set | Mode | Visible values | State |
| --- | --- | --- | --- |
| Barbell Back Squat, Set 1 | weights | `82.5 kg × 6` | Confirmed |
| Barbell Back Squat, Set 2 | weights + band | `75 kg + medium resistance band × 8` | Confirmed |
| Barbell Back Squat, Set 3 | weights | `85 kg`, reps empty | Current, incomplete; inline error only after confirm attempt |
| Pull-Up, Set 1 | bodyweight | `BW × 11` | Confirmed |
| Pull-Up, Set 2 | added weight | `BW + 12.5 kg × 7` | Confirmed |
| Pull-Up, Set 3 | resistance band | `BW + strong resistance band × 12` | Confirmed |
| Pull-Up, Set 4 | assistance band | `BW · light assistance band × 8` | Confirmed |
| Assisted Dip, Set 1 | assistance kg | `22.5 kg assistance × 10` | Confirmed |
| Assisted Dip, Set 2 | assistance band | `medium band assistance × 8` | Confirmed |
| Banded Face Pull, Set 1 | standalone band | `strong resistance band × 15` | Confirmed |

### Last-time and workout-note examples

- Pull-Up Last time: `18 Aug · BW + 10 kg: 8, 7, 6`.
- No eligible prior result: `No completed performance yet`.
- Workout-specific note: `Left elbow felt tight on the final two reps; keep neutral grip next time.`
- Long saved note: `Bench pin was one position lower than usual because the normal station was occupied.`

## Programs and splits

| Program | Status | Splits in order | Next |
| --- | --- | --- | --- |
| Strength & Hypertrophy — Late Summer Block | Active | Lower Body — Squat, Hinge & Unilateral Focus; Upper Push; Upper Pull | Lower Body — Squat, Hinge & Unilateral Focus |
| Hotel Gym Minimal Equipment | Draft | Full Body A; Full Body B | None until activation |
| Spring Return-to-Training | Archived | Full Body; Conditioning | Requires next selection on reactivation |

Split prescription example:

| Exercise | Planned sets | Rep range |
| --- | ---: | --- |
| Barbell Back Squat | 3 | 5–8 |
| Dumbbell Romanian Deadlift | 3 | 8–10 |
| Walking Lunge With Contralateral Front-Rack Kettlebell | 2 | 10–12 |
| Single-Leg Calf Raise | 4 | 12–20 |

Validation cases:

- Duplicate active exercise name: `Pull-Up` → `An active exercise already uses this name.`
- Invalid split range: minimum `12`, maximum `8` → `Maximum reps must be at least 12.`
- Duplicate split exercise: second `Barbell Back Squat` → `This exercise is already in the split.`
- Last active split archive: `Add or reactivate another split before archiving this one.`

## Workout History

| Date | Saved name | Duration | Exercises | Status/source |
| --- | --- | ---: | ---: | --- |
| 24 Aug 2026 | Upper Pull | 58 min | 6 | Completed proposed split |
| 22 Aug 2026 | Lower Body — Squat, Hinge & Unilateral Focus | 1 hr 12 min | 5 | Completed proposed split |
| 20 Aug 2026 | Quick Hotel Session | 34 min | 4 | Completed one-time workout |
| 18 Aug 2026 | Upper Push | 47 min | 5 | Incomplete |
| 29 Jul 2026 | Lower Body — Squat, Hinge & Unilateral Focus | 1 hr 05 min | 5 | Completed alternate split |

Historical correction example: change Pull-Up Set 2 from `BW + 10 kg × 6` to `BW + 10 kg × 8`; saved feedback states that progress statistics and Last time were recalculated, while templates and rotation were not changed.

## Exercise progress datasets

### Barbell Back Squat — weight and volume

| Date | Highest kg | Total volume | Band category |
| --- | ---: | ---: | --- |
| 6 Jul | 75 | 1,740 kg | No band |
| 20 Jul | 77.5 | 1,805 kg | No band |
| 3 Aug | 80 | 1,880 kg | No band |
| 17 Aug | 82.5 | 1,932.5 kg | No band |
| 22 Aug | 85 | 1,970 kg | No band |

Separate resistance-band category example: `medium resistance`, best `75 kg × 8`; it is never merged with no-band results.

### Pull-Up — category-separated progress

- Pure bodyweight: highest set `14 reps`; workout total `36 reps`.
- Added weight: highest `15 kg`; highest at `10 kg` is `8 reps`; workout total `22 reps`.
- Light assistance band: best `12 reps`.
- Strong resistance band: best `12 reps`.

### Assisted Dip — lower assistance is improvement

| Date | Assistance | Reps |
| --- | ---: | ---: |
| 8 Jun | 35 kg | 10 |
| 29 Jun | 30 kg | 10 |
| 20 Jul | 27.5 kg | 9 |
| 10 Aug | 25 kg | 10 |
| 24 Aug | 22.5 kg | 10 |

The design must communicate improvement without pretending that the numerical axis increased.

## Split duration dataset

For persistent split `Lower Body — Squat, Hinge & Unilateral Focus` in the active program:

- completed count `7`;
- total `7 hr 56 min`;
- average `1 hr 08 min`;
- shortest `59 min`;
- longest `1 hr 16 min`;
- latest `1 hr 12 min`.

Chart points: `64, 71, 59, 68, 66, 76, 72` minutes. A same-named split in another program is a separate filter/list row.

## Weight data

Latest: `82.4 kg` on 26 Aug; previous weigh-in `82.7 kg`, so individual change `−0.3 kg`.

Current Monday–Sunday week: Mon `82.8`, Tue `82.7`, Wed `82.4`; average `82.63 kg`, recorded `3/7`, label `Provisional until Sunday`. Previous week average `83.05 kg`; weekly change `−0.42 kg`.

Missing-prior-week variant: display `No previous-week data`, never `0.0 kg`.

Validation examples:

- Future date 27 Aug 2026 → `Date cannot be in the future.`
- Duplicate 26 Aug 2026 → `A weight entry already exists for this date.`
- Invalid decimal → `Enter a valid weight in kilograms.`

## Body data

| Type | Status | Latest | Latest change | Total change |
| --- | --- | --- | ---: | ---: |
| Waist at Navel — Relaxed, Morning, Before Breakfast | Active | `84.2 cm · 25 Aug` | `−0.6 cm` | `−5.8 cm` |
| Left Upper Arm — Flexed | Active | `36.8 cm · 23 Aug` | `+0.3 cm` | `+2.1 cm` |
| Chest | Archived | `103.4 cm · 2 Jun` | `−0.2 cm` | `+1.4 cm` |

Waist chart values: `90.0, 88.7, 87.9, 86.1, 85.4, 84.8, 84.2 cm`. Positive and negative changes use neutral typography plus explicit `+`/`−`; neither direction receives universal success/danger color.

Validation mirrors Weight but is scoped by measurement type/date and uses centimeters.

## Empty, loading, and error copy anchors

- No program: `Create or activate a program to get a proposed workout.` One-time workout remains available.
- No exercises: `Add your first exercise to build splits and workouts.`
- No History workouts: `Completed and incomplete workouts will appear here.`
- No exercise statistics: `Complete a workout with confirmed sets to see progress.`
- No chart data in range: `No eligible data in this range.` Keep range selector available.
- Loading: semantic skeletons with accessible label `Loading …`; never show zero values as placeholders.
- Save failure: `Couldn't save your latest changes.` Actions **Retry** and, where useful, **Review changes**.
- Archived: visible `Archived` badge plus **Reactivate**; no destructive-history wording.
- Incomplete: `Excluded from personal records, charts, and split duration statistics.`

## Content stress cases

- Narrow viewport `320 px` with the longest program, split, exercise, and measurement labels above.
- Large values: `152.75 kg`, `1 hr 59 min`, `12,480.5 kg volume`, `999 reps`.
- Dense workout: `12 exercises`, `8 sets` on one exercise, mixed confirmed/current/empty rows.
- Search no-results strings and archived-only matches.
- Keyboard-open state on the last numeric input, with primary action remaining reachable without hiding the field.
