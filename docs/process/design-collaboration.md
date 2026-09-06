# External UI/UX design collaboration

- **Status:** Accepted process; individual visual choices remain unaccepted until their design handoff is approved.

This process implements [ADR-0022](../decisions/0022-versioned-external-design-handoff.md). It lets a specialized external design agent produce the mobile UI/UX without making that agent an independent source of product truth. Repository specifications define behavior; the accepted design source package defines visual intent.

## Position in delivery

1. **Design brief preparation:** Codex derives an outbound prompt and reference wireframes from accepted product, UX, architecture, and MVP criteria.
2. **Owner brief approval:** the user reviews the exact prompt and resolves or explicitly leaves open every design-blocking choice.
3. **External design:** the specialized agent creates the editable visual design and annotations without changing product behavior.
4. **Handoff request:** Codex provides a separate, exact prompt that asks the design agent to return the complete package defined below.
5. **Handoff acceptance:** Codex audits completeness and specification consistency; the user accepts the frozen design version. Conflicts become explicit questions, never silent product changes.
6. **Implementation:** UI Tasks reference the accepted design version and canonical behavior documents. Later design changes require versioned handoff updates and corresponding implementation/documentation work.

No user-facing UI implementation should begin before the relevant design frames and states are accepted. Non-visual foundation work may proceed only through its own ready Task and must not invent visual choices.

## Outbound design brief

The brief Task must produce a self-contained prompt that gives the design agent enough context without copying the entire repository. It must include or link to:

- product boundary, target user, phone-only constraint, and explicit exclusions;
- navigation model and complete screen/route inventory;
- prioritized end-to-end flows and a criteria-to-screen map;
- annotated low-fidelity wireframes for every required screen;
- all required states: initial, populated, empty, loading, validation error, save in progress, saved, save failure, destructive confirmation, incomplete, and restored active workout where applicable. [ADR-0024](../decisions/0024-deletion-with-preserved-history.md) removed the archived state this list once carried;
- realistic sample data for every exercise/load mode, charts, long labels, and edge cases;
- interaction rules for keyboard behavior, scrolling, sticky elements, bottom sheets/dialogs, reorder controls, focus, touch targets, safe areas, and active-workout persistence feedback;
- expected component families, variants, and design-token categories;
- the required handoff contract below, so the designer knows the eventual return format before beginning;
- agreed reference viewport matrix, theme, UI language, product-name treatment, accessibility target, asset constraints, and browser/platform references;
- immutable product rules the designer must not reinterpret;
- explicit open questions and a rule to return conflicts rather than guess.

The exact outbound prompt is a versioned repository artifact created during the design-brief Task, not an informal chat-only instruction.

The outbound package sent to the design agent is [`../design/T-003-v1/README.md`](../design/T-003-v1/README.md), approved in the `T-003` delivery on 2026-08-26. It is kept as sent and never rewritten; its README lists the accepted decisions that have since moved past it.

## Required handoff package

The later handoff prompt must request one frozen, version-labelled package with:

- the editable design source, or an inspectable shared design file with durable access;
- a frame inventory mapping every screen and state to routes, flows, and applicable MVP criteria;
- reference images for every accepted frame at each agreed reference viewport;
- machine-readable design tokens plus a readable token reference for color, typography, spacing, sizing, radii, borders, shadows, elevation, opacity, and motion;
- a component inventory with anatomy, variants, interactive states, responsive rules within the phone range, and reuse guidance;
- exact measurements, layout constraints, grids, safe-area behavior, fixed/sticky behavior, and scroll boundaries;
- interaction annotations and a clickable prototype for critical flows;
- exact visible copy, validation messages, truncation/wrapping rules, number/date/unit formatting, and icon labels;
- chart specifications including series, axes, domains, empty/loading states, tooltips, selection behavior, and semantic treatment of improvement;
- production assets in implementation-ready formats, with SVG preferred for vectors, raster density requirements, font files or acquisition details, and usage/licensing notes;
- accessibility annotations covering contrast, type scaling expectations, focus order, labels, touch targets, reduced motion, and non-color state cues;
- known deviations, unresolved questions, and a changelog from any earlier reviewed version.

If the design tool exports code, that code is reference material unless an implementation Task explicitly accepts it. Visual design cannot override canonical product behavior.

## Handoff audit and acceptance

Codex checks the returned package for completeness, internal consistency, implementability in the accepted stack, and conflicts with canonical behavior. Findings are classified as:

- **missing:** required frame, state, asset, token, or annotation is absent;
- **ambiguous:** multiple implementations could reasonably result;
- **conflicting:** the design changes accepted behavior or architecture;
- **implementation risk:** the design cannot be reproduced reliably with the accepted stack or phone/browser constraints.

The user accepts an exact frozen design version after findings are resolved. The repository records its identity, retrieval location, reference viewport matrix, asset inventory, and accepted exceptions. Large editable binaries may remain in the design tool or an agreed asset store; the repository retains compact manifests, prompts, annotations, and reference exports needed for durable traceability.

## Fidelity contract

“Pixel-for-pixel” means objective comparison against accepted reference images at the exact reference viewport, device-pixel ratio, font files, browser engine/version, theme, content, and state. The implementation should target zero unexplained visual differences at those references.

An absolute identical rendering across every phone, operating system, browser, font rasterizer, dynamic text setting, and content length is not technically guaranteeable. Outside the fixed references, acceptance therefore means faithful token/component behavior, correct reflow within the agreed phone-width range, and no functional or accessibility regression.

Visual comparison is a feature test. It may be planned and its reference images prepared earlier, but it must not run until the user approves the exact implementation delivery commit under the project test gate.

## Context discipline

Design source files, exported frames, and the full design brief are task-specific context. A new agent session loads them only for design or UI implementation/review work. The documentation index, dashboard, active Task, and compact handoff manifest route to the exact required artifacts; Task files link to canonical requirements instead of reproducing them.
