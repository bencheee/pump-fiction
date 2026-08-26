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

These are design-reference constraints, not an expansion of product behavior. The user-facing name remains open beyond the replaceable working-name treatment.

## Exercises

**Add Exercise** contains name, exercise type, allowed modifications, exercise note, and **Save Exercise**.

**Edit Exercise** additionally shows current values, how many splits use the exercise, a message that edits affect only future workouts, and **Archive Exercise**.

See [`exercises.md`](../product/exercises.md).

## Programs

**Add Program** contains program name, a split list, **Add Split**, and **Save as Draft**.

**Edit Program** contains status, name, ordered split rotation, a next-split marker, **Set Next Split**, **Add Split**, **Edit Split**, and **Archive Program**.

See [`programs-and-splits.md`](../product/programs-and-splits.md).

## Splits

**Add Split** contains its program, split name, exercise list, **Add Exercise**, and **Save Split**.

**Edit Split** contains name, drag-handle ordering, planned sets/minimum reps/maximum reps for every exercise, **Remove**, **Add Exercise**, and **Archive Split**.

## Active workout

Each exercise card shows name, type, targeted sets and rep range, persistent exercise note, last-time result, the exact initial set count from the split, per-set load and reps inputs, set confirmation, **Remove set**, **Add set**, and **Today's note**.

For a pull-up or other configurable bodyweight exercise, changing a set's mode changes that set's fields among reps only, added kg plus reps, or band strength plus reps. Direction is retained for band modes.

The workout uses the focused shell and finish flow defined in [`workouts.md`](../product/workouts.md).

## History

History provides Workouts, Exercises, Splits, Weight, and Body subsections.

### Exercises

Provide a searchable list with latest-performance summaries. Detail provides PR summary, metric selector, time-range selector, chart, performance list, workout-specific notes, and workout links.

### Splits

Provide a program filter and split list with workout count and average duration. Detail provides average/shortest/longest duration, duration chart, and workout list.

### Weight

Provide latest value, weekly average and change, recorded-days count, time-range selector, chart, and entry list.

### Body

Provide measurement-type list with latest values and changes. Detail provides total change, time-range selector, chart, and entry list.

History calculations are canonical in [`history-and-statistics.md`](../product/history-and-statistics.md) and [`weight-and-body.md`](../product/weight-and-body.md).
