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

**Edit Split** contains name, per-row move-up and move-down ordering, planned sets/minimum reps/maximum reps for every exercise, **Remove**, **Add Exercise**, and **Delete Split**, which is disabled with an explanation for the last split of the current program.

## Active workout

Each exercise card shows name, type, targeted sets and rep range, persistent exercise note, last-time result, the exact initial set count from the split, per-set load and reps inputs, icon-only set removal, **Add Set**, and **Today's note**. The cards form an accordion: all start collapsed, only one can be expanded, and expanding one closes the previous card and aligns the opened card with the top of the visible workout content below the sticky header. The title/card surface itself is the named disclosure trigger and carries no chevron. Its small up, down, and remove icons share the upper-right title row; there is no drag handle. There is no set-confirmation control: entering the values records the set.

A set occupies one 32-pixel-high horizontal row rather than separate title and field rows. It contains the set number, its applicable value inputs, a compact icon for applying or removing the definition's optional addition, and the final remove-set X. The addition icon retains the accessible name the definition requires, such as **Add resistance band**, **Add weight**, **Assist with weight**, or **Assist with band**. Band strength uses a compact labelled select in this row and retains direction through the load mode. A definition with no addition has no addition control. **Add Set** is borderless green text aligned to the right.

The persistent **Exercise note** uses the warning-yellow token. **Last time** places its date in the heading and lists each set on a separate line in reps-first notation.

Restoring a workout shows no banner: the restored workout itself is the evidence. The exercise-note heading reads only **Exercise note**, and the note stays read-only.

The workout header is one row: truncated workout name, text-only **Continue Later** or **Resume**, and the live clock, in 40 CSS pixels beyond the safe-area inset. At the lower-right, one round check action replaces the full-width Review & Finish button. It opens the review as an in-place sheet from the already loaded workout. The sheet keeps **Complete Workout**, **Save as Incomplete**, **Continue Workout**, and the separately confirmed **Discard Workout** together, so discard stays reachable without leaving and reloading the active screen. Start and finish persistence cover the viewport with a progress layer so a pending database transition cannot be triggered twice.

Today's weight card sits below the workout actions and above the rotation note, in every state including no program and a restored workout. It offers the entry while the day has none and shows the recorded value with a link to Body once it does; it never offers a second entry, and it never edits or deletes. Since [ADR-0030](../decisions/0030-body-is-its-own-destination.md) it is one of two entry cards, and the only place a weigh-in is created.

The measurements card sits beside it and behaves the same way, for every defined measurement at once: it names which the day is missing, opens one sheet holding one field per missing measurement, and saves them together. A refusal shows against the measurement it belongs to rather than against the form. Once none is missing the card lists the day's values with a link to Body, and when no measurement type is defined the card is absent entirely.

The workout keeps the bottom navigation and uses the finish flow defined in [`workouts.md`](../product/workouts.md).

## History

History provides Workouts, Exercises, and Splits. A subsection bar sits above the content and marks the current one without relying on color; the Body destination carries the same bar over its own two tabs.

### Workouts

The list groups saved workouts by calendar month, newest first. Each row shows the saved split or one-time name, the date, the active duration, the performed exercise count, and an incomplete badge where it applies.

A workout detail renders the saved snapshot with its timing, source names, ordered exercises, prescriptions, note snapshots, and sets. An incomplete workout also carries the explanation of what it is excluded from and the action that marks it completed. Deleting asks for confirmation and returns to the list.

Editing is a separate screen. It corrects the date, start, finish, set values, and workout notes behind one **Save corrections** action that returns to the detail, following the same save contract as the definition forms. Adding, removing, and reordering sets and exercises apply immediately, each with the confirmation that populated data requires, and are unavailable while the form holds unsaved edits, because applying one reloads the workout.

### Exercises

Provide a searchable list with latest-performance summaries. Detail provides PR summary, metric selector, time-range selector, chart, performance list, workout-specific notes, and workout links.

Search filters the loaded list in the browser rather than per keystroke on the server. An exercise whose definition was deleted stays in the list under a marker rather than disappearing.

The detail groups personal records by comparison category, one panel per category, and never merges a band strength or direction with another. A record whose progress runs downwards, such as assistance, says so in words beside its value and reverses its chart axis, so the direction never rests on color or on the reader's assumption. Every chart is accompanied by a sentence summarising the series and an expandable list of its values. Performances from incomplete workouts appear in the list under the same explanation the workout detail gives.

### Splits

Provide a program filter and split list with workout count and average duration. Detail provides average/shortest/longest duration, duration chart, and workout list.

The filter appears only when more than one program has a completed split; a single program needs no filter. A split whose template was deleted stays listed under a marker and under the name it was performed as. The detail gives the six duration statistics as stat cards, the range selector, the duration chart with its sentence and value list, the exclusion rule in words, and each workout as a link to its own detail.

### Weight

The first tab of the Body destination. Provide latest value, weekly average and change, recorded-days count, time-range selector, chart, and entry list — and no way to create one.

The two summaries are stat cards: the latest weigh-in with its date and its change from the one before it, and this week with its average, its change from last week or the unavailable state, its `n/7` count, and whether it is provisional or final. A week with no weigh-in yet says so rather than showing a zero. The range selector offers week, month, quarter, and year, and opens on the month. The chart carries a legend naming its solid and dashed lines, a sentence above it, and an expandable list below that repeats both the weigh-ins and the weekly averages with their spans. Each weigh-in row opens the entry screen for that date.

The screen offers no add action: a weigh-in is created on Today and nowhere else. Each row opens the entry screen for its date, which corrects the value it already holds. That screen's save, validation, and outcome cue is the first row of the sticky action bar, and **Delete Entry** sits behind the destructive confirmation that names what recalculates.

### Measurements

The second tab of the Body destination. Provide measurement-type list with latest values and changes. Detail provides total change, time-range selector, chart, and entry list.

The list is ordered by name and each row carries the latest value, its date, and its change, or says that nothing is recorded yet. It shows no archived section, badge, or filter, because [ADR-0024](../decisions/0024-deletion-with-preserved-history.md) removed archiving, and it states once that a rise or a fall is neither good nor bad on its own.

The type form states the unit in the hint under the name rather than as a block of its own, which ADR-0030 decided. It offers **Delete Measurement** only while the type holds nothing; with entries it explains that they are the only record and that renaming keeps every one of them, rather than disabling a control silently. Renaming is an ordinary save.

The detail names the unit under the measurement's name, then gives the latest value, the latest change, and the total change as stat cards, each saying so plainly when there is nothing to compare against. Its range selector offers month, quarter, year, and all, and opens on all. It offers no add action either: a value is recorded on Today. Each row opens the entry screen for its date, which mirrors the weight one — the cue in the first row of the sticky action bar, and deletion behind the destructive confirmation.

History calculations are canonical in [`history-and-statistics.md`](../product/history-and-statistics.md) and [`weight-and-body.md`](../product/weight-and-body.md).
