# F-003 — Mobile UI/UX Design Package

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-25T16:35:55+02:00`
- **Progress:** `0/2 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

An accepted, versioned, implementation-ready phone UI/UX design package covers every Local MVP screen, state, flow, component, and reference viewport.

## Scope

- Included: outbound design-agent brief, annotated wireframes, external design, structured handoff, consistency audit, frozen references, tokens, components, interactions, assets, and accessibility annotations.
- Excluded: product behavior changes, application implementation, desktop design, and feature testing.

## Acceptance criteria

- The approved outbound brief is traceable to all MVP criteria and canonical UX behavior.
- The returned package satisfies [`../../process/design-collaboration.md`](../../process/design-collaboration.md) with no unresolved design-blocking ambiguity or silent specification conflict.
- The user accepts an exact frozen design version and reference viewport matrix for implementation.

## Tasks

- [`T-003`](../tasks/T-003-prepare-mobile-design-agent-brief.md) — Prepare mobile design-agent brief and wireframes
- [`T-004`](../tasks/T-004-audit-and-accept-design-handoff.md) — Request, audit, and accept design handoff

## Dependencies and blockers

- Dependencies: completed `T-002`; accepted product specification and technical UI constraints
- Blockers: external design work begins only after Owner approval of the `T-003` brief

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../process/design-collaboration.md`](../../process/design-collaboration.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [ ] Required Tasks are identified; the first executable work is `Ready`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [ ] Owner confirms readiness

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Make specialized external design and structured return a formal pre-implementation phase |
