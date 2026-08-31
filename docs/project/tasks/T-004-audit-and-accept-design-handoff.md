# T-004 — Request, audit, and accept design handoff

- **Feature:** `F-003`
- **Status:** `In Review`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-31T11:59:23+02:00`
- **Started:** `2026-08-31T11:37:41+02:00`
- **Review started:** `2026-08-31T11:59:23+02:00`
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** User reviews delivery commit `3529d318cf647094c640807671b2050502e8be92` and either requests changes or recommends it for approval.

## Scope

Create the exact return/handoff prompt, receive and audit the frozen external design package, resolve missing/ambiguous/conflicting items, and record the exact accepted version and implementation inputs.

## Out of scope

- Silently changing product behavior to match a design
- Application/UI implementation
- Running visual comparison or other feature tests

## Acceptance criteria

- [x] The handoff prompt requests every artifact and annotation required by [`../../process/design-collaboration.md`](../../process/design-collaboration.md).
- [x] The returned package is complete, accessible, versioned, and consistent with canonical behavior and accepted architecture.
- [x] The accepted manifest identifies fixed visual references, tokens, assets, exceptions, and unresolved non-blocking notes.
- [ ] The user accepts the exact frozen design version as the UI implementation source.

## Traceability

- MVP criteria: all 57 criteria as design coverage inputs, not behavioral delivery
- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0017](../../decisions/0017-nextjs-app-router-runtime.md), [ADR-0018](../../decisions/0018-local-supabase-postgres-and-server-data-access.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../process/design-collaboration.md`](../../process/design-collaboration.md), [`../../design/T-003-v1/README.md`](../../design/T-003-v1/README.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md)

## Dependencies and blockers

- Dependencies: `T-003` Done; external `v0.4-frozen` design package returned
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: exact handoff prompt, compact accepted-design manifest, UX decisions affected by accepted visuals, project projections
- Documentation that should remain unchanged: product and architecture decisions unless conflicts receive separate explicit approval

## Execution checklist

- [x] Produce and approve the exact handoff prompt.
- [x] Inventory and inspect every returned artifact.
- [x] Resolve missing, ambiguous, conflicting, and risky findings.
- [x] Freeze the audited package and record the exact candidate manifest.
- [ ] Record Owner acceptance of the exact delivery commit and frozen package.

## Static-check plan and results

- Planned checks: package inventory, Markdown links, criteria/frame coverage, asset/reference checksums where practical, `git diff --check`
- Results: Passed on 2026-08-31 — package inventory and JSON parsing; all 404 PNG checksums; ZIP integrity and frozen ZIP SHA-256; targeted contradiction scan; repository internal Markdown links; `git diff --check`.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** Design-package audit contains no implemented feature behavior; later visual comparison belongs to approved UI implementation Tasks.
- **Planned tests:** None
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `3529d318cf647094c640807671b2050502e8be92`
- **Subject:** `T-004: accept mobile design handoff`
- **Committed scope:** Frozen handoff manifest and return contract; package exceptions and checksums; resolved routing, identifier, overlay, safe-area, and persistence decisions; synchronized canonical UX/architecture documents; `F-004` Task breakdown `T-005`–`T-009`; dashboard and registry projections.

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
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the structured return and acceptance phase after external design |
| `2026-08-31T11:37:41+02:00` | User / Owner | `Backlog` | `Ready` | Returned design is available; instructed Codex to complete all work needed to enter implementation quickly |
| `2026-08-31T11:37:41+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began package audit, decision resolution, frozen-manifest creation, and implementation handoff preparation |
| `2026-08-31T11:59:23+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery commit `3529d318cf647094c640807671b2050502e8be92`; no feature tests were run |
