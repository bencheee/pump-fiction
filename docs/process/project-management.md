# Project-management system

- **Status:** Accepted — complete repository-native project-management workflow approved on 2026-08-25.

## Purpose

Before technical architecture or implementation, define a durable development-management system that makes it possible to determine at any moment:

- **who** owns, approves, or performs work;
- **what** is planned, active, blocked, awaiting confirmation, or complete;
- **when** work is planned, started, changed, approved, committed, and tested;
- **how** work maps to product criteria, decisions, documentation, commits, and verification.

The system must work as persistent repository/project memory for future Codex sessions rather than relying on chat history.

## Locked governance inputs

- Version-controlled Markdown in this repository is the single canonical project-management source of truth; see [ADR-0007](../decisions/0007-repository-native-project-management.md).
- External tools may provide non-canonical convenience views, but all authoritative state must exist in the repository. Repository state wins if the two disagree.
- Documentation is part of every change and must remain current; see [`development-governance.md`](development-governance.md#documentation-as-part-of-the-work).
- Every architectural decision requires an ADR.
- Feature tests are forbidden until the user explicitly confirms the relevant commit; see [`development-governance.md`](development-governance.md#commit-approval-and-feature-testing-gate).
- Locked MVP criteria use stable IDs from [`mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md).
- Project management is defined before technical architecture, and technical architecture before implementation.

## Capabilities the system must define

The final project-management design must specify:

- canonical work-item location and identifier format;
- work hierarchy and expected task size;
- ownership, executor, reviewer, and approver roles;
- lifecycle statuses and permitted transitions;
- priority, dependencies, blockers, and scheduling fields;
- Definition of Ready and Definition of Done;
- links from work items to MVP criterion IDs, ADRs, and affected canonical documents;
- the relationship between a work item and one or more commits;
- how commit scope and user confirmation are recorded;
- how test authorization and later test results are recorded;
- how scope changes, newly discovered decisions, and documentation updates are handled;
- how current progress and the next actionable item are summarized for future chats;
- how completed work remains auditable without making active views noisy.

## Confirmed design decisions

- Canonical storage is repository-native Markdown.
- Project state must be recoverable without chat history or an external integration.
- External project-management services are optional projections, never independent sources of truth.
- Managed work uses the hierarchy **Milestone → Feature → Task**; see [ADR-0008](../decisions/0008-milestone-feature-task-hierarchy.md).
- A Task is the smallest independently reviewable change and targets one delivery commit; narrow post-delivery evidence commits record audit events under [ADR-0021](../decisions/0021-delivery-and-evidence-commit-model.md).
- Smaller implementation steps remain checklist items inside a Task. Promote one to a Task if it needs independent ownership, blocking, approval, or a separate commit.
- The project uses Owner, Executor, Reviewer, and Approver roles; see [ADR-0009](../decisions/0009-project-management-roles.md).
- Tasks use the accepted lifecycle and test gate in [ADR-0010](../decisions/0010-task-lifecycle-and-test-gate.md).
- Work items use immutable type-specific identifiers; see [ADR-0011](../decisions/0011-stable-work-item-identifiers.md).
- Planning uses ordered `Now`, `Next`, and `Later` horizons; see [ADR-0012](../decisions/0012-now-next-later-planning.md).
- Project-management artifacts use the layout defined by [ADR-0013](../decisions/0013-project-artifact-layout.md).
- Delivery, approval, and verification evidence follows [ADR-0021](../decisions/0021-delivery-and-evidence-commit-model.md), which supersedes the self-referential mechanism in ADR-0014.
- Readiness and completion use the explicit gates in [ADR-0015](../decisions/0015-readiness-and-completion-gates.md).
- Operational reporting and projections follow [ADR-0016](../decisions/0016-operational-reporting-and-projections.md).

## Work-item hierarchy

### Milestone

A larger approved delivery outcome. It groups Features and reports their rolled-up progress; it is not a substitute for a release or deployment unless explicitly defined as one.

### Feature

A cohesive user-facing or cross-cutting capability that belongs to exactly one Milestone. It groups Tasks and links to relevant product acceptance criteria and decisions.

### Task

The smallest independently reviewable change. A Task belongs to exactly one Feature, targets one delivery commit, and carries the operational ownership, scope, documentation impact, approval, and eventual test record. Narrow evidence commits do not count as additional delivery commits.

Checklist items inside a Task describe execution steps only. They have no separate status or approval lifecycle. Work that cannot remain within one independently reviewable commit is split into multiple Tasks.

## Work-item identifiers

| Type | Format | Example |
| --- | --- | --- |
| Milestone | `M-###` | `M-001` |
| Feature | `F-###` | `F-001` |
| Task | `T-###` | `T-001` |

Each type has a separate monotonically increasing sequence. IDs are globally unique within their type, immutable, and never reused after cancellation or archival. Parent relationships are explicit fields: a Feature records its Milestone, and a Task records its Feature. Rename, move, or archive operations never change an ID.

## Roles and responsibilities

### Owner

The user owns product scope, priority, and accepted decisions. Owner authority applies across the project rather than being delegated by a Task assignment.

### Executor

The named Codex agent or person responsible for completing a Task within its accepted scope and updating every affected canonical document. Every Task must name its Executor.

### Reviewer

The named Codex agent or person who reviews the proposed commit against the Task, linked acceptance criteria and decisions, and documentation. Review does not include running feature tests. Every Task must name its Reviewer.

### Approver

The user is the only Approver. Final commit approval unlocks testing only for the confirmed scope under [`development-governance.md`](development-governance.md#commit-approval-and-feature-testing-gate). A Reviewer may recommend approval or request changes but cannot replace this user decision.

These are logical roles, so one actor may hold more than one role. A named Reviewer does not authorize agent delegation; spawning or delegation still requires an explicit user request.

## Task lifecycle

The normal flow is:

`Backlog → Ready → In Progress → In Review → Awaiting Approval → Approved → Testing → Done`

| Status | Meaning and exit requirement |
| --- | --- |
| `Backlog` | Accepted as potential work but not yet ready to start. |
| `Ready` | Meets Definition of Ready and may be assigned for execution. |
| `In Progress` | Executor is working within the recorded scope and updating documentation. |
| `In Review` | A commit hash exists; Reviewer checks scope, acceptance criteria, decisions, and documentation without feature tests. |
| `Awaiting Approval` | Review is satisfied and the exact commit awaits the user's decision. |
| `Approved` | The user has fully confirmed that commit; feature testing is now permitted for only that scope. |
| `Testing` | Authorized feature tests are running or their results are being recorded. |
| `Done` | Required tests passed, or the approved Task records why no tests were required, and documentation is current. |
| `Blocked` | Progress is temporarily stopped; blocking reason and prior status are recorded. |
| `Canceled` | Work was explicitly abandoned; this status is terminal. |

### Transition rules

- A Task cannot enter `In Review` until its delivery commit exists and an evidence commit records that full SHA.
- Reviewer acceptance moves `In Review` to `Awaiting Approval`; review findings return it to `In Progress`.
- Only the user as Approver can move `Awaiting Approval` to `Approved`.
- `Approved` may move to `Testing`, or directly to `Done` when the Task explicitly requires no tests.
- Any change to an approved commit or scope returns the Task to `In Progress` and clears approval and test permission.
- Passing authorized tests moves `Testing` to `Done`. A failure or required change returns it to `In Progress` and invalidates prior approval.
- `Blocked` may interrupt an active non-terminal status and resumes only to its recorded prior status after the blocker is resolved.
- Any non-terminal Task may become `Canceled` with a recorded reason.
- `Done` and `Canceled` are terminal; follow-up scope receives a new Task.

## Planning and time

### Horizons

Every non-terminal planned work item uses one of these ordered horizons:

- `Now` — current committed focus;
- `Next` — ordered queue intended after current work;
- `Later` — accepted work without a current scheduling commitment.

Items are explicitly ordered within their horizon. A change of horizon or order is a project-management update and must be written to the canonical repository state.

Each Executor may have at most one Task in `In Progress`. The initial workflow has no sprints, story points, or mandatory estimates. A `target_date` is optional and only the Owner may set or change it when a real commitment exists.

### Timestamps and transition history

All work items record `created_at` and `updated_at`. A Task additionally records lifecycle timestamps when reached, including start, review, approval request, approval, testing, completion, cancellation, and blocking/resumption events.

Each status transition records:

- ISO 8601 timestamp with explicit local UTC offset;
- actor and role;
- previous and new status;
- concise reason or outcome.

Example: `2026-08-25T14:30:00+02:00`. Planned calendar dates use `YYYY-MM-DD`.

## Repository artifacts

```text
PROJECT.md
docs/project/
  INDEX.md
  milestones/
  features/
  tasks/
  templates/
```

- [`../../PROJECT.md`](../../PROJECT.md) is the small derived operational dashboard: current phase, `Now`, ordered `Next`, blockers, approval queue, and immediate next action.
- [`../project/INDEX.md`](../project/INDEX.md) is the derived full registry and next-ID ledger.
- Each work item has one canonical Markdown file under its type directory. That file is authoritative for detailed state.
- Work-item files never move after creation. Completion and cancellation change content, not paths.
- Dashboard and registry changes happen in the same Task as the canonical change they project.
- If a projection conflicts with a work-item file, correct the projection immediately; the work-item file wins.
- Templates are finalized only after all required schemas and readiness/completion rules are accepted.

## Delivery, review, and approval records

Each Task targets one delivery commit with this subject format:

`T-###: imperative summary`

The delivery commit contains the scoped implementation and every required canonical documentation update. It cannot contain its own SHA. After creating it, a narrow evidence commit records:

- full `commit_sha`;
- commit subject;
- committed scope summary;
- affected canonical documents;
- static-check results completed so far.

Evidence commits use `PM T-###: record event` and may update only the Task, parent work items, registry, dashboard, and project-state projections. They cannot change delivered behavior, architecture, specification, source, dependencies, database artifacts, or test source. They need no separate Task or approval because their only purpose is to durably record events about the immutable delivery commit. Git history and the required subject identify an evidence commit; it never attempts to write its own SHA into tracked files.

Review records Reviewer, review timestamp, outcome (`changes requested` or `recommended for approval`), and findings. Review compares the commit with Task scope, linked acceptance criteria, accepted decisions, and current documentation; it does not run feature tests.

When the user approves the exact commit, the Task records:

- `approved_commit` using the full SHA;
- `approved_by` as the user/Approver;
- `approved_at` timestamp;
- concise `approval_note` preserving the decision made in chat or another interaction.

This repository record, written by an evidence commit, is the durable approval evidence. A changed delivery SHA or changed scope clears these approval fields and all test authorization before returning the Task to `In Progress`. Evidence-only commits do not change or replace the approved delivery SHA.

## Verification boundary and records

### Feature tests — approval required

These may run only in `Approved` or `Testing` against the exact approved delivery tree:

- unit tests;
- integration tests;
- end-to-end tests;
- running the application specifically to validate feature behavior;
- manual feature test scenarios.

A test plan may be authored earlier but cannot be executed. Later evidence commits do not authorize testing their branch state; execute against the exact approved delivery SHA. Each eventual result records that SHA, command or manual scenario, Executor, timestamp, `passed`/`failed`, and relevant evidence or notes.

### Static checks — permitted before approval

Formatting, lint, type checking, compilation/build, and documentation-link validation are static checks, not feature tests. They may run before approval. Record the command/check, Executor, timestamp, and outcome in the Task. Static checks never grant test authorization.

Every Task states `test_required: yes` or `no`. A `no` value includes a reason and still requires user approval before `Done`.

## Definition of Ready

### Task

A Task may enter `Ready` only when:

- ID, parent Feature, title, horizon, and order are set;
- scope and out-of-scope are clear and fit one independently reviewable delivery commit;
- acceptance criteria are observable;
- applicable MVP criteria, ADRs, and canonical documents are linked, or non-applicability is explicit;
- Executor and Reviewer are named;
- dependencies are known and blockers are resolved;
- documentation impact and execution checklist are defined;
- static-check plan is defined;
- `test_required` and an unexecuted test plan or no-test reason are recorded;
- the Owner confirms transition to `Ready`.

### Feature and Milestone

A Feature or Milestone is ready when its outcome, scope boundaries, observable acceptance/completion criteria, relationships, dependencies, documentation impact, and required child breakdown are clear. The Owner confirms readiness. A Feature must identify at least its first executable `Ready` Task before execution begins.

## Definition of Done

### Task

A Task may enter `Done` only when:

- Reviewer recommends approval and the user approved the exact commit SHA;
- scope and acceptance criteria are satisfied;
- all affected canonical documentation and required ADRs are current;
- authorized tests passed, or the approved no-test reason is recorded;
- static checks, evidence, and transition history are complete;
- dashboard, registry, and parent progress are current;
- every discovered follow-up has a separate Task rather than hidden residual scope.

### Feature and Milestone

A Feature or Milestone is done only when all required children are `Done`, its outcome criteria are satisfied, documentation and projections are current, no required follow-up is hidden, and the user confirms the aggregate result.

## Work-item templates

- [`../project/templates/milestone.md`](../project/templates/milestone.md)
- [`../project/templates/feature.md`](../project/templates/feature.md)
- [`../project/templates/task.md`](../project/templates/task.md)

Copy the appropriate template when allocating a new ID. Remove instructional placeholder text while preserving every required field and gate.

## Reporting and projection updates

### Dashboard

[`../../PROJECT.md`](../../PROJECT.md) remains concise and shows:

- current phase and current Milestone;
- exactly one immediate next action;
- ordered `Now` and `Next` work;
- Blocked Tasks and their reasons;
- Tasks in `Awaiting Approval`, including commit and requested action;
- approved Tasks ready for authorized testing;
- five most recently completed Tasks;
- a concise `Later` summary linking to the registry.

Every displayed Task includes ID, status, Executor, last-change timestamp, and next required action.

### Registry and rollups

[`../project/INDEX.md`](../project/INDEX.md) lists every allocated work item with ID, parent, title, horizon/order, Task status or aggregate progress, responsible actor, last change, and canonical link. It also maintains next IDs.

Feature and Milestone progress is reported as `Done required children / all required children`, plus separate blocked and awaiting-approval child counts.

### Update obligation

Any status, scope, horizon/order, role, blocker, commit, approval, or test-result change updates the canonical work item and transition history. In the same Task, update every affected parent rollup, registry row, and dashboard section.

At work start, read the dashboard and active Task. At handoff, record what changed, current state, and exactly one immediate next action. A canonical work-item file wins over a conflicting projection; correct and record the projection mismatch immediately.

## System status

The project-management system is accepted. Future workflow changes require explicit user approval, an ADR where cross-cutting, updates to this canonical document and templates, and synchronized projections.
