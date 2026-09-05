# Wireframe decisions

These are canonical textual screen decisions. The versioned `T-003` design-agent input package adds annotated low-fidelity wireframes without replacing the behavior here; see [`../design/T-003-v1/README.md`](../design/T-003-v1/README.md).

Global navigation and interaction constraints are in [`mobile-information-architecture.md`](mobile-information-architecture.md). Detailed behavior belongs to the linked product documents rather than this screen inventory.

## T-003 design-brief reference constraints

The Owner confirmed these inputs on `2026-08-26` for the first external design brief:

- fixed reference viewports are `390 × 844` CSS pixels at `3x` for Mobile Safari/WebKit and `360 × 800` CSS pixels at `3x` for Mobile Chrome/Chromium;
- layouts must reflow throughout the phone-width range from `320` through `430` CSS pixels, without introducing a desktop layout;
- visible UI copy is English;
- `Pump Fiction` is a replaceable text working name, not a request for a logo or permanent product-name decision;
- the visual direction is dark-first, focused, and athletic, while meeting WCAG 2.2 AA, using non-color state cues, visible focus, reduced-motion behavior, and practical touch targets;
- use only implementation-ready, licensed assets; prefer SVG for vectors and avoid paid fonts or assets unless separately approved;
- the handoff must provide an editable design source, clickable prototype, reference PNGs, SVG assets, and machine-readable design tokens. Figma is acceptable but not mandatory if another tool can satisfy the same contract;
- the exact stable Mobile Safari/WebKit and Mobile Chrome/Chromium versions used for fixed references are frozen and recorded in the returned handoff.

The accepted handoff narrows the existing v0.3 PNG authority: those images remain structural references for layout, spacing, typography, content, chart geometry, badges, and skeletons. The v0.4 prototype and specifications are authoritative for color and contrast tokens, the save/validation/outcome cue placement, and the corrected `S09`/`S10` validation fixtures. Those areas are excluded from pixel-diff against the v0.3 PNGs. The exact package identity and exceptions are recorded in [`../design/T-004-v0.4-frozen/README.md`](../design/T-004-v0.4-frozen/README.md).

These are design-reference constraints, not an expansion of product behavior. The user-facing name remains open beyond the replaceable working-name treatment.

## Saving a definition

Saving an exercise, program, or split closes the screen: the app returns to the parent screen and confirms the save with a toast there. A failure keeps the screen open, shows its field errors, and reports the failure as a toast. The parent screens are the Exercises list, the Programs list, and the owning program's edit screen. A form reports `Unsaved changes` only while it actually differs from the state it opened with. The implementation contract is in [`../architecture/mobile-ui-foundation.md`](../architecture/mobile-ui-foundation.md#definition-form-save-contract).

## Exercises

**Add Exercise** contains name, exercise type, the optional per-set addition its type offers, exercise note, and **Save Exercise**. The mode a type implies is stated as a sentence rather than offered as a selectable row.

**Edit Exercise** additionally shows current values, how many splits use the exercise, a message that edits affect only future workouts, and **Delete Exercise**, whose confirmation names the splits that lose it.

See [`exercises.md`](../product/exercises.md).

## Programs

**Add Program** contains program name, a split list, **Add Split**, and **Save Program**.

**Edit Program** contains name, a current-program marker, ordered split rotation, a next-split marker, **Make Current Program** or **Set Next Split**, **Add Split**, **Edit Split**, and **Delete Program**.

See [`programs-and-splits.md`](../product/programs-and-splits.md).

## Splits

**Add Split** contains its program, split name, exercise list, **Add Exercise**, and **Save Split**.

**Edit Split** contains name, drag-handle ordering, planned sets/minimum reps/maximum reps for every exercise, **Remove**, **Add Exercise**, and **Delete Split**, which is disabled with an explanation for the last split of the current program.

## Active workout

Each exercise card shows name, type, targeted sets and rep range, persistent exercise note, last-time result, the exact initial set count from the split, per-set load and reps inputs, **Remove set**, **Add set**, and **Today's note**. There is no set-confirmation control: entering the values records the set.

A set shows the fields of its exercise's implied mode. When the definition permits an addition, each set carries one control that applies it or removes it again, named for the addition the definition actually allows, such as **Add resistance band**, **Add weight**, **Assist with weight**, or **Assist with band**. A definition with no addition has no control. Direction is retained for band modes.

Restoring a workout shows no banner: the restored workout itself is the evidence. The exercise-note heading reads only **Exercise note**, and the note stays read-only.

The finish review keeps **Complete Workout**, **Save as Incomplete**, **Continue Workout**, and the separately confirmed **Discard Workout** together in one sticky action group, so discard stays reachable without scrolling.

The workout keeps the bottom navigation and uses the finish flow defined in [`workouts.md`](../product/workouts.md).

## History

History provides Workouts, Exercises, Splits, Weight, and Body subsections. A subsection bar sits above the content and marks the current subsection without relying on color.

### Workouts

The list groups saved workouts by calendar month, newest first. Each row shows the saved split or one-time name, the date, the active duration, the performed exercise count, and an incomplete badge where it applies.

A workout detail renders the saved snapshot with its timing, source names, ordered exercises, prescriptions, note snapshots, and sets. An incomplete workout also carries the explanation of what it is excluded from and the action that marks it completed. Deleting asks for confirmation and returns to the list.

Editing is a separate screen. It corrects the date, start, finish, set values, and workout notes behind one **Save corrections** action that returns to the detail, following the same save contract as the definition forms. Adding, removing, and reordering sets and exercises apply immediately, each with the confirmation that populated data requires, and are unavailable while the form holds unsaved edits, because applying one reloads the workout.

### Exercises

Provide a searchable list with latest-performance summaries. Detail provides PR summary, metric selector, time-range selector, chart, performance list, workout-specific notes, and workout links.

### Splits

Provide a program filter and split list with workout count and average duration. Detail provides average/shortest/longest duration, duration chart, and workout list.

### Weight

Provide latest value, weekly average and change, recorded-days count, time-range selector, chart, and entry list.

### Body

Provide measurement-type list with latest values and changes. Detail provides total change, time-range selector, chart, and entry list.

History calculations are canonical in [`history-and-statistics.md`](../product/history-and-statistics.md) and [`weight-and-body.md`](../product/weight-and-body.md).
