# MVP acceptance criteria

- **Status:** Locked — approved on 2026-08-25. Behavior changes require an explicit product decision and corresponding documentation update.
- **Target:** The first complete local, single-user, phone-only MVP. Production deployment is a later phase.

## How to use this document

These criteria define observable acceptance, not implementation design. Stable IDs should be referenced from implementation plans and tests. The linked product documents remain canonical for full behavior; if a criterion and its canonical document disagree, report and resolve the mismatch before implementation.

Unless a criterion explicitly says otherwise:

- “workout” means a persisted workout record;
- “eligible” means confirmed data from a completed workout;
- dates and weeks use the configured local time zone;
- destructive removal of populated or historical data requires confirmation;
- changes made during an active workout auto-save and survive application reload.

## Release-level acceptance

### MVP-REL-001 — Product boundary

The accepted product is usable by one person on a phone without creating an account or logging in during local development. It contains no nutrition or calorie-tracking functionality and does not require a desktop-specific experience.

### MVP-REL-002 — Navigation boundary

Outside an active workout, the bottom navigation exposes exactly Today, History, Programs, and Exercises. An active workout uses a focused screen without that bottom navigation.

### MVP-REL-003 — Persistent canonical history

Reloading or reopening the application preserves exercise definitions, programs, splits, rotation state, active-workout state, completed and incomplete workouts, weight entries, measurement types, and measurement entries.

### MVP-REL-004 — No silent data reinterpretation

Editing or deleting a definition never retroactively changes a saved workout snapshot. Editing historical data recalculates affected derived statistics without mutating templates or rotation.

## Today

