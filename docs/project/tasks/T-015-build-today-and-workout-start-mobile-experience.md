# T-015 — Build Today and workout-start mobile experience

- **Feature:** `F-007`
- **Status:** `Backlog`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-03T12:03:59+02:00`
- **Updated:** `2026-09-03T12:03:59+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for `T-014` completion and explicit Owner direction.

## Scope

Implement phone-only S01 Today, S02 alternate-split sheet, and S03 one-time-workout builder, including proposed-workout content, optional historical average, current-workout restore treatment, no-program state, today-only rotation messaging, active-exercise selection/order, validation, start actions, and accepted visual/accessibility fidelity.

## Out of scope

- Today's weight entry prompt/sheet, owned by `F-009`
- Active-workout editing and finish review, owned by `T-016`
- History presentation/statistics and desktop or unagreed behavior

## Acceptance criteria

- [ ] S01 shows local date, proposed split and optional eligible average, or the accepted no-program state, while retaining the one-time entry point.
- [ ] A current workout replaces second-start actions with a restore card and accurate timer-state treatment.
- [ ] S02 starts another active split for this workout only and distinguishes the choice from persistent Set Next.
- [ ] S03 requires a valid arbitrary name and at least one ordered active exercise, with add/remove/reorder and inline validation.
- [ ] Start failures retain input and expose retry/not-found feedback; successful starts enter the focused route.
- [ ] S01–S03 match accepted structure, states, phone reflow, overlay history, thumb reach, and accessibility behavior.

## Traceability

- MVP criteria: `MVP-TOD-001`–`003`; supporting `MVP-WRK-001`, `MVP-WRK-005`, `MVP-REL-001`–`004`, `MVP-UX-001`–`003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/overview.md`](../../product/overview.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-014` Done
- Blockers: `T-014` is in progress
- Blocked from status: Not blocked; dependency is planned

## Documentation impact

- Documents to create or update: Today UI guidance if needed, Task/Feature/registry/dashboard/milestone/project-state projections
- Documentation that should remain unchanged: weight/body, active-workout detail, History, desktop/post-MVP, and deferred production choices

## Execution checklist

- [ ] Implement S01 proposed/no-program/restored states and loading treatment.
- [ ] Implement S02 alternate-split sheet and S03 one-time builder with ordering and validation.
- [ ] Wire adapters, retry/not-found behavior, accessible overlays, and focused-route entry.
- [ ] Prepare component and Chromium/WebKit tests without running them; run only static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency/accessibility rules, strict TypeScript, production build, design assets/references, documentation links, and `git diff --check`
- Results: Pending

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run scoped component and isolated Chromium/WebKit phone-browser scenarios for proposed/alternate/one-time starts, no-program/restored states, validation, ordering, failure handling, overlay Back, reflow, and structural captures.
- **Authorized commit:** None
- **Results:** Not run; Task is not started.

## Delivery commit

- **Delivery commit SHA:** Pending
- **Subject:** `T-015: build Today workout-start experience`
- **Committed scope:** Pending

## Review

- **Reviewer:** User
- **Reviewed at:** Pending
- **Outcome:** Pending
- **Findings:** Pending

## Approval

- **Approved commit:** Pending
- **Approved by:** Pending
- **Approved at:** Pending
- **Approval note:** Pending

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked
- [x] Executor and Reviewer are named
- [ ] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan are recorded
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
| `2026-09-03T12:03:59+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Created as the dependent Today and workout-start mobile delivery within `F-007` |
