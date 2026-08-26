# T-003 mobile design brief package v1

- **Package status:** Draft for Task review
- **Prepared:** 2026-08-26
- **Owner:** User
- **Executor:** Codex primary agent
- **Task:** [`T-003`](../../project/tasks/T-003-prepare-mobile-design-agent-brief.md)

This versioned package is the complete outbound input for the external mobile UI/UX design phase. Repository product documents remain canonical for behavior. This package translates them into design inputs and must not be used to invent or change product rules.

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
