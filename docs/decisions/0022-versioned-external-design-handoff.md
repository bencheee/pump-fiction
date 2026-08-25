# ADR-0022: Versioned external design brief and handoff

- **Status:** Accepted

## Context

The Local MVP needs a deliberate phone-only UI/UX design before user-facing implementation. A specialized external design agent will create that design, while Codex will prepare its instructions and later implement the accepted result in this repository.

Chat instructions, screenshots alone, or an editable design file without states and implementation annotations would leave behavior and visual intent ambiguous. Conversely, allowing an external design to become an independent product specification could silently change accepted behavior. High-fidelity implementation also needs objective reference conditions rather than an undefined promise across every device and rendering engine.

## Decision

Use a two-Task, versioned external-design exchange before user-facing UI implementation:

1. a design-brief Task produces an exact Owner-approved prompt, criteria-to-screen map, realistic data, and annotated wireframes from canonical repository specifications;
2. a handoff Task produces an exact return prompt, audits the external result, resolves discrepancies, and records the exact frozen design version accepted by the Owner.

The repository remains canonical for product behavior and architecture. The accepted frozen design package becomes canonical only for visual and interaction intent where it does not conflict with those sources. Conflicts and missing decisions are returned as explicit questions; neither Codex nor the design agent may silently choose a different behavior.

The handoff must include editable or inspectable design source, complete screen/state and component inventories, exact copy and interaction annotations, machine-readable tokens, implementation-ready assets, accessibility notes, chart behavior, fixed reference images, and a compact repository manifest. Large source binaries may live outside Git when their stable access and exact version identity are recorded.

Visual fidelity is evaluated against accepted fixed references with specified viewport, pixel ratio, browser engine/version, fonts, theme, content, and state. Outside those references, fidelity means correct design-system behavior and reflow throughout the accepted phone range. Visual comparison is a feature test and remains prohibited until the user approves the exact UI implementation delivery commit.

The detailed artifact contract and lifecycle are canonical in [`../process/design-collaboration.md`](../process/design-collaboration.md).

## Consequences

- The external agent receives precise context without needing the whole repository or inventing product rules.
- Implementation has measurable visual targets, reusable tokens/components, and complete state coverage instead of relying on screenshots alone.
- A literal identical rendering can be required at controlled references, while unavoidable browser, font, device, dynamic-text, and content differences remain explicitly bounded elsewhere.
- Design changes after acceptance require a new versioned handoff and corresponding documentation/implementation scope.
- The process adds two approval points before UI implementation but reduces ambiguity and rework.

## Related documents

- [`../process/design-collaboration.md`](../process/design-collaboration.md)
- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../ux/wireframe-decisions.md`](../ux/wireframe-decisions.md)
- [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md)
- [`../project/features/F-003-mobile-ui-ux-design-package.md`](../project/features/F-003-mobile-ui-ux-design-package.md)
- [`../project/tasks/T-002-define-mvp-delivery-and-design-workflow.md`](../project/tasks/T-002-define-mvp-delivery-and-design-workflow.md)
- [`0020-mobile-ui-charting-and-quality-tooling.md`](0020-mobile-ui-charting-and-quality-tooling.md)
