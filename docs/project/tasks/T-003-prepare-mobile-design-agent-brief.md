# T-003 — Prepare mobile design-agent brief and wireframes

- **Feature:** `F-003`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-26T12:38:44+02:00`
- **Started:** `2026-08-26T12:22:18+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Create the authorized `T-003` delivery commit, record its exact SHA, and perform documentation review without feature tests.

## Scope

Create the exact outbound prompt, complete screen/state inventory, criteria-to-screen map, realistic sample data, and annotated low-fidelity mobile wireframes needed by the external design agent.

## Design brief package

The versioned outbound package is [`../../design/T-003-v1/README.md`](../../design/T-003-v1/README.md). It contains the exact prompt, 24-screen/state manifest, map of all 57 locked MVP criteria, realistic sample data, and annotated low-fidelity wireframes.

The Owner approved this exact prompt content and authorized its delivery commit by replying `potvrđujem` on `2026-08-26T12:38:44+02:00`. External sending remains gated by approval of the exact delivery commit SHA.

## Out of scope

- Creating or accepting the final visual design
- Implementing the application
- Running feature or visual tests

## Acceptance criteria

- [x] The outbound prompt satisfies the brief contract in [`../../process/design-collaboration.md`](../../process/design-collaboration.md).
- [x] Wireframes cover every required screen, state, and critical flow without changing accepted behavior.
- [x] The user approves the exact prompt and its design constraints before sending it externally.

## Traceability

- MVP criteria: all 57 criteria as design inputs, not behavioral delivery
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../process/design-collaboration.md`](../../process/design-collaboration.md)

## Dependencies and blockers

- Dependencies: `T-002` Done
- Blockers: None. The Owner confirmed the reference viewport matrix, English UI, replaceable `Pump Fiction` working-name treatment, dark-first theme, accessibility/asset constraints, and editable handoff capabilities on `2026-08-26`.
- Blocked from status: Not blocked; Task is in progress

## Documentation impact

- Documents to create or update: versioned design brief/prompt, wireframe package, screen/state manifest, relevant UX documentation and project projections
- Documentation that should remain unchanged: accepted product behavior unless the user explicitly approves a separate change

## Execution checklist

- [x] Resolve design-blocking inputs with the Owner.
- [x] Map criteria, screens, states, flows, and sample data.
- [x] Produce annotated wireframes and outbound prompt.
- [ ] Audit prompt completeness and request exact-commit approval.

## Static-check plan and results

- Planned checks: Markdown links, criterion coverage, artifact inventory, `git diff --check`
- Results: Passed at `2026-08-26T12:30:56+02:00` — all internal Markdown file targets exist; canonical criteria count is 57 and the criteria map covers the same 57 unique IDs; all 24 screen IDs, seven overlay/feedback IDs, and six required package artifacts are present; prompt and artifact inventory were inspected; `git diff --check` passed.

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
- [x] Scope and out-of-scope are confirmed after dependency completion
- [x] Acceptance criteria are confirmed as observable
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready`

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
| `2026-08-26T12:22:18+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed all proposed design-blocking inputs and authorized the next planned step |
| `2026-08-26T12:22:18+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the documentation-only design-brief Task; no feature tests are required or authorized |
