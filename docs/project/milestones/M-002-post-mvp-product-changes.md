# M-002 — Post-MVP Product Changes

- **Owner:** User
- **Horizon:** `Next`
- **Order:** 2
- **Target date:** None
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T22:40:00+02:00`
- **Progress:** `1/1 required Features Done`
- **Blocked children:** `0`
- **Awaiting approval children:** `0`

## Outcome

Accepted changes to the product the Local MVP delivered, each revising the locked criteria explicitly rather than drifting from them.

## Scope

- Included: product changes the Owner accepts after `M-001`, their criteria revisions, their ADRs, and their verification.
- Excluded: production deployment and access protection, and every capability the release boundary classifies as post-MVP without a separate decision — export/backup, PWA installation, and protection against closing an active workout.

## Why this is not part of `M-001`

`M-001` delivers an application that satisfies 57 locked criteria, and its completion is measured against them. The first Feature here **revises** three of those criteria. Folding that into `M-001` would move the target while the Milestone is being measured against it, and would reopen Features that are `Done` and verified. `M-001` closes on what it delivered; changes to what it delivered belong here.

## Completion criteria

- [x] All required Features are `Done`
- [x] Every criterion this Milestone revises is revised by an explicit Owner decision, in the same Task that delivers its change: `T-051` carried all six, ahead of the Tasks that built against them
- [x] Canonical product, architecture, and project documentation is current
- [x] No required implementation or verification work remains hidden
- [x] User confirms the result on `2026-09-06T22:40:00+02:00`

## Features

- [`F-015`](../features/F-015-body-destination-and-today-entry.md) — Body Destination and Today Entry (`Done`)

## Dependencies and blockers

- Dependencies: `M-001` complete, so the criteria being revised are known to be satisfied before they change
- Blockers: None; `M-001` is `Done`

## Related decisions and documents

- ADRs: [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0008](../../decisions/0008-milestone-feature-task-hierarchy.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../mvp-release-verification.md`](../mvp-release-verification.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Completion criteria are observable
- [x] Required Feature breakdown is identified; `F-015` was the first and only
- [x] Dependencies and blockers are understood
- [x] Owner confirmed readiness and the result on `2026-09-06`

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | Created in `Next` with `F-015` | The Owner asked for a Body destination that revises three locked criteria and one accepted ADR; that cannot land inside the Milestone those criteria measure |
| `2026-09-06T22:40:00+02:00` | User / Owner | Completed `M-002` | Confirmed the `F-015` result as delivered; weight and body have their own destination, entry lives on Today, and the six criteria the change touched were revised by decision rather than outgrown |
