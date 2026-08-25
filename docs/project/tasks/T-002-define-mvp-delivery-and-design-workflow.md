# T-002 — Define MVP delivery and external-design workflow

- **Feature:** `F-002`
- **Status:** `In Progress`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-25T16:45:56+02:00`
- **Started:** `2026-08-25T16:35:55+02:00`
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Complete the documentation changes, run static documentation checks, and create the delivery commit for review.

## Scope

Define the complete Local MVP Feature sequence and criteria ownership; establish the external UI/UX brief, handoff, and fidelity process; quantify and reinforce cold-start documentation efficiency; and allocate the first design Tasks.

## Out of scope

- Producing the actual outbound design-agent prompt, visual wireframes, or final visual design
- Initializing the application or implementing product behavior
- Running automated, manual, or visual feature tests

## Acceptance criteria

- [x] `M-001` lists an ordered implementation Feature breakdown covering all 57 locked MVP criteria.
- [x] Every locked criterion has one primary Feature owner without copying its full specification into project-management files.
- [x] A canonical process specifies the lifecycle and required contents of the two future prompts, required wireframes and design inputs, handoff format, acceptance audit, and fidelity boundary.
- [x] The first outbound-brief and inbound-handoff Tasks are allocated and ordered.
- [x] A measured cold-start audit is recorded and agent instructions explicitly prevent bulk-loading or requirement duplication.
- [x] Dashboard, registry, project state, and relevant indexes agree.

## Traceability

- MVP criteria: `MVP-REL-001` through `MVP-UX-003` (planning ownership only; no behavior delivered)
- ADRs: [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0008](../../decisions/0008-milestone-feature-task-hierarchy.md), [ADR-0013](../../decisions/0013-project-artifact-layout.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../process/design-collaboration.md`](../../process/design-collaboration.md), [`../../../PROJECT.md`](../../../PROJECT.md), [`../INDEX.md`](../INDEX.md)

## Dependencies and blockers

- Dependencies: completed `T-001`; accepted architecture and locked MVP criteria
- Blockers: None
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: design collaboration process; context-loading guidance; Milestone/Features/Tasks; dashboard, registry, project state, and documentation index
- Documentation that should remain unchanged: canonical product behavior, accepted technical architecture, and existing ADR outcomes

## Execution checklist

- [x] Map all 57 criteria to primary Features and order delivery dependencies.
- [x] Define external design brief, handoff package, audit, and fixed-reference fidelity contract.
- [x] Allocate `T-003` and `T-004` without starting them.
- [x] Record measured cold-start footprint and strengthen progressive-loading rules.
- [x] Synchronize all operational projections.

## Cold-start context audit

Measured on 2026-08-25 after these scoped documentation changes:

- the minimal router bundle (`AGENTS.md` and `docs/INDEX.md`) is 733 words / 6,258 bytes;
- the managed-work bundle (router bundle, `PROJECT.md`, and active `T-002`) is 1,922 words / 15,672 bytes;
- all repository Markdown documentation is 29,985 words / 236,138 bytes;
- therefore the current managed-work cold start is about 6.4% of documentation by words (6.6% by bytes), before loading only the canonical topics relevant to the Task.

Conclusion: current documentation is modular and does not consume a major share of a new chat context at startup. The observed growth risk is future duplication inside work items or preloading completed Tasks/design exports; the reinforced `AGENTS.md` and documentation-index rules prohibit both.

## Static-check plan and results

- Planned checks: inspect changed-file diff; validate repository Markdown links with a non-test static script; verify criterion ownership mechanically; check `git diff --check`
- Results: Passed at `2026-08-25T16:45:56+02:00` — complete diff inspected; all internal Markdown link targets exist; canonical source contains 57 criteria and the primary-owner map covers 57/57 exactly once; `git diff --check` passed.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** Documentation-only planning and process change delivers no executable feature behavior.
- **Planned tests:** None; no feature test may run.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-002: define MVP delivery and design workflow`
- **Committed scope:** Not created

## Review

- **Reviewer:** Codex primary agent
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
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known and blocking issues resolved
- [x] Documentation impact and execution checklist are defined
- [x] Static-check plan is defined
- [x] `test_required` and an unexecuted plan or no-test reason are recorded
- [x] Scope fits one independently reviewable delivery commit
- [x] Owner confirms transition to `Ready` through the 2026-08-25 instruction to proceed

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
| `2026-08-25T16:35:55+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed proceeding with delivery planning and requested explicit UI/UX brief and handoff phases |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began documentation-only planning Task; no feature testing authorized or required |
