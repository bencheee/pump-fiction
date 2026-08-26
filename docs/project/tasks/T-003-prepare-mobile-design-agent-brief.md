# T-003 — Prepare mobile design-agent brief and wireframes

- **Feature:** `F-003`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Executor:** Codex primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-08-26T12:46:10+02:00`
- **Started:** `2026-08-26T12:22:18+02:00`
- **Review started:** `2026-08-26T12:40:26+02:00`
- **Approval requested:** `2026-08-26T12:46:10+02:00`
- **Approved:** `2026-08-26T12:46:10+02:00`
- **Testing started:** Not reached
- **Completed:** `2026-08-26T12:46:10+02:00`
- **Canceled:** Not reached
- **Next action:** Send the approved [`T-003-v1`](../../design/T-003-v1/README.md) prompt and four companion attachments to the external design agent; `T-004` begins after the returned design is available.

## Scope

Create the exact outbound prompt, complete screen/state inventory, criteria-to-screen map, realistic sample data, and annotated low-fidelity mobile wireframes needed by the external design agent.

## Design brief package

The versioned outbound package is [`../../design/T-003-v1/README.md`](../../design/T-003-v1/README.md). It contains the exact prompt, 24-screen/state manifest, map of all 57 locked MVP criteria, realistic sample data, and annotated low-fidelity wireframes.

The Owner approved this exact prompt content and authorized its delivery commit by replying `potvrđujem` on `2026-08-26T12:38:44+02:00`. The external-sending gate was satisfied by later approval of the exact delivery commit SHA recorded below.

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
- Blocked from status: Not blocked; Task is complete

## Documentation impact

- Documents to create or update: versioned design brief/prompt, wireframe package, screen/state manifest, relevant UX documentation and project projections
- Documentation that should remain unchanged: accepted product behavior unless the user explicitly approves a separate change

## Execution checklist

- [x] Resolve design-blocking inputs with the Owner.
- [x] Map criteria, screens, states, flows, and sample data.
- [x] Produce annotated wireframes and outbound prompt.
- [x] Audit prompt completeness and request exact-commit approval.

## Static-check plan and results

- Planned checks: Markdown links, criterion coverage, artifact inventory, `git diff --check`
- Results: Passed at `2026-08-26T12:30:56+02:00` — all internal Markdown file targets exist; canonical criteria count is 57 and the criteria map covers the same 57 unique IDs; all 24 screen IDs, seven overlay/feedback IDs, and six required package artifacts are present; prompt and artifact inventory were inspected; `git diff --check` passed.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** Documentation and design-brief artifacts contain no executable product behavior.
- **Planned tests:** None
- **Authorized commit:** Not applicable (`test_required: no`)
- **Results:** Not run; the User approved the recorded no-test reason with the exact delivery commit.

## Delivery commit

- **Delivery commit SHA:** `dd3c2b01885db83583cdd9a29cbbdbdf9f007011`
- **Subject:** `T-003: prepare mobile design agent brief`
- **Committed scope:** Owner-approved versioned outbound prompt; complete 24-screen/state and overlay inventory; all-57-criteria design map; realistic sample data; annotated low-fidelity wireframes; confirmed design constraints; synchronized UX, process, Task, parent, registry, dashboard, and project-state documentation.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-08-26T12:46:10+02:00`
- **Outcome:** Recommended for approval
- **Findings:** None recorded

## Approval

- **Approved commit:** `dd3c2b01885db83583cdd9a29cbbdbdf9f007011`
- **Approved by:** User / Approver
- **Approved at:** `2026-08-26T12:46:10+02:00`
- **Approval note:** User replied `da` to the explicit question asking whether exact delivery `dd3c2b01885db83583cdd9a29cbbdbdf9f007011` was reviewed and fully approved. `test_required: no`; no feature or visual tests were run.

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

- [x] Reviewer recommends approval
- [x] User approved the exact commit SHA
- [x] Scope and acceptance criteria are satisfied
- [x] Canonical documentation and required ADRs are current
- [x] Authorized feature tests passed, or approved no-test reason is recorded
- [x] Static checks and all evidence are recorded
- [x] Dashboard, registry, and parent progress are current
- [x] Follow-up scope has separate Tasks
- [x] Audit history is complete

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Not allocated | `Backlog` | Reserve the first external-design phase without starting it before `T-002` approval |
| `2026-08-26T12:22:18+02:00` | User / Owner | `Backlog` | `Ready` | Confirmed all proposed design-blocking inputs and authorized the next planned step |
| `2026-08-26T12:22:18+02:00` | Codex primary agent / Executor | `Ready` | `In Progress` | Began the documentation-only design-brief Task; no feature tests are required or authorized |
| `2026-08-26T12:40:26+02:00` | Codex primary agent / Executor | `In Progress` | `In Review` | Created delivery `dd3c2b01885db83583cdd9a29cbbdbdf9f007011` after Owner content approval; recorded static checks and ran no feature tests |
| `2026-08-26T12:46:10+02:00` | User / Reviewer | `In Review` | `Awaiting Approval` | Reviewed exact delivery `dd3c2b01885db83583cdd9a29cbbdbdf9f007011` and recommended approval with no findings |
| `2026-08-26T12:46:10+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Fully approved exact delivery `dd3c2b01885db83583cdd9a29cbbdbdf9f007011` by replying `da` to the explicit exact-SHA request |
| `2026-08-26T12:46:10+02:00` | Codex primary agent / Executor | `Approved` | `Done` | Documentation/design-brief Task completed with the approved no-test reason; no feature or visual tests were run |
