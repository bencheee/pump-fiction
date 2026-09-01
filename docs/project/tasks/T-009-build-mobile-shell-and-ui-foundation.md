# T-009 — Build mobile shell and shared UI foundation

- **Feature:** `F-004`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 5
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-09-01T09:37:39+02:00`
- **Started:** `2026-09-01T09:18:25+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Create the delivery commit after the completed implementation and static-only verification; do not run prepared feature tests.

## Scope

Implement the application-owned v0.4 design tokens, local fonts/icons, normal and focused phone shells, route/not-found conventions, safe-area behavior, transient overlay/history behavior, and only the shared primitives demonstrated across later feature screens.

## Out of scope

- Complete product-feature screens and domain behavior
- Desktop/tablet layouts, final product naming, or new design choices
- Feature tests before exact-commit approval

## Acceptance criteria

- [x] Tokens, fonts, icons, and shared primitives follow the accepted v0.4 source hierarchy and licensing manifest.
- [x] Main four-destination and focused-workout shells obey phone-only, safe-area, focus, touch-target, and reduced-motion rules.
- [x] Routes use opaque UUID parameters, no trailing slash, and the shared not-found boundary; transient overlays dismiss before parent navigation.
- [x] Shared UI lives under `src/shared/ui` only where reuse is demonstrated and wraps any adopted Radix primitive.

## Traceability

- MVP criteria: foundational support for `MVP-UX-001`–`003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-004` Done; `T-005` Done
- Blockers: None; `T-004` and `T-005` are complete
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: shared UI/token usage and asset guidance, this Task, and project projections
- Documentation that should remain unchanged: feature behavior and post-MVP layouts

## Execution checklist

- [x] Install the frozen assets and translate v0.4 tokens into application-owned CSS variables/Tailwind theme.
- [x] Build safe-area-aware main and focused shells plus shared not-found handling.
- [x] Implement transient overlay/history behavior and demonstrated shared primitives.
- [x] Prepare visual/accessibility tests without executing before approval.

## Static-check plan and results

- Planned checks: formatting, ESLint, strict TypeScript, production build, asset/license inventory, documentation links, `git diff --check`
- Results: Passed on 2026-09-01 with Node.js `24.20.0` and npm `11.19.0`: `npm run check` passed Prettier, ESLint and dependency boundaries, strict TypeScript, the Next.js production build across all shell and support routes, frozen asset/license verification for 8/8 font and 38/38 icon checksums, Markdown lint across 79 files, and all 546 internal links; `git diff --check` passed. No feature test or manual application validation ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run `npm run test:components` for field accessibility wiring, sheet/dialog focus management, Escape, and focus restoration; then run `npm run test:browser -- tests/browser/mobile-ui-foundation.spec.ts` for the exact 390 × 844 and 360 × 800 shell geometry/captures, touch targets, horizontal overflow, focused-shell navigation exclusion, overlay Back dismissal, cancel-safe focus, Escape, and focus restoration. Review captures structurally under the frozen v0.3 reference exclusions; do not compare v0.4 colors or corrected cue areas to stale v0.3 pixels.
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
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and unexecuted test plan are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready`

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
| `2026-09-01T09:18:25+02:00` | User / Owner | `Backlog` | `Ready` | Explicit direction to start `T-009`; completed dependencies and the frozen v0.4 handoff satisfy readiness |
| `2026-09-01T09:18:25+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the accepted mobile shell and shared UI foundation scope |
| `2026-09-01T09:37:39+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed frozen assets/tokens, main and focused shells, route/not-found and overlay-history foundations, demonstrated shared primitives, canonical guidance, unexecuted UI tests, and all planned static checks |