Canonical behavior: [`overview.md`](overview.md#today).

### MVP-TOD-001 — Proposed workout

Given an active program with a next active split, Today shows the local date, that split, its completed-history average duration when available, and a primary **Start Workout** action.

### MVP-TOD-002 — Today-only split choice

Given another active split is selected through **Choose Another Split**, starting and completing it records a split workout and contributes to that split's statistics, but does not change or advance the rotation pointer.

### MVP-TOD-003 — One-time workout

The user can give a one-time workout an arbitrary name and add active library exercises. Completing it contributes eligible sets to exercise statistics but creates no split statistic and never changes rotation.

### MVP-TOD-004 — Today's weight prompt

Today offers a weight input when the local date has no weight entry. After today's entry exists, the new-entry prompt is no longer shown as though another entry can be created.

## Exercise library

Canonical behavior: [`exercises.md`](exercises.md).

### MVP-EXE-001 — Create and validate an exercise

The user can create an exercise with a unique active name, either `weights` or `bodyweight`, at most one optional addition on top of the mode its type implies, and an optional persistent note. The implied mode is never offered as a choice. Saving is rejected when the active name is not unique or the type/mode combination is invalid.

### MVP-EXE-002 — Weights modes

A weights set accepts decimal kilograms and positive-integer reps. If the definition permits it, the set can additionally select one `light`, `medium`, or `strong` resistance band; assistance-band semantics are not offered for a weights set.

### MVP-EXE-003 — Bodyweight modes

A bodyweight definition always allows reps-only bodyweight and may additionally allow exactly one of decimal added kilograms, a resistance band, assistance kilograms, or an assistance band. A set uses the definition's implied mode or its single addition, and never combines two of them.

### MVP-EXE-004 — Assistance modes

Assistance is a bodyweight addition rather than a separate type. A bodyweight definition that allows assistance accepts either positive decimal assistance kilograms plus reps or an assistance-band strength plus reps, and saving both assistance modes is rejected. A band is never entered or stored as kilograms.

### MVP-EXE-005 — Band identity

Every band-bearing set preserves direction (`resistance` or `assistance`) separately from strength (`light`, `medium`, or `strong`), and downstream history never merges different direction/strength combinations.

### MVP-EXE-006 — Persistent note

The exercise note is editable in the library, appears read-only when that definition is added to a workout, and is snapshotted so a later library edit does not alter existing workouts.

### MVP-EXE-007 — Edit impact warning

When editing an exercise used by one or more splits, the UI shows how many splits use it and states that changes apply only to future workouts.

### MVP-EXE-008 — Delete

Deleting an exercise removes it and its split prescriptions permanently, after a confirmation naming how many splits lose it. Every workout snapshot, History record, and statistic that already contains it is unchanged.

## Programs and splits

Canonical behavior: [`programs-and-splits.md`](programs-and-splits.md).

### MVP-PRG-001 — Program lifecycle

The user can save a named program, make it the current program by selecting the split its rotation starts from, and delete it. Making a program current replaces any previously current program, so at most one program is current, and deleting the current program leaves no current program.

### MVP-PRG-002 — Split validation

A split belongs to one program and has a name unique within that program. It cannot contain the same exercise twice. Every split exercise requires positive-integer planned sets, minimum reps, and maximum reps, with minimum reps less than or equal to maximum reps.

### MVP-PRG-003 — Template ordering

The user can reorder splits in a program and exercises in a split using a visible drag handle. Reordering does not change saved or active workouts. Reordering splits preserves the identity of the current next split and changes only what follows it.

### MVP-PRG-004 — Set next split

**Set as Next** persistently changes the active program's rotation pointer and is distinguishable from Today’s one-workout split override.

### MVP-PRG-005 — Proposed-split rotation

Starting the proposed split does not move rotation. Completing it advances to the next active split, wrapping after the last active split. Saving it incomplete, discarding it, editing it later, or deleting it later does not advance or rewind rotation.

### MVP-PRG-006 — Alternate and one-time rotation

Completing a Today-only alternate split or a one-time workout never advances rotation. Marking an incomplete historical workout completed later also never changes the then-current rotation.

### MVP-PRG-007 — Archive a split

Deleting a split removes it and its prescriptions permanently while every workout it produced keeps its name snapshot in History. If it was next, the first split after it in the prior order—wrapping if needed—becomes next. The app rejects an attempt to delete the last split of the current program and explains that the current program must keep at least one split.

## Active workout

Canonical behavior: [`workouts.md`](workouts.md).

### MVP-WRK-001 — Snapshot creation

Starting a split workout creates a workout-owned snapshot containing source references plus the then-current program, split, exercise, load-mode, note, prescription, and ordering values defined in [`domain-model.md`](../architecture/domain-model.md#workout-snapshots).

### MVP-WRK-002 — Exact initial set count

Each snapshotted split exercise initially receives exactly its planned number of ordered set rows. Planned count is not a limit: the user can add or remove sets without changing the split.

### MVP-WRK-003 — Per-set mode and validation

Each set displays only the inputs of its snapshot's implied mode, and where the definition permits an addition each set can independently apply or remove exactly that addition. No set offers a menu of modes. Decimal load/assistance values are allowed where applicable, reps must be positive integers, and an invalid or incomplete set cannot be confirmed as eligible data.

### MVP-WRK-004 — Immediate persistence

Confirming a valid set persists it immediately. Reordering exercises, adding/removing exercises or sets, changing set values/modes, timer changes, and workout-specific notes also auto-save without an explicit workout-wide save action.

### MVP-WRK-005 — Restore one current workout

At most one current active or paused workout exists. Reloading or reopening restores that workout with its order, entered and confirmed sets, notes, timer state, and accumulated active duration intact.

### MVP-WRK-006 — Last time

For each exercise, **Last time** shows the latest eligible performance for the same persistent exercise identity across every split and one-time workout. Historical corrections are reflected; incomplete workouts are excluded.

### MVP-WRK-007 — Workout-specific note

The user can auto-save a note for an exercise occurrence in the current workout. It appears with that workout in History and is not copied into later workouts.

### MVP-WRK-008 — Workout-local exercise changes

The user can reorder, add, and remove workout exercises. Newly added exercises come only from the active library and receive a current definition snapshot. None of these changes mutates the source split.

### MVP-WRK-009 — Populated-data confirmation

Removing a set or exercise that already contains data requires confirmation. Removing an empty row does not imply removal from the source split.

### MVP-WRK-010 — Active-duration timer

The timer counts active workout time. **Continue Later** pauses it; elapsed wall-clock time while paused is excluded. Continuing resumes from the accumulated duration rather than restarting or including the pause.

### MVP-WRK-011 — Finish review

Before finalization, the review shows active duration, exercise count, confirmed-set count, and empty planned sets, with actions for **Complete Workout**, **Save as Incomplete**, **Continue Workout**, and separately confirmed discard.

### MVP-WRK-012 — Completion outcomes

Completing creates an eligible History workout and applies the source-specific rotation rule. Saving incomplete keeps the workout in History but excludes it from PRs, exercise charts, and split-duration statistics. Discard removes the current workout after confirmation without creating History or advancing rotation.

## History and statistics

Canonical behavior: [`history-and-statistics.md`](history-and-statistics.md).

### MVP-HIS-001 — History structure

History contains Workouts, Exercises, Splits, Weight, and Body. Exercise performance statistics do not appear as ownership of the Exercise Library, and split statistics do not belong to the Programs template area.

### MVP-HIS-002 — Workout list and snapshot detail

Workouts appear newest first, grouped by month, with date, saved split/one-time name, active duration, performed exercise count, and incomplete marker. Detail displays saved timing, source identity/name, ordered exercise/prescription snapshots, actual sets, exercise-note snapshots, and workout-specific notes.

### MVP-HIS-003 — Historical correction

The user can correct the documented workout fields, including date/time, exercise order/content, set modes/values, reps, and workout-specific notes. A correction updates affected derived output and **Last time** without changing any template or rotation pointer.

### MVP-HIS-004 — Historical deletion

Deleting a workout requires confirmation, removes it from History, and recalculates affected latest performances, PRs, charts, and split statistics without changing rotation.

### MVP-HIS-005 — Exercise history identity

Exercises with historical performances appear in Exercise History even after their definition is deleted. Their detail combines performances across splits/programs/one-time workouts by persistent exercise identity and links each performance to its workout.

### MVP-HIS-006 — Statistics eligibility

Only confirmed sets from completed workouts feed exercise PRs and charts. Only completed split workouts feed their persistent split's duration statistics. One-time workouts feed exercise statistics only; incomplete workouts feed neither.

### MVP-HIS-007 — Weights PRs

For weights exercises, the app derives highest entered weight, highest reps at each weight, highest set volume (`weight × reps`), and highest summed confirmed-set exercise volume in one workout. No-band and each resistance-band strength are compared separately.

### MVP-HIS-008 — Bodyweight and assisted PRs

Pure bodyweight derives highest set reps and workout total reps. Added-weight bodyweight derives highest added weight, highest reps at the same added weight, and workout total reps. Kilogram-assisted exercise derives least successful assistance and highest reps at the same assistance.

### MVP-HIS-009 — Band comparison

Band-bearing results are compared only within the same direction and strength. No statistic converts a band to kilograms or ranks assistance and resistance as equivalent.

### MVP-HIS-010 — Exercise charts

The exercise detail can select metrics meaningful to its type—including weight, reps, volume/total reps, assistance, or band category—and the agreed week/month/quarter/year/all ranges where applicable. Lower kilogram assistance is visually treated as progress.

### MVP-HIS-011 — Split statistics

Split History keeps same-named splits from different programs separate. It derives completed count, total/average/shortest/longest/latest duration, duration chart, and workout list; one-time and incomplete workouts are excluded.

## Weight

Canonical behavior: [`weight-and-body.md`](weight-and-body.md#weight-tracker).

### MVP-WGT-001 — Daily entry validation

The user can create or edit one decimal-kilogram entry per local date, defaulting to today, and can delete it. Retrospective dates are accepted; future dates and a duplicate date are rejected.

### MVP-WGT-002 — Weekly calculations

For Monday–Sunday local weeks, weekly average divides the sum by the number of recorded days, not seven. Weekly change subtracts the preceding week's average and is unavailable when that week has no entries. The UI shows the recorded count as `n/7` and treats the current week as provisional until Sunday.

### MVP-WGT-003 — Weight history and chart

Weight shows latest entry, current weekly average/change/count, change from the previous individual weigh-in, all entries, and a week/month/quarter/year chart containing daily values and weekly averages.

### MVP-WGT-004 — Recalculation

Editing or deleting an entry immediately recalculates every affected weekly average/change, latest value, individual change, and chart point.

## Body measurements

Canonical behavior: [`weight-and-body.md`](weight-and-body.md#body-tracker).

### MVP-BOD-001 — Measurement-type lifecycle

The user can create an arbitrary named measurement type measured in `cm` and delete a type that has no entries. A type that still has entries cannot be deleted, because those entries are the only record of that measurement.

### MVP-BOD-002 — Measurement entry validation

For each type, the user can create or edit one decimal-centimeter value per local date and can delete it. Retrospective dates are accepted; future and duplicate type/date entries are rejected.

### MVP-BOD-003 — Measurement detail

Detail shows latest value/date, latest change (`latest − previous`), total change (`latest − first`), all entries, and month/quarter/year/all chart ranges. Increase and decrease are not automatically labelled good or bad.

### MVP-BOD-004 — Recalculation

Editing or deleting an entry immediately recalculates affected latest, previous, first, change, total-change, and chart values.

## Mobile interaction acceptance

Canonical behavior: [`mobile-information-architecture.md`](../ux/mobile-information-architecture.md#mobile-interaction-rules).

### MVP-UX-001 — Phone interaction

All required flows are operable at phone viewport widths without horizontal table scrolling. Primary actions are placed for practical thumb access, and numeric values request an appropriate numeric keyboard.

### MVP-UX-002 — State and reorder affordances

The current set is visibly distinct. Every reorderable list has an explicit drag handle, and completing a reorder auto-saves its new order.

### MVP-UX-003 — Destructive confirmation

The app asks for confirmation before removing populated active-workout data, deleting a historical workout, or discarding a current workout.

## Explicitly outside these core criteria

- accounts and login during local development;
- desktop-specific layouts;
- nutrition and calorie tracking;
- estimated 1RM, RIR/RPE, rest timer, and warm-up-set behavior unless separately accepted;
- export/backup, PWA installation, and explicit protection against accidentally closing an active workout, which are accepted post-MVP capabilities;
- final framework, persistence technology, styling library, chart library, and test framework;
- production deployment mechanics.

UI language and the application name may change copy but do not alter these behavioral acceptance criteria.

## Confirmed release boundary

- Deleting the last split of the current program is blocked.
- Export/backup and PWA installation are accepted post-MVP capabilities.
- Explicit protection against accidentally closing an active workout is post-MVP. Immediate auto-save and reliable restore remain required by this MVP.
- Production-access protection is not part of the local MVP and must be decided before production deployment.
