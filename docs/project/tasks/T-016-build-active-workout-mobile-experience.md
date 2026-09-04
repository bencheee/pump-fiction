# T-016 — Build active-workout mobile experience

- **Feature:** `F-007`
- **Status:** `Backlog`
- **Horizon:** `Now`
- **Order:** 4
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-03T12:03:59+02:00`
- **Updated:** `2026-09-04T09:00:13+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for `T-017` and `T-015` completion and explicit Owner direction.

## Scope

Implement phone-only S10 active/paused/restored workout, S11 add-exercise sheet, and S12 finish review, including focused shell, live timer, durable save/conflict states, snapshot/Last time content, all set modes, workout-local edits, populated-removal confirmation, and complete/incomplete/continue/discard outcomes.

## Out of scope

- Today/start, today's weight, and History presentation/correction
- Rest timer, warm-up sets, RIR/RPE, estimated 1RM, general offline, desktop, or post-MVP close protection
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] S10 restores canonical state with accurate duration, revision, pending replay, and non-color save/conflict cues.
- [ ] Cards show required snapshots, Last time, notes, prescription, editable rows, and valid per-set mode inputs.
- [ ] Exercise/set add/remove/reorder stays workout-local, auto-saved, accessible, and confirmation-gated for populated data.
- [ ] Pause and resume exclude paused wall-clock time.
- [ ] S12 handles complete, incomplete, continue, and confirmed discard with required review data.
- [ ] S10–S12 match accepted structure, dense phone reflow, focused navigation, overlay history, touch, motion, and accessibility behavior.

## Traceability

- MVP criteria: `MVP-WRK-001`–`012`; supporting `MVP-TOD-002`–`003`, `MVP-REL-001`–`004`, `MVP-UX-001`–`003`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/workouts.md`](../../product/workouts.md), [`../../product/exercises.md`](../../product/exercises.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-014`, `T-017`, and `T-015` Done
- Blockers: `T-017` is in progress; `T-015` is planned
- Blocked from status: Not blocked; dependencies are planned

## Documentation impact

- Documents to create or update: active-workout UI/client guidance if needed, Task/Feature/registry/dashboard/milestone/project-state projections
- Documentation that should remain unchanged: Today/weight and History behavior, desktop/post-MVP, and deferred production choices

## Execution checklist

- [ ] Implement S10 focused workout and duration/save-status behavior.
- [ ] Implement cards, modes, validation, notes, add/remove, and ordering through the durable controller.
- [ ] Implement S11 selection, S12 review/outcomes, and conflict recovery.
- [ ] Prepare component and Chromium/WebKit tests without running them; run only static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency/accessibility rules, strict TypeScript, production build, design assets/references, documentation links, and `git diff --check`
- Results: Pending

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval, run scoped component and isolated Chromium/WebKit scenarios covering every mode, confirmation, Last time/notes, local edits, timer/reload, pending replay/retry/conflict, finish outcomes, rotation, reflow, and structural captures.
- **Authorized commit:** None
- **Results:** Not run; Task is not started.

## Delivery commit

- **Delivery commit SHA:** Pending
- **Subject:** `T-016: build active workout experience`
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
| `2026-09-03T12:03:59+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Created as the dependent active-workout mobile delivery within `F-007` |
| `2026-09-04T09:00:13+02:00` | Codex primary agent / Planner | `Backlog` | `Backlog` | Added dependency on required one-time starter-set correction T-017 and shifted order after that inserted Task |
