# T-043 — Record the release verification matrix

- **Feature:** `F-010`
- **Status:** `Backlog`
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T14:52:00+02:00`
- **Started:** Not reached
- **Review started:** Not reached
- **Approval requested:** Not reached
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Await the Owner's go-ahead. The readiness answers are accepted; nothing starts before the go-ahead.

## Scope

Create the release verification record that `F-010` needs before it verifies anything: one canonical document, `docs/project/mvp-release-verification.md`, holding a row for each of the 57 locked criteria in the order [`mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md) states them, with:

- the owning Feature and the Task that delivered it;
- the approved delivery SHA whose authorized verification already covered the criterion, and the recorded result of that verification, cited from the Task file rather than restated;
- the release-level gap that remains, naming the `F-010` Task that closes it, or the explicit statement that the criterion needs nothing further;
- the accepted meaning of the release re-verification, so `T-045`, `T-046`, and `T-048` execute a written rule instead of an interpretation, and the record that the accepted-reference visual comparison is the Owner's own, performed outside the managed Task flow and reported into `T-048`.

Add its router row to [`../../INDEX.md`](../../INDEX.md). This Task is documentation only: it writes down what is already true and what is not yet proven.

## Out of scope

- Running any feature test, including re-running a verification this document cites
- Changing the locked criteria text, any completed Task record, or any approved delivery
- Application source, database artifacts, and test source
- The verification work itself, owned by `T-045`, `T-046`, and `T-048`; and the visual comparison, which the Owner performs themselves

## Acceptance criteria

- [ ] All 57 criteria appear exactly once, in the locked document's order, and the document states that count.
- [ ] Every covered row cites an approved delivery SHA and the result recorded in the owning Task, and every link resolves.
- [ ] Every gap row names `T-045`, `T-046`, or `T-048`, or states why the criterion needs no further work.
- [ ] The document states what the release run in `T-048` executes, and records that the fidelity comparison is the Owner's own and reaches the repository through `T-048`.
- [ ] `MVP-REL-003`, `MVP-REL-004`, and `MVP-UX-001` through `MVP-UX-003` are visibly owned by `F-010` rather than by a Feature that only touched them.
- [ ] [`../../INDEX.md`](../../INDEX.md) routes to the new document and `npm run links:internal` passes.

## Traceability

- MVP criteria: all 57; primary ownership of `MVP-REL-003`, `MVP-REL-004`, `MVP-UX-001`, `MVP-UX-002`, `MVP-UX-003`
- ADRs: [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md), [ADR-0015](../../decisions/0015-readiness-and-completion-gates.md), [ADR-0016](../../decisions/0016-operational-reporting-and-projections.md), [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../process/development-governance.md`](../../process/development-governance.md), [`../../process/project-management.md`](../../process/project-management.md), [`../../process/design-collaboration.md`](../../process/design-collaboration.md), [`../../INDEX.md`](../../INDEX.md)

## Dependencies and blockers

- Dependencies: `F-004` through `F-009` and `F-011` through `F-014` `Done`, so every citation exists
- Blockers: the Owner's go-ahead for `F-010`; the readiness answers are accepted as of `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `docs/project/mvp-release-verification.md` (new), [`../../INDEX.md`](../../INDEX.md), this Task, `F-010`, registry, dashboard, project state
- Documentation that should remain unchanged: the locked criteria text, every completed Task and Feature record, the frozen design packages

## Execution checklist

- [ ] Read each owning Task's recorded verification and collect its approved SHA, command, and result.
- [ ] Write the 57 rows with their citations, owning Feature, and remaining gap.
- [ ] Write the release-run rule from the Owner's accepted answers, and record that the fidelity comparison is the Owner's own.
- [ ] Add the router row and check every internal link.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Not run

## Test plan and results

- **Test required:** `no`
- **No-test reason:** The delivery changes no application behavior, no database artifact, and no test source. Every claim it makes is a citation of a verification already executed and recorded against an approved delivery SHA; review and the internal-link check are the appropriate verification. The release run itself is `T-048`. Owner approval is still required before `Done`.
- **Planned tests:** None
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-043: record the release verification matrix`
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
- [x] Dependencies are known; the readiness answers are accepted and only the go-ahead remains
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
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | User / Owner | `Backlog` | `Backlog` | Confirmed the breakdown and every remaining recommended answer (`ostalo potvrđujem da je ok`); `T-047` is canceled and the visual comparison becomes the Owner's own |
