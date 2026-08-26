# Exact outbound prompt — Pump Fiction mobile UI/UX design v1

Send the text below unchanged and attach these four companion files: `screen-state-manifest.md`, `criteria-to-screen-map.md`, `sample-data.md`, and `wireframes.md`.

---

You are designing the complete Local MVP mobile UI/UX for a private gym-workout and body-progress web application with the replaceable working title “Pump Fiction.” Create a version-labelled, implementation-ready design package. Do not reinterpret product behavior. If any instruction is missing, ambiguous, conflicting, or impractical, return a clearly labelled question or finding instead of guessing.

## Inputs you must use

Four attached files are part of this brief and are authoritative design inputs:

1. `screen-state-manifest.md` — complete screen, route-label, overlay, state, and critical-flow inventory;
2. `criteria-to-screen-map.md` — required evidence for all 57 locked MVP acceptance criteria;
3. `sample-data.md` — the consistent content dataset, all exercise/load modes, chart series, long labels, and edge cases;
4. `wireframes.md` — annotated low-fidelity hierarchy and interaction intent for all 24 screens and shared overlays.

First audit that all four files are present and readable. Do not silently omit a screen, state, criterion, data variant, or wireframe. Route labels are stable handoff references, not permission to alter behavior.

## Product boundary and user

This is a private, single-user, phone-only web app for recording planned and one-time gym workouts, set-level performance, exercise progress, body weight, and arbitrary body measurements. The Local MVP has no account or login. Nutrition and calorie tracking are explicitly out of scope. Do not add social, coaching, gamification, calorie, meal, export, PWA-install, estimated-1RM, RIR/RPE, rest-timer, warm-up-set, or desktop features.

The user needs fast, reliable entry during a workout, clear automatic-persistence feedback, and trustworthy historical progress. Dense gym data must remain legible and operable with one hand where practical.

## Navigation and ownership

Outside an active workout, bottom navigation exposes exactly four destinations: **Today**, **History**, **Programs**, and **Exercises**.

- Today owns the proposed workout, start choices, and conditional today-weight prompt.
- History owns five subsections: Workouts, Exercises, Splits, Weight, and Body.
- Programs owns mutable program/split templates and rotation.
- Exercises owns reusable exercise definitions, not performance statistics.
- Active workout and finish review use a focused shell with no bottom navigation.

Do not move exercise statistics into the Exercise Library or split statistics into Programs.

## Immutable behavior

- At most one program is active and at most one workout is active or paused.
- Starting a workout creates workout-owned snapshots. Later definition/template edits never rewrite saved or active workout snapshots.
- Active-workout changes auto-save; valid set confirmation persists immediately. Reload/reopen restores order, entered and confirmed sets, notes, timer state, and accumulated active duration.
- Each set independently uses one permitted load mode and shows only applicable fields. Decimal kg values are allowed; reps and split prescription counts are positive integers.
- Bands preserve direction (`resistance` or `assistance`) separately from strength (`light`, `medium`, or `strong`). Never convert bands to kilograms or merge unlike categories.
- Exercise persistent notes are read-only snapshots in workouts. A workout-specific exercise note is editable, auto-saved, historical, and not copied forward.
- Workout-local exercise/set changes never mutate the source split. Removing populated workout data requires confirmation.
- The active-duration timer excludes time paused via **Continue Later**.
- Only confirmed sets in completed workouts feed exercise PRs/charts. Only completed split workouts feed split-duration statistics. Incomplete workouts feed neither. One-time workouts feed exercise but not split statistics.
- Completing the split proposed by active rotation advances rotation. A Today-only alternate split and one-time workout never advance it. Starting, saving incomplete, discarding, editing/deleting History, or marking an incomplete History workout completed later never advances or rewinds it.
- **Set as Next** persistently changes rotation and must be clearly distinct from **Choose Another Split**, which is for one workout only.
- Historical correction/deletion recalculates derived outputs and Last time without changing templates or rotation.
- Archiving preserves identity/history. Archived items cannot be selected for new work until reactivated. The last active split cannot be archived.
- Weight has at most one decimal-kg entry per local date. Measurement entries have at most one decimal-cm value per measurement type/date. Retrospective dates are allowed; future and duplicate dates are rejected.
- Weeks are local Monday–Sunday. Weight weekly averages divide by recorded days, display `n/7`, and are provisional until Sunday. Missing prior-week data is unavailable, not zero.
- Measurement increases/decreases are not inherently good or bad.

