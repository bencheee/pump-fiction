# T-009 — Build mobile shell and shared UI foundation

- **Feature:** `F-004`
- **Status:** `Testing`
- **Horizon:** `Now`
- **Order:** 5
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-31T11:43:22+02:00`
- **Updated:** `2026-09-01T17:01:55+02:00`
- **Started:** `2026-09-01T09:18:25+02:00`
- **Review started:** `2026-09-01T16:05:41+02:00` for latest replacement
- **Approval requested:** `2026-09-01T17:01:55+02:00` for latest replacement
- **Approved:** `2026-09-01T17:01:55+02:00` for latest replacement
- **Testing started:** `2026-09-01T17:01:55+02:00` for latest replacement
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Complete the entire recorded test plan from the beginning against exact approved latest replacement `ded6f9f73e5952eafe645d07142ab456808783b9` and record the results.

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
- Results: Passed for the pending production-readiness replacement on 2026-09-01 with Node.js `24.20.0` and npm `11.19.0`: `npm run check` passed Prettier, ESLint and dependency boundaries, strict TypeScript, the Next.js production build across all shell and support routes, frozen asset/license verification for 8/8 font and 38/38 icon checksums, Markdown lint across 79 files, and all 546 internal links; `git diff --check` passed. The `/today` readiness correction was not behaviorally rerun after the prior approval was invalidated.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run `npm run test:components` for field accessibility wiring, sheet/dialog focus management, Escape, and focus restoration; then run `npm run test:browser -- tests/browser/mobile-ui-foundation.spec.ts` for the exact 390 × 844 and 360 × 800 shell geometry/captures, touch targets, horizontal overflow, focused-shell navigation exclusion, overlay Back dismissal, cancel-safe focus, Escape, and focus restoration. Review captures structurally under the frozen v0.3 reference exclusions; do not compare v0.4 colors or corrected cue areas to stale v0.3 pixels.
- **Authorized commit:** `ded6f9f73e5952eafe645d07142ab456808783b9`
- **Results:** Against exact then-approved original delivery `027b8fb4020f4f1353f38fb005d16d0391e959d8` on 2026-09-01, a clean `npm ci` installed 653 packages with no vulnerabilities; `npm run test:components` passed 4/4 tests across 2/2 files; the scoped Playwright run passed 8/8 automated Chromium/WebKit scenarios and repeated 8/8 with the HTML reporter. Structural review failed because the Next.js development indicator overlapped Today and Chromium inherited 2.75x instead of 3x. Against exact then-approved replacement `746985808e7e587b1aa4366d00b133f121d6cd73`, another clean `npm ci` installed 653 packages with no vulnerabilities and component tests passed 4/4, but zero browser scenarios started: Playwright timed out after 60 seconds because its readiness URL was the T-008 harness, which deliberately returns 404 in production. Direct diagnosis confirmed the production build and server become ready in seconds and `/today` returns normally. T-009 returned to `In Progress`; the readiness-URL correction requires another replacement and new approval before the full plan runs again. Vitest emitted its existing future config-loader warning, and Playwright emitted harmless color-environment warnings.

## Delivery commit

- **Delivery commit SHA:** `ded6f9f73e5952eafe645d07142ab456808783b9` (replaces `746985808e7e587b1aa4366d00b133f121d6cd73` and original `027b8fb4020f4f1353f38fb005d16d0391e959d8`)
- **Subject:** `T-009: correct production readiness`
- **Committed scope:** Preserve the original mobile shell/UI foundation and production/3x capture corrections while changing Playwright readiness from the production-hidden T-008 harness to `/today`, with synchronized canonical and lifecycle documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-01T17:01:55+02:00` for latest replacement
- **Outcome:** Recommended latest replacement for approval
- **Findings:** The first delivery used a development server and Chromium 2.75x captures. Replacement `746985808e7e587b1aa4366d00b133f121d6cd73` corrected those issues but retained the T-008 harness as Playwright's readiness URL; that route deliberately returns 404 in production, preventing every browser scenario from starting. Readiness must use `/today`.

## Approval

- **Approved commit:** `ded6f9f73e5952eafe645d07142ab456808783b9`
- **Approved by:** User
- **Approved at:** `2026-09-01T17:01:55+02:00`
- **Approval note:** User explicitly confirmed exact latest replacement `ded6f9f73e5952eafe645d07142ab456808783b9`, authorizing the complete recorded T-009 test plan from the beginning.

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
| `2026-09-01T09:39:10+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery commit `027b8fb4020f4f1353f38fb005d16d0391e959d8`; all planned static checks passed and prepared feature tests remain unexecuted |
| `2026-09-01T09:40:50+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `027b8fb4020f4f1353f38fb005d16d0391e959d8` with no findings and recommended approval |
| `2026-09-01T09:40:50+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact delivery and authorized only its recorded component and mobile-browser tests |
| `2026-09-01T09:42:09+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began only the recorded component and mobile-browser verification in an isolated worktree at exact approved delivery `027b8fb4020f4f1353f38fb005d16d0391e959d8` |
| `2026-09-01T09:45:35+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Component tests passed 4/4 and automated browser scenarios passed 8/8, but structural review found the Next.js development indicator in all four reference captures; approval is invalidated and production-server capture requires a replacement delivery |
| `2026-09-01T09:48:03+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Corrected visual test fidelity to build/start production, retain HTML-report attachments, require 3x in both projects, and assert the runtime device scale; all static checks passed without rerunning feature tests |
| `2026-09-01T09:48:54+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created replacement delivery `746985808e7e587b1aa4366d00b133f121d6cd73`; static checks passed and corrected feature tests remain unexecuted |
| `2026-09-01T09:54:46+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact replacement `746985808e7e587b1aa4366d00b133f121d6cd73` with no additional findings and recommended approval |
| `2026-09-01T09:54:46+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact replacement and authorized the complete recorded T-009 test plan from the beginning |
| `2026-09-01T09:55:52+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the complete recorded verification from the beginning in an isolated worktree at exact approved replacement `746985808e7e587b1aa4366d00b133f121d6cd73` |
| `2026-09-01T09:59:46+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Clean install and component tests 4/4 passed, but zero browser scenarios started because production readiness polled a T-008 harness that intentionally returns 404; approval is invalidated and `/today` readiness requires another replacement |
| `2026-09-01T16:04:54+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Changed Playwright readiness to the production `/today` route and passed all static checks without rerunning feature tests |
| `2026-09-01T16:05:41+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created latest replacement `ded6f9f73e5952eafe645d07142ab456808783b9`; static checks passed and corrected feature tests remain unexecuted |
| `2026-09-01T17:01:55+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact latest replacement `ded6f9f73e5952eafe645d07142ab456808783b9` with no additional findings and recommended approval |
| `2026-09-01T17:01:55+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed the exact latest replacement and authorized the complete recorded T-009 test plan from the beginning |
| `2026-09-01T17:01:55+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began the complete recorded verification from the beginning in an isolated worktree at exact approved latest replacement `ded6f9f73e5952eafe645d07142ab456808783b9` |
