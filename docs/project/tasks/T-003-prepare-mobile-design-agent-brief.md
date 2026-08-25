# T-003 — Prepare mobile design-agent brief and wireframes

- **Feature:** `F-003`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-25T16:35:55+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** After `T-002` is Done, refine scope and ask the Owner to confirm readiness.

## Scope

Create the exact outbound prompt, complete screen/state inventory, criteria-to-screen map, realistic sample data, and annotated low-fidelity mobile wireframes needed by the external design agent.

## Out of scope

- Creating or accepting the final visual design
- Implementing the application
- Running feature or visual tests

## Acceptance criteria

- [ ] The outbound prompt satisfies the brief contract in [`../../process/design-collaboration.md`](../../process/design-collaboration.md).
- [ ] Wireframes cover every required screen, state, and critical flow without changing accepted behavior.
- [ ] The user approves the exact prompt and its design constraints before sending it externally.

## Traceability

- MVP criteria: all 57 criteria as design inputs, not behavioral delivery
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../process/design-collaboration.md`](../../process/design-collaboration.md)

## Dependencies and blockers

- Dependencies: `T-002` Done
- Blockers: Owner decisions required during refinement for the reference viewport matrix, UI language, name treatment, theme direction, and design-tool/export capabilities
- Blocked from status: Not blocked; remains planned in `Backlog`

## Documentation impact

- Documents to create or update: versioned design brief/prompt, wireframe package, screen/state manifest, relevant UX documentation and project projections
- Documentation that should remain unchanged: accepted product behavior unless the user explicitly approves a separate change

## Execution checklist

- [ ] Resolve design-blocking inputs with the Owner.
- [ ] Map criteria, screens, states, flows, and sample data.
- [ ] Produce annotated wireframes and outbound prompt.
- [ ] Audit prompt completeness and request exact-commit approval.

## Static-check plan and results

- Planned checks: Markdown links, criterion coverage, artifact inventory, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `no`
- **No-test reason:** Documentation and design-brief artifacts contain no executable product behavior.
- **Planned tests:** None
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-003: prepare mobile design agent brief`
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
- [ ] Scope and out-of-scope are confirmed after dependency completion
- [ ] Acceptance criteria are confirmed as observable
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [ ] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
- [x] Scope fits one independently reviewable delivery commit
- [ ] Owner confirms transition to `Ready`

## Definition of Done

- [ ] Reviewer recommends approval
- [ ] User approved the exact commit SHA
- [ ] Scope and acceptance criteria are satisfied
- [ ] Canonical documentation and required ADRs are current
- [ ] Authorized feature tests passed, or approved no-test reason is recorded
- [ ] Static checks and all evidence are recorded
- [ ] Dashboard, registry, and parent progress are current
- [ ] Follow-up scope has separate Tasks
- [ ] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the first external-design phase without starting it before `T-002` approval |
