# T-051 — Accept the Body destination

- **Feature:** `F-015`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T19:10:00+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Await the Owner's go-ahead for `F-015`.

## Scope

Decide the change before anything implements it, so no Task builds against a document that contradicts it.

- `ADR-0030` records the Body destination: what moves out of History, why the four-destination rule becomes five, and which part of [ADR-0003](../../decisions/0003-history-information-architecture.md) it supersedes — the grouping of *all* historical records under History, not the separation of records from templates, which stands.
- `MVP-REL-002` states five destinations; `MVP-HIS-001` states three History subsections; `MVP-WGT-001` and `MVP-BOD-002` move creation to Today and keep correction and deletion in Body; `MVP-BOD-001` loses the separate unit statement; a new criterion states the Today measurement card, beside `MVP-TOD-004`.
- The product, UX, and architecture documents that describe the four destinations, the five History subsections, and where a weigh-in or measurement is entered.
- One more supersession row in each design package, as `T-048` established.
- The release verification matrix records which criteria this Milestone revised and that their `M-001` evidence stands for the behavior as it was.

## Out of scope

- Any application change; `T-052` and `T-053` deliver those
- `MVP-WGT-002`, `MVP-WGT-003`, `MVP-BOD-003`, and `MVP-BOD-004`, which are untouched: no derivation, weekly rule, or chart changes
- Rewriting either design package

## Acceptance criteria

- [ ] `ADR-0030` records the decision and names every criterion it affects, which is the omission that produced `R1` and `R3` in `F-010`.
- [ ] No canonical document still says the bottom navigation has exactly four destinations, or that History contains Weight and Body.
- [ ] Every revised criterion reads as the Owner decided, and the untouched ones are byte-identical.
- [ ] The criteria count and their IDs stay stable; a new criterion takes the next free ID rather than reusing one.
- [ ] The matrix records the revision without discarding the `M-001` evidence, which remains true of the behavior it verified.

## Traceability

- MVP criteria: revises `MVP-REL-002`, `MVP-HIS-001`, `MVP-WGT-001`, `MVP-BOD-001`, `MVP-BOD-002`; extends `MVP-TOD-004` with a sibling; must not weaken `MVP-WGT-002`–`003`, `MVP-BOD-003`–`004`
- ADRs: [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), and new `ADR-0030`
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/overview.md`](../../product/overview.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../mvp-release-verification.md`](../mvp-release-verification.md)

## Dependencies and blockers

- Dependencies: `M-001` complete
- Blockers: the Owner's go-ahead for `F-015`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `ADR-0030` (new), the decisions register, the locked criteria, the weight-and-body and overview product documents, both UX documents, the mobile UI foundation, both design-package READMEs, the matrix, this Task, `F-015`, `M-002`, registry, dashboard, project state
- Documentation that should remain unchanged: every criterion the Owner did not decide to change, and every completed Task record

## Execution checklist

- [ ] Write `ADR-0030`, naming every criterion it affects.
- [ ] Revise the five criteria and add the Today measurement criterion.
- [ ] Correct the product, UX, and architecture documents.
- [ ] Add the supersession rows and the matrix note.
- [ ] Confirm by search that no document still states the old rules.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** The delivery changes documentation only and precedes the application change it describes. `T-052` and `T-053` verify the delivered behavior against these revised criteria. Owner approval is still required before `Done`.
- **Planned tests:** None
- **Authorized commit:** Not applicable; `test_required` is `no`
- **Results:** Not run

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-051: accept the Body destination`
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
| --- | --- | --- | --- | --- |
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-015` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
