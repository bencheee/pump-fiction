# T-002 — Define MVP delivery and external-design workflow

- **Feature:** `F-002`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** Codex primary agent
- **Approver:** User
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-25T16:49:33+02:00`
- **Started:** `2026-08-25T16:35:55+02:00`
- **Review started:** `2026-08-25T16:47:34+02:00`
- **Approval requested:** `2026-08-25T16:47:34+02:00`
- **Approved:** `2026-08-25T16:49:33+02:00`
- **Testing started:** Not reached
- **Completed:** `2026-08-25T16:49:33+02:00`
- **Canceled:** Not reached
- **Next action:** None; follow-up design-brief work is tracked separately in `T-003`.

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
- **Authorized commit:** Not applicable
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `4b9e0ce75ad1dddfc4694757f2ac33d8b3dd50fc`
- **Subject:** `T-002: define MVP delivery and design workflow`
- **Committed scope:** Ordered `M-001` Feature and criteria ownership plan; external design brief/handoff/fidelity process and ADR-0022; `T-003`/`T-004`; measured cold-start guidance; synchronized indexes and project projections.

## Review

- **Reviewer:** Codex primary agent
- **Reviewed at:** `2026-08-25T16:47:34+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `4b9e0ce75ad1dddfc4694757f2ac33d8b3dd50fc`
- **Approved by:** User / Approver
- **Approved at:** `2026-08-25T16:49:33+02:00`
- **Approval note:** User replied `potvrdujem` to the explicit exact-SHA approval request. `test_required: no`; no automated, manual, or visual feature tests were run.

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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Approved no-test reason is recorded
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed proceeding with delivery planning and requested explicit UI/UX brief and handoff phases |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began documentation-only planning Task; no feature testing authorized or required |
| `2026-08-25T16:47:34+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery `4b9e0ce75ad1dddfc4694757f2ac33d8b3dd50fc` and reviewed its exact committed scope; no tests run |
| `2026-08-25T16:47:34+02:00` | Codex primary agent / Reviewer | `In Review` | `Awaiting Approval` | Recommended the exact delivery commit for user approval with no findings |
| `2026-08-25T16:49:33+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Explicitly confirmed exact delivery `4b9e0ce75ad1dddfc4694757f2ac33d8b3dd50fc` |
| `2026-08-25T16:49:33+02:00` | Codex primary agent / Executor | `Approved` | `Done` | Documentation-only Task completed with the approved no-test reason; no tests run |
