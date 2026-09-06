# T-050 — Correct the reorder affordance and the current-set sentence

- **Feature:** `F-010`
- **Status:** `Done`
- **Horizon:** `Now`
- **Order:** 6
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T17:26:00+02:00`
- **Updated:** `2026-09-06T17:40:00+02:00`
- **Started:** `2026-09-06T17:30:00+02:00`
- **Review started:** `2026-09-06T17:30:00+02:00`
- **Approval requested:** `2026-09-06T17:30:00+02:00`
- **Approved:** `2026-09-06T17:40:00+02:00`
- **Testing started:** Not reached
- **Completed:** `2026-09-06T17:40:00+02:00`
- **Canceled:** Not reached
- **Next action:** None; `T-050` is `Done`. `T-046` delivers against the corrected criteria.

## Scope

Carry the Owner's decisions of `2026-09-06` on finding `R3` into the documents that state them. `T-046` found both while reading the application for the affordances `MVP-UX-002` names, before writing a line of its sweep; this Task lands before `T-046` delivers, because `T-046` asserts what it corrects.

- **The reorder affordance, decided as the arrows being correct.** Five sentences require a drag handle that the application has never had: `MVP-UX-002` and `MVP-PRG-003` in the locked criteria, the interaction rule in [`mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), the split sentence in [`programs-and-splits.md`](../../product/programs-and-splits.md), and the `Edit Split` description in [`wireframe-decisions.md`](../../ux/wireframe-decisions.md). Every reorderable list — splits in a program, exercises in a split, exercises in an active workout, exercises in a one-time workout, and exercises in a historical correction — offers a pair of 44 by 44 arrow buttons named `Move <name> up` and `Move <name> down`, disabled at the ends of the list. Each sentence changes to describe that, and the UX document records why it is the accepted affordance rather than a shortfall: a named button is reachable by every input method a phone offers, states its target in its name, and needs no pointer to hold a position.
- **The current-set sentence, decided as a leftover.** `MVP-UX-002` opens with `The current set is visibly distinct.` [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) removed set confirmation, so sets are filled in any order and nothing designates a current one; no other document describes the concept and no screen renders it. The sentence goes. What the criterion keeps requiring — that a reader can tell recorded work from planned — is already delivered and stays: each exercise heading counts `N of M recorded`, and the finish review names every planned set left without values.

Amend ADR-0027 to name `MVP-UX-002` among the criteria it affects, the same omission that let `MVP-REL-002` contradict ADR-0025 for a day. Record both corrections as resolved in the release verification matrix.

## Out of scope

- Any application change: both decisions keep the delivered behavior and move the documents to it
- Any other criterion, and the rest of `MVP-UX-002`, whose reorder auto-save clause is unchanged and correct
- The sweep that verifies them, owned by `T-046`
- The frozen design packages, which `T-048` annotates as superseded rather than rewrites

## Acceptance criteria

- [x] No canonical document requires a drag handle; each of the five sentences describes the named arrow controls the application delivers.
- [x] [`mobile-information-architecture.md`](../../ux/mobile-information-architecture.md) records why the named controls are the accepted affordance, so the next screen inherits the decision instead of re-deriving it.
- [x] `MVP-UX-002` no longer opens with the current-set sentence, and its reorder auto-save clause is unchanged.
- [x] `MVP-PRG-003` keeps everything except the affordance clause.
- [x] ADR-0027 names `MVP-UX-002` among the criteria it affects.
- [x] The matrix records `R3` as resolved, with the Owner's decision and its date.
- [x] The criteria count stays 57 and no criterion changes beyond the two the Owner decided.

## Traceability

