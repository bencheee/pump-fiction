# T-004 — Request, audit, and accept design handoff

- **Feature:** `F-003`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 2
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
- **Next action:** Wait for an approved `T-003` brief and completed external design before readiness refinement.

## Scope

Create the exact return/handoff prompt, receive and audit the frozen external design package, resolve missing/ambiguous/conflicting items, and record the exact accepted version and implementation inputs.

## Out of scope

- Silently changing product behavior to match a design
- Application/UI implementation
- Running visual comparison or other feature tests

## Acceptance criteria

- [ ] The handoff prompt requests every artifact and annotation required by [`../../process/design-collaboration.md`](../../process/design-collaboration.md).
- [ ] The returned package is complete, accessible, versioned, and consistent with canonical behavior and accepted architecture.
- [ ] The accepted manifest identifies fixed visual references, tokens, assets, exceptions, and unresolved non-blocking notes.
- [ ] The user accepts the exact frozen design version as the UI implementation source.

## Traceability

- MVP criteria: all 57 criteria as design coverage inputs, not behavioral delivery
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../process/design-collaboration.md`](../../process/design-collaboration.md), future `T-003` design brief and wireframe artifacts

## Dependencies and blockers

- Dependencies: `T-003` Done; external design package returned
- Blockers: Awaiting those dependencies
- Blocked from status: Not blocked; remains planned in `Backlog`

## Documentation impact

- Documents to create or update: exact handoff prompt, compact accepted-design manifest, UX decisions affected by accepted visuals, project projections
- Documentation that should remain unchanged: product and architecture decisions unless conflicts receive separate explicit approval

## Execution checklist

- [ ] Produce and approve the exact handoff prompt.
- [ ] Inventory and inspect every returned artifact.
- [ ] Resolve missing, ambiguous, conflicting, and risky findings.
- [ ] Freeze references and record Owner acceptance.

## Static-check plan and results

- Planned checks: package inventory, Markdown links, criteria/frame coverage, asset/reference checksums where practical, `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `no`
- **No-test reason:** Design-package audit contains no implemented feature behavior; later visual comparison belongs to approved UI implementation Tasks.
- **Planned tests:** None
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-004: accept mobile design handoff`
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
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the structured return and acceptance phase after external design |
