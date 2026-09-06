# T-003 mobile design brief package v1

- **Package status:** Delivered and superseded — this is the historical record of what was sent to the external design agent on 2026-08-26, kept as sent
- **Prepared:** 2026-08-26
- **Owner:** User
- **Executor:** Codex primary agent
- **Task:** [`T-003`](../../project/tasks/T-003-prepare-mobile-design-agent-brief.md)

This versioned package was the complete outbound input for the external mobile UI/UX design phase. Repository product documents remain canonical for behavior. This package translates them into design inputs and must not be used to invent or change product rules.

## Superseded by later accepted decisions

`T-003` delivered this package on 2026-08-26 and the Owner approved it. Accepted decisions have since moved past parts of it. It is **not** rewritten: a brief is a record of what was sent, and editing it would falsify what the design agent was actually asked for. Read it as of its date, and read the following as no longer true anywhere in it:

| No longer true | Accepted instead | Decision |
| --- | --- | --- |
| Archiving and reactivation of exercises, programs, splits, and measurement types, and every archived state, badge, filter, and `O05` overlay built on them | Deletion is permanent and immediate; History keeps its snapshots | [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md) |
| A set is confirmed, and only confirmed sets count | A set is recorded once it holds everything its mode requires; nothing confirms it | [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) |
| The active workout uses a focused shell with no bottom navigation | One shell owns every route and the four destinations stay reachable throughout a workout | [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md) |
| Four exercise types, with assistance as its own type, and a per-set mode chooser (`O02`) | Two types, `weights` and `bodyweight`, with assistance as a bodyweight addition; a set's mode is derived from the definition and no set offers a menu | [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md), [ADR-0026](../../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md) |
| Reordering through a drag handle | A named move-up and move-down control on every row | Owner decision of 2026-09-06, recorded by [`T-050`](../../project/tasks/T-050-correct-the-reorder-and-current-set-language.md) |
| Weight and Body as History subsections, with entry on their own screens | A Body destination that reads and corrects; today's values are entered on Today | [ADR-0030](../../decisions/0030-body-is-its-own-destination.md) |

The audited return package, [`T-004-v0.4-frozen`](../T-004-v0.4-frozen/README.md), carries the same historical status and the same supersessions; its reference images still depict 19 frames of removed states, which its own manifest and this table together explain.

## Artifact inventory

| Artifact | Purpose |
| --- | --- |
| [`outbound-prompt.md`](outbound-prompt.md) | Exact prompt to send to the external design agent with the other files attached |
| [`screen-state-manifest.md`](screen-state-manifest.md) | Complete route, screen, overlay, state, and critical-flow inventory |
| [`criteria-to-screen-map.md`](criteria-to-screen-map.md) | One-to-many design trace from all 57 locked MVP criteria to screen IDs |
| [`sample-data.md`](sample-data.md) | Consistent realistic content covering load modes, charts, long labels, and edge cases |
| [`wireframes.md`](wireframes.md) | Annotated low-fidelity mobile wireframes for every manifest screen |

## Frozen brief inputs

- UI language: English.
- Working-name treatment: replaceable text `Pump Fiction`; no logo design and no final naming decision.
- Direction: dark-first, focused, athletic, calm rather than game-like.
- Accessibility: WCAG 2.2 AA; visible focus; non-color cues; reduced motion; practical touch targets.
- Reference viewports: `390 × 844 @3x` Mobile Safari/WebKit and `360 × 800 @3x` Mobile Chrome/Chromium.
- Reflow range: `320–430` CSS pixels; no desktop layout.
- Assets: licensed and implementation-ready; SVG preferred; no paid font or asset without separate approval.
- Tool capability: editable source, clickable prototype, PNG references, SVG assets, and machine-readable tokens. Figma is acceptable but not mandatory.
- The returned handoff freezes and records exact stable browser-engine versions, fonts, content, theme, viewport, and state for every fixed reference.

## Immutable product boundaries

- Private, local-MVP, single-user, phone-only app with no account or login.
- Exactly four normal-shell destinations: Today, History, Programs, Exercises.
- Active workout uses a focused shell with no bottom navigation.
- Nutrition and calorie tracking are absent.
- One active or paused workout is restored reliably; relevant changes auto-save.
- Definitions/templates never rewrite saved workout snapshots.
- History owns workouts, exercise statistics, split statistics, Weight, and Body.
- Only confirmed sets in completed workouts contribute to exercise statistics; only completed split workouts contribute to split statistics.
- Rotation changes only under the accepted proposed-split completion and explicit **Set as Next** rules.
- Bands retain direction and strength and are never converted to kilograms.

## Known open question

The final application name remains open. The external designer must retain the replaceable text treatment and must return any behavior conflict or design-blocking ambiguity as a question rather than guessing.