- MVP criteria: `MVP-UX-002` and `MVP-PRG-003` (text corrections to match the accepted affordance and ADR-0027); every other criterion unchanged
- ADRs: [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../mvp-release-verification.md`](../mvp-release-verification.md)

## Dependencies and blockers

- Dependencies: `T-043` `Done` for the matrix; `T-046` `In Progress`, which found `R3`
- Blockers: None; the Owner decided both parts on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the locked criteria document (two criteria), the programs-and-splits and both UX documents, ADR-0027, the release verification matrix, this Task, `F-010`, registry, dashboard, project state
- Documentation that should remain unchanged: every other criterion, the frozen design packages, every completed Task record

## Execution checklist

- [x] Rewrite the affordance clause in `MVP-UX-002` and `MVP-PRG-003` and remove the current-set sentence.
- [x] Correct the interaction rule, the split sentence, and the `Edit Split` description, and record the reasoning in the UX document.
- [x] Amend ADR-0027 to name `MVP-UX-002`.
- [x] Mark `R3` resolved in the matrix.
- [x] Confirm by search that no canonical document still requires a drag handle or a current set.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` and `git diff --check`
- Results: Passed on `2026-09-06T17:30:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, the UI asset checksums, Markdown lint across 132 files, and all 1407 internal links. `git diff --check` was clean. A search for `drag` across the product, UX, and architecture documents returns only the new sentence that says the affordance is deliberately not one; `current set` returns nothing. This Task changes no application source, schema, migration, or test source.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** The delivery changes documentation only, to describe behavior the Owner accepted and earlier Tasks already delivered and verified: `T-013` and `T-016` built the reorder controls and `T-029` removed set confirmation under ADR-0027. `T-046` verifies the corrected affordance at release level within its own scope. Owner approval is still required before `Done`.
- **Planned tests:** None
- **Authorized commit:** Not applicable; `test_required` is `no`
- **Results:** Not applicable; `test_required` is `no` and the Owner approved that reason with the delivery.

## Delivery commit

- **Delivery commit SHA:** `17b12f4233282af479501fc9d0af50052d9ca39a`
- **Subject:** `T-050: correct the reorder affordance and the current-set sentence`
- **Committed scope:** the `MVP-UX-002` and `MVP-PRG-003` clauses in the locked criteria; the split sentence in the programs document; the interaction rule in the mobile IA document, with the reasoning; the `Edit Split` description in the wireframe decisions; one consequence in ADR-0027; finding `R3` and two criterion rows in the release verification matrix; this Task.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T17:30:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** Five sentences change and none of them changes behavior. The UX document now carries the reasoning rather than only the rule, so the next screen inherits the decision instead of re-deriving it — which is the failure that produced this finding: the affordance was never decided anywhere, only asserted, and `T-013` recorded the criterion as met against a screen that had arrows.

## Approval

- **Approved commit:** `17b12f4233282af479501fc9d0af50052d9ca39a`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T17:40:00+02:00`
- **Approval note:** Approved (`odobreno`). No feature test follows, because `test_required` is `no`; `T-046` verifies the corrected affordance at release level.

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
- [x] Owner confirms transition to `Ready` by deciding both parts of `R3` on `2026-09-06`

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
| --- | --- | --- | --- | --- |
| `2026-09-06T17:26:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | `T-046` found five sentences requiring an affordance the application has never had, and one sentence ADR-0027 left behind; the criteria document is locked, so the corrections take their own Task |
| `2026-09-06T17:26:00+02:00` | User / Owner | `Backlog` | `Ready` | Decided both parts of `R3`: the named arrow controls are correct, and the current-set sentence is a leftover that goes |
| `2026-09-06T17:30:00+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | The Owner's decisions are recorded, so the documents move to the application |
| `2026-09-06T17:30:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered the five corrections and the ADR amendment; static checks passed and no feature test ran |
| `2026-09-06T17:40:00+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved exact delivery `17b12f4233282af479501fc9d0af50052d9ca39a` (`odobreno`) |
| `2026-09-06T17:40:00+02:00` | Claude Code primary agent / Executor | `Approved` | `Done` | `test_required` is `no`; the criteria now describe the affordance `T-046` asserts |