## Visual direction and fixed references

- Visible UI language: English.
- Product-name treatment: `Pump Fiction` as replaceable text only. Do not design a logo or make the name structurally difficult to replace.
- Direction: dark-first, focused, athletic, calm, and data-legible. Avoid a game HUD, neon overload, aggressive “bro” styling, ornamental texture that competes with inputs, and generic enterprise-dashboard aesthetics.
- Accessibility target: WCAG 2.2 AA. Use visible focus, practical `44 × 44` CSS-pixel minimum targets, labelled controls, logical focus order, non-color state cues, reduced-motion behavior, and readable contrast/type at both references.
- Fixed reference A: `390 × 844` CSS pixels at `3x`, Mobile Safari/WebKit.
- Fixed reference B: `360 × 800` CSS pixels at `3x`, Mobile Chrome/Chromium.
- Reflow must remain faithful and fully operable from `320` through `430` CSS pixels. Do not create a desktop layout.
- Account for safe-area insets, browser chrome, sticky regions, scrolling boundaries, and keyboard-open numeric-entry states.
- At handoff, freeze and record the exact stable browser-engine versions used for reference capture, exact fonts, theme, content, state, viewport, and pixel ratio.

## Interaction rules

- Put primary actions within practical thumb reach; use sticky actions only when they do not obscure content or focused inputs.
- Request appropriate decimal or integer numeric keyboards.
- Never require horizontal scrolling for tables, forms, chips, tabs, set rows, or charts. Stack/reflow dense set entry at narrow widths.
- Make the current workout set visually distinct through more than color.
- Every reorderable list has a visible drag handle plus an accessible non-drag equivalent. Reordering auto-saves and shows persistence feedback.
- Short contextual choices may use bottom sheets. Destructive actions use labelled confirmation dialogs with the safe action as the default focus. Restore focus to the trigger.
- Provide explicit loading, empty, validation error, saving, saved, save-failure/retry, destructive confirmation, archived, incomplete, and restored-workout states wherever the manifest marks them.
- Loading skeletons preserve structure and never display fake zero values. Empty states explain the next valid action. Failure never implies persistence. Success feedback must not interrupt continued workout entry.
- Truncate only when wrapping would make the layout unusable; preserve full identity through wrapping or an accessible expansion. Use the supplied stress labels at `320 px`.

## Charts and progress semantics

Design phone-responsive charts for exercise progress, split duration, Weight, and Body. Every chart must have a textual summary and accessible data/list alternative. Interaction cannot depend on hover. Specify axes, units, domains, series, legends, point selection/tooltip behavior, empty/loading states, range changes, and reduced motion.

- Exercise metrics vary by type and may include weight, reps, volume/total reps, assistance, and band category.
- Keep no-band and each band direction/strength category distinct.
- For kilogram assistance, lower is progress; communicate that explicitly without falsifying the numeric axis.
- Weight combines daily values and weekly averages with non-color series differentiation.
- Body change direction is semantically neutral.

## Required component system

Create an application-owned mobile component family suitable for later implementation with semantic HTML, Tailwind CSS 4, selective unstyled Radix primitives for complex accessible overlays, and Recharts 3 behind application-owned chart components. Do not apply a third-party visual theme or depend on generated code as production source.

At minimum cover:

