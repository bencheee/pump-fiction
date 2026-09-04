# T-015 — Build Today and workout-start mobile experience

- **Feature:** `F-007`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 3
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-03T12:03:59+02:00`
- **Updated:** `2026-09-04T14:15:48+02:00`
- **Started:** `2026-09-04T12:48:59+02:00`
- **Review started:** `2026-09-04T12:59:57+02:00`
- **Approval requested:** `2026-09-04T14:13:57+02:00`
- **Approved:** `2026-09-04T14:13:57+02:00`
- **Testing started:** `2026-09-04T14:13:57+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Correct the test-only duplicate-validation assertion, run static checks without feature tests, create a replacement delivery, and request fresh approval.

## Scope

Implement phone-only S01 Today, S02 alternate-split sheet, and S03 one-time-workout builder, including proposed-workout content, optional historical average, current-workout restore treatment, no-program state, today-only rotation messaging, active-exercise selection/order, validation, start actions, and accepted visual/accessibility fidelity.

## Out of scope

- Today's weight entry prompt/sheet, owned by `F-009`
- Active-workout editing and finish review, owned by `T-016`
- History presentation/statistics and desktop or unagreed behavior

## Acceptance criteria

- [x] S01 shows local date, proposed split and optional eligible average, or the accepted no-program state, while retaining the one-time entry point.
- [x] A current workout replaces second-start actions with a restore card and accurate timer-state treatment.
- [x] S02 starts another active split for this workout only and distinguishes the choice from persistent Set Next.
- [x] S03 requires a valid arbitrary name and at least one ordered active exercise, with add/remove/reorder and inline validation.
- [x] Start failures retain input and expose retry/not-found feedback; successful starts enter the focused route.
- [x] S01–S03 match accepted structure, states, phone reflow, overlay history, thumb reach, and accessibility behavior.

## Traceability

- MVP criteria: `MVP-TOD-001`–`003`; supporting `MVP-WRK-001`, `MVP-WRK-005`, `MVP-REL-001`–`004`, `MVP-UX-001`–`003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-014` Done; `T-017` Done
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: Today UI guidance if needed, Task/Feature/registry/dashboard/milestone/project-state projections
- Documentation that should remain unchanged: weight/body, active-workout detail, History, desktop/post-MVP, and deferred production choices

## Execution checklist

- [x] Implement S01 proposed/no-program/restored states and loading treatment.
- [x] Implement S02 alternate-split sheet and S03 one-time builder with ordering and validation.
- [x] Wire adapters, retry/not-found behavior, accessible overlays, and focused-route entry.
- [x] Prepare component and Chromium/WebKit tests without running them; run only static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency/accessibility rules, strict TypeScript, production build, design assets/references, documentation links, and `git diff --check`
- Results: Passed on 2026-09-04 with Node.js `24.20.0` and npm `11.19.0`: formatting, ESLint, and strict TypeScript passed; the Next.js `16.3.3` production build compiled all 18 routes including dynamic `/today` and `/today/one-time`; all 8 font and 38 icon checksums plus license files passed; Markdown lint passed across 87 files; all 648 internal links passed; and `git diff --check` passed. No feature test or manual application test ran.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run scoped component and isolated Chromium/WebKit phone-browser scenarios for proposed/alternate/one-time starts, no-program/restored states, validation, ordering, failure handling, overlay Back, reflow, and structural captures.
- **Authorized commit:** None; approval of `c3c9f33795757d455029746ccefe1fec52f071f6` was invalidated by the failed prepared assertion.
- **Results:** Against the formerly approved original delivery `c3c9f33795757d455029746ccefe1fec52f071f6`, a fresh isolated `npm ci` installed and audited 653 packages with no vulnerabilities. The component run passed 2/3 scenarios, then the one-time scenario failed before its interaction steps because the test used a singular text query for a validation message intentionally rendered both inline and in the sticky status cue. Browser verification did not run. These partial results are discarded for completion; the corrected replacement requires fresh approval and a complete restart.

## Delivery commit

- **Delivery commit SHA:** `c3c9f33795757d455029746ccefe1fec52f071f6` (original; test-only replacement required)
- **Subject:** `T-015: build Today workout-start experience`
- **Committed scope:** Phone-only S01 Today proposed/no-program/restored/loading states; S02 history-backed alternate-split sheet with today-only selection/start and distinct persistent Set Next; S03 active-exercise one-time builder with add/remove/up/down ordering and retained validation/failure input; focused-route start entry; canonical UI guidance; and prepared, unexecuted component plus isolated Chromium/WebKit coverage.

## Review

- **Reviewer:** User
- **Reviewed at:** Pending for replacement
- **Outcome:** Original approval invalidated; replacement pending
- **Findings:** Prepared component assertion incorrectly assumed the mirrored validation message had only one rendered occurrence.

## Approval

- **Approved commit:** Pending replacement
- **Approved by:** Pending
- **Approved at:** Pending
- **Approval note:** Original approval was invalidated when its prepared component suite failed; no corrected test may run before a replacement is explicitly approved.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
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
| `2026-09-03T12:03:59+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Created as the dependent Today and workout-start mobile delivery within `F-007` |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Planner | `Backlog` | `Backlog` | Added required dependency on T-017 after detecting that accepted OD-001 starter-set behavior was omitted from T-014 |
| `2026-09-04T12:48:59+02:00` | User / Owner | `Backlog` | `Ready` | T-014 and T-017 are complete; prior explicit direction to continue authorizes dependent T-015 |
| `2026-09-04T12:48:59+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began accepted S01–S03 phone implementation and workout-start wiring |
| `2026-09-04T12:58:39+02:00` | Codex primary agent / Executor | `In Progress` | `In Progress` | Completed S01–S03, operation wiring, canonical guidance, and unexecuted component/browser coverage; all static checks passed |
| `2026-09-04T12:59:57+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created exact delivery `c3c9f33795757d455029746ccefe1fec52f071f6`; static checks passed and prepared feature tests remain unexecuted |
| `2026-09-04T14:13:57+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed the exact delivery with no findings and recommended approval |
| `2026-09-04T14:13:57+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly approved exact delivery `c3c9f33795757d455029746ccefe1fec52f071f6` |
| `2026-09-04T14:13:57+02:00` | Codex primary agent / Tester | `Approved` | `Testing` | Began only the recorded component and serialized Chromium/WebKit verification against the exact approved delivery |
| `2026-09-04T14:15:48+02:00` | Codex primary agent / Tester | `Testing` | `In Progress` | Component tests passed 2/3 before a test-only singular-query defect failed on the intentionally mirrored validation copy; stopped before browser tests and invalidated approval |
