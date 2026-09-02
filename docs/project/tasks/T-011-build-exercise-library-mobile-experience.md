# T-011 — Build Exercise Library mobile experience

- **Feature:** `F-005`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-02T08:59:17+02:00`
- **Updated:** `2026-09-02T10:10:10+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Wait for explicit Owner direction to transition to `Ready` and start.

## Scope

Implement the phone-only `/exercises`, `/exercises/new`, and `/exercises/:id/edit` Exercise Library experience, including search/filter/list states, create/edit validation, type-dependent allowed-mode controls, persistent notes, split-usage and future-only warnings, archive/reactivate flows, save/failure feedback, and accepted S05/S06 visual and accessibility fidelity.

## Out of scope

- Workout set entry or read-only display of snapshotted notes
- Exercise History, PRs, charts, Programs, and split editing
- Desktop/tablet layouts or new visual/product behavior
- Feature tests before exact-commit approval

## Acceptance criteria

- [ ] The S05 library lists and searches active definitions, can expose archived definitions for reactivation, and routes by opaque UUID without owning exercise performance statistics.
- [ ] The S06 create/edit form exposes only type-compatible allowed modes and presents accepted field/group validation and save/failure states.
- [ ] Editing shows split usage and future-workout-only messaging; persistent-note and snapshot consequences match canonical copy.
- [ ] Archive/reactivate behavior preserves identity, uses accepted confirmation where shown, and immediately updates new-selection eligibility.
- [ ] The complete flow remains usable and accessible throughout the accepted phone-width range and matches the frozen S05/S06 structural references and v0.4 exceptions.

## Traceability

- MVP criteria: `MVP-EXE-001`–`008`; supporting `MVP-UX-001`
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-010` Done
- Blockers: None; `T-010` is Done
- Blocked from status: Not blocked; dependency is planned

## Documentation impact

- Documents to create or update: Exercise Library UI implementation guidance if needed, this Task, parent Feature, registry, dashboard, and project-state projections
- Documentation that should remain unchanged: accepted exercise behavior, workout/history/program behavior, and desktop/post-MVP scope

## Execution checklist

- [ ] Implement S05 library query, search/filter, active/archived, empty, and loading presentation.
- [ ] Implement S06 create/edit routes and type-dependent accessible form controls.
- [ ] Wire ordinary Server Actions, validation, retry, archive/reactivate, and not-found handling.
- [ ] Prepare component and Chromium/WebKit phone-browser tests without executing them.
- [ ] Run and record only permitted static checks.

## Static-check plan and results

- Planned checks: formatting, ESLint dependency boundaries, strict TypeScript, production build, design asset/reference inventory, documentation links, and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After approval of the exact delivery commit, run scoped component tests for S05/S06 validation and accessibility, then Chromium/WebKit phone-browser scenarios for create, duplicate/invalid rejection, edit warning, archive filtering, reactivation, retry/not-found behavior, phone reflow, and approved structural captures.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-011: build exercise library mobile experience`
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
| `2026-09-02T08:59:17+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the independently reviewable S05/S06 mobile delivery after exercise operations are complete |
| `2026-09-02T10:10:10+02:00` | Codex primary agent / Planner | `Backlog` | `Backlog` | `T-010` completed and cleared the dependency; explicit Owner direction is still required for `Ready` |