- app/focused shells, top bars, safe-area and sticky-action containers;
- bottom navigation and History subsection navigation;
- buttons, icon buttons, links, segmented controls, tabs, chips, badges, status banners, toast/live feedback;
- text, search, date, integer, decimal, textarea, select/radio/checkbox, mode selector, and validation patterns;
- list rows, cards, summary/stat cards, empty/skeleton/error states;
- exercise card, set row for every load mode, Last time block, persistent note, workout-specific note;
- drag handle/reorder state and accessible move controls;
- bottom sheet, dialog/alert dialog, menu, destructive confirmation;
- chart frame, axes/legend/tooltip/data-list, metric/range selectors;
- archived, incomplete, restored, saving/saved/failure, active/current, disabled, pressed, selected, focus-visible, and reduced-motion variants.

Define tokens for color, typography, spacing, sizing, grid, radii, borders, shadows/elevation, opacity, iconography, and motion. Use licensed, implementation-ready assets only. Prefer SVG for vectors. Do not use a paid font or asset without separate Owner approval; provide font files or acquisition/licensing details.

## Prioritized prototype flows

Prototype these end to end at both fixed reference sizes:

1. proposed split from Today through active workout, mixed set modes, finish review, completion, History, and advanced next split;
2. pause with **Continue Later**, close/reopen, restored paused workout, resume, edit, save failure/retry, and completion;
3. Today-only alternate split showing unchanged rotation;
4. named one-time workout showing exercise-stat inclusion and split-stat/rotation exclusion;
5. create/edit/archive/reactivate an exercise, including invalid mode/name and split-usage warning;
6. create draft program/split, validate prescription, reorder, activate with next split, **Set as Next**, and blocked last-active-split archive;
7. historical workout correction and deletion with recalculation messaging and no template/rotation change;
8. exercise/split/Weight/Body progress, range/metric switching, chart selection, empty range, and accessible list;
9. today and retrospective Weight entry plus user-defined Body type/entry lifecycle.

## Deliverables and handoff contract

Return one frozen, version-labelled package with:

1. editable design source or an inspectable shared design file with durable access;
2. a frame inventory mapping every frame to screen ID, route label, state, critical flow, and applicable MVP criterion IDs;
3. reference PNG for every accepted frame/state at both fixed viewports, with a deterministic filename convention;
4. machine-readable design tokens plus a readable token reference covering color, typography, spacing, sizing, radii, borders, shadows/elevation, opacity, iconography, and motion;
5. component inventory with anatomy, variants, interactive states, responsive rules within `320–430 px`, and reuse guidance;
6. exact measurements, constraints, grids, safe-area behavior, sticky/fixed behavior, scroll boundaries, and keyboard-open rules;
7. interaction annotations and a clickable prototype for every prioritized flow;
8. exact visible English copy, validation messages, truncation/wrapping rules, date/number/unit formatting, and icon accessible labels;
9. chart specifications for series, axes, domains, ranges, empty/loading/error states, tooltip/selection, accessible alternative, and progress semantics;
10. production assets in implementation-ready formats, SVG preferred for vectors, with raster density, font acquisition, and licensing notes;
11. accessibility annotations for contrast, type scaling expectations, focus order, names/labels, target sizes, reduced motion, and non-color cues;
12. known deviations, unresolved questions, implementation risks, and a changelog from any earlier reviewed version.

If your design tool exports code, include it only as reference material. It is not accepted application code. Do not introduce framework, database, authentication, deployment, or desktop decisions.

## Quality and response protocol

Before finalizing, audit the package against all 24 `S` screens, seven `O` overlays/feedback families, every state marked in the state matrix, all 57 criterion rows, both reference viewports, the `320–430 px` range, all load-mode examples, every chart family, and the prioritized flows.

Classify findings as:

- `missing` — required frame, state, asset, token, or annotation is absent;
- `ambiguous` — multiple materially different implementations remain possible;
- `conflicting` — a design choice would change an immutable behavior;
- `implementation risk` — the result may not be reproducible with the stated phone/web constraints.

Return findings and questions before making assumptions. A polished visual direction does not override product behavior or completeness.

---
