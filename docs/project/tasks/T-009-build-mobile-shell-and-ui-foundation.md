# T-009 — Build mobile shell and shared UI foundation

- **Feature:** `F-004`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 5
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-08-31T11:43:22+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for `T-005`; refine exact primitive scope from the accepted v0.4 manifest before readiness.

## Scope

Implement the application-owned v0.4 design tokens, local fonts/icons, normal and focused phone shells, route/not-found conventions, safe-area behavior, transient overlay/history behavior, and only the shared primitives demonstrated across later feature screens.

## Out of scope

- Complete product-feature screens and domain behavior
- Desktop/tablet layouts, final product naming, or new design choices
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] Tokens, fonts, icons, and shared primitives follow the accepted v0.4 source hierarchy and licensing manifest.
- [ ] Main four-destination and focused-workout shells obey phone-only, safe-area, focus, touch-target, and reduced-motion rules.
- [ ] Routes use opaque UUID parameters, no trailing slash, and the shared not-found boundary; transient overlays dismiss before parent navigation.
- [ ] Shared UI lives under `src/shared/ui` only where reuse is demonstrated and wraps any adopted Radix primitive.

## Traceability

- MVP criteria: foundational support for `MVP-UX-001`–`003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-004` Done; `T-005` Done
- Blockers: Dependencies not complete
- Blocked from status: Not blocked; remains planned in `Backlog`

## Documentation impact

- Documents to create or update: shared UI/token usage and asset guidance, this Task, and project projections
- Documentation that should remain unchanged: feature behavior and post-MVP layouts

## Execution checklist

- [ ] Install the frozen assets and translate v0.4 tokens into application-owned CSS variables/Tailwind theme.
- [ ] Build safe-area-aware main and focused shells plus shared not-found handling.
- [ ] Implement transient overlay/history behavior and demonstrated shared primitives.
- [ ] Prepare visual/accessibility tests without executing before approval.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, asset/license inventory, documentation links, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run component interaction/accessibility tests and phone-viewport Playwright visual checks using the accepted structural-reference exclusions.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-009: build mobile shell and UI foundation`
- **Committed scope:** Not created

## Review

- **Reviewer:** User
- **Reviewed at:** Not reviewed
- **Outcome:** Not reviewed
- **Findings:** None recorded

## Approval

- **Approved commit:** Not approved
- **Approved by:** Not approved
- **Approved at:** Not approved
- **Approval note:** Not approved

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [ ] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [ ] Owner confirms transition to `Ready`

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Authorized feature tests passed
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-08-31T11:43:22+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Deliver the accepted mobile visual foundation before feature screens |
