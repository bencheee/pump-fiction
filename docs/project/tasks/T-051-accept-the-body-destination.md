# T-051 — Accept the Body destination

- **Feature:** `F-015`
- **Status:** `Awaiting Approval`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T19:50:00+02:00`
- **Started:** `2026-09-06T19:34:00+02:00`
- **Review started:** `2026-09-06T19:48:00+02:00`
- **Approval requested:** `2026-09-06T19:48:00+02:00`
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** The Owner's approval of the exact delivery commit; `T-052` builds against it.

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

- [x] `ADR-0030` records the decision and names every criterion it affects, which is the omission that produced `R1` and `R3` in `F-010`.
- [x] No canonical document still says the bottom navigation has exactly four destinations, or that History contains Weight and Body.
- [x] Every revised criterion reads as the Owner decided, and the untouched ones are byte-identical.
- [x] The criteria count and their IDs stay stable; a new criterion takes the next free ID rather than reusing one.
- [x] The matrix records the revision without discarding the `M-001` evidence, which remains true of the behavior it verified.

## Traceability

- MVP criteria: revises `MVP-REL-002`, `MVP-HIS-001`, `MVP-WGT-001`, `MVP-BOD-001`, `MVP-BOD-002`; extends `MVP-TOD-004` with a sibling; must not weaken `MVP-WGT-002`–`003`, `MVP-BOD-003`–`004`
- ADRs: [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), and new `ADR-0030`
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/overview.md`](../../product/overview.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../mvp-release-verification.md`](../mvp-release-verification.md)

## Dependencies and blockers

- Dependencies: `M-001` complete
- Blockers: None; the Owner gave the go-ahead on `2026-09-06` (`nastavi`)
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `ADR-0030` (new), the decisions register, the locked criteria, the weight-and-body and overview product documents, both UX documents, the mobile UI foundation, both design-package READMEs, the matrix, this Task, `F-015`, `M-002`, registry, dashboard, project state
- Documentation that should remain unchanged: every criterion the Owner did not decide to change, and every completed Task record

## Execution checklist

- [x] Write `ADR-0030`, naming every criterion it affects.
- [x] Revise the five criteria and add the Today measurement criterion.
- [x] Correct the product, UX, and architecture documents.
- [x] Add the supersession rows and the matrix note.
- [x] Confirm by search that no document still states the old rules.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** The delivery changes documentation only and precedes the application change it describes. `T-052` and `T-053` verify the delivered behavior against these revised criteria. Owner approval is still required before `Done`.
- **Planned tests:** None
- **Authorized commit:** Not applicable; `test_required` is `no`
- **Results:** Not run

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Passed on `2026-09-06T19:48:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, the UI asset checksums, Markdown lint across 138 files, and all 1507 internal links. `git diff --check` was clean. A search for `four destinations`, `exactly four`, and `focused experience` across the product, UX, architecture, and process documents now returns nothing. This Task changes no application source, schema, migration, or test source.

## Delivery commit

- **Delivery commit SHA:** `4108680d6e411544190d7c3a8e4cb2752c694c42`
- **Subject:** `T-051: accept the Body destination`
- **Committed scope:** `ADR-0030` and its register row; five revised criteria and the new `MVP-TOD-005`; the destination list and Body paragraph in the mobile IA document; the entry and unit rules in the weight-and-body document; the destination list, Today cards, and entry paragraph in the overview; the revision table in the release verification matrix; one supersession row in each design package; this Task.

## One more surviving contradiction, found and fixed here

[`overview.md`](../../product/overview.md) still said `An active workout is a separate focused experience without the standard bottom navigation.` [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md) superseded that on `2026-09-05`, and `T-049` corrected the same claim in three other places on `2026-09-06` — but its search looked for `focused shell`, `focused screen`, and `without that bottom navigation`, and this sentence says `focused experience` and `the standard bottom navigation`. A fourth wording of a rule that had already been decided twice.

It is corrected here because this Task was rewriting the destination list two lines above it, and leaving a known contradiction in a paragraph under edit would be a choice. The lesson is about the search, not the sentence: a phrase-based sweep finds the phrasings it thinks of.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T19:48:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** The criteria now describe behavior the application does not yet have, which is what acceptance criteria are for and what the matrix says plainly: the `M-001` evidence is kept and marked as covering the superseded text, and re-verification is named per criterion. Nothing about derivation, weekly rules, or charts moved. The one thing worth reading twice is `MVP-WGT-001`: retrospective creation is gone, so a missed day stays unrecorded.

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
| --- | --- | --- | --- | --- |
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-015` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T19:34:00+02:00` | User / Owner | `Backlog` | `Ready` | Gave the go-ahead for `F-015` (`nastavi`) |
| `2026-09-06T19:34:00+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | The decision precedes the build, so no Task implements against a document that contradicts it |
| `2026-09-06T19:48:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered `ADR-0030`, six criteria, and the documents that stated the old rules; static checks passed and no feature test ran |
