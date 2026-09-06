# T-049 — Correct two locked MVP criteria and the stale shell sentence

- **Feature:** `F-010`
- **Status:** `Awaiting Approval`
- **Horizon:** `Now`
- **Order:** 2
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T15:24:00+02:00`
- **Updated:** `2026-09-06T15:32:00+02:00`
- **Started:** `2026-09-06T15:32:00+02:00`
- **Review started:** `2026-09-06T15:32:00+02:00`
- **Approval requested:** `2026-09-06T15:32:00+02:00`
- **Approved:** Not reached
- **Testing started:** Not reached
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** The Owner's approval of the exact delivery commit.

## Scope

Carry the Owner's decisions of `2026-09-06` into the locked criteria document, which is the only way a locked criterion may change: an explicit product decision plus the documentation update in the same Task. `T-043` found these three; the Owner decided them the same day.

- **`MVP-REL-002`, decided as `donja navigacija se uvijek mora vidjeti`.** Replace the second sentence, `An active workout uses a focused screen without that bottom navigation.`, with the accepted behavior: the four destinations stay visible and usable throughout an active workout, and the workout is not one of them, so none is marked current while its screen is open. This is what [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md) accepted on `2026-09-05` and what [`T-024`](T-024-keep-primary-navigation-during-workout.md) delivered; the criterion is the last place stating the opposite. The first sentence, which fixes the four destinations, stands unchanged.
- **`MVP-PRG-007`, decided as `nema arhiviranja`.** Change the heading `Archive a split` to `Delete a split`, matching a body that already describes permanent deletion under [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md) and what [`T-021`](T-021-replace-archiving-with-deletion-in-data.md) delivered. The body is unchanged.
- **The same-family sentence in the architecture document.** [`local-technical-architecture.md`](../../architecture/local-technical-architecture.md) still says the `T-009` foundation provides `safe-area-aware main/focused shells`. ADR-0025 removed the `FocusedShell` primitive and the `(focused)` route group, and neither exists in `src/`. One shell remains, and the sentence says so.

Amend [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md) to name `MVP-REL-002` among the criteria it affects, which is the omission that let the contradiction survive: the ADR listed the criteria that keep their text and never named the one whose text it superseded. Record the correction in the matrix's findings section as resolved.

## Out of scope

- Any other criterion, and any behavior change: all three edits describe what the application already does, decided and delivered before this Task
- The finish-review copy and the test-support visibility rule, owned by `T-044`
- The `T-003-v1` outbound design package, which `T-048` annotates as superseded rather than rewrites
- Application source, database artifacts, and test source; this Task changes documentation only

## Acceptance criteria

- [x] `MVP-REL-002` states that the bottom navigation stays visible during an active workout, and no canonical document still says a workout hides it.
- [x] `MVP-PRG-007` is headed `Delete a split` and its body is byte-identical to before.
- [x] The architecture document describes one shell, and `grep` finds no `focused shell` claim outside the frozen design packages, the ADR's own context paragraph, and completed Task records.
- [x] ADR-0025 names `MVP-REL-002` among the criteria it affects.
- [x] The matrix records findings `R1` and `R2` as resolved by this Task, with the Owner's decision and its date.
- [x] The criteria count stays 57 and no criterion's meaning changes beyond the two the Owner decided.

## Traceability

- MVP criteria: `MVP-REL-002` and `MVP-PRG-007` (text corrections to match accepted decisions); every other criterion unchanged
- ADRs: [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0025](../../decisions/0025-active-workout-in-the-main-shell.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md)
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/local-technical-architecture.md`](../../architecture/local-technical-architecture.md), [`../mvp-release-verification.md`](../mvp-release-verification.md)

## Dependencies and blockers

- Dependencies: [`T-043`](T-043-record-release-verification-matrix.md) `Done`, which found all three
- Blockers: None; the Owner decided both findings on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the locked criteria document (two edits), the local technical architecture (one sentence), ADR-0025 (one line), the release verification matrix, this Task, `F-010`, registry, dashboard, project state
- Documentation that should remain unchanged: every other criterion, the `MVP-PRG-007` body, both frozen design packages, every completed Task record

## Execution checklist

- [x] Rewrite the `MVP-REL-002` second sentence and the `MVP-PRG-007` heading.
- [x] Correct the shell sentence in the architecture document.
- [x] Amend ADR-0025 to name `MVP-REL-002`.
- [x] Mark `R1` and `R2` resolved in the matrix with the Owner's decision and date.
- [x] Confirm by search that no canonical document still claims a focused shell or split archiving.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Passed on `2026-09-06T15:32:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, the UI asset checksums, Markdown lint across 130 files, and all 1383 internal links across 184 unique targets. `git diff --check` was clean. A search for `focused shell` and `focused screen` across the product, UX, architecture, and process documents now returns nothing; the term survives only in the frozen design packages, ADR-0025's own context paragraph, and completed Task records, where it correctly describes what was superseded. This Task changes no application source, schema, migration, generated type, or test source.

## Test plan and results

- **Test required:** `no`
- **No-test reason:** The delivery changes documentation only. All three sentences are corrected to describe behavior the Owner accepted and earlier Tasks already delivered and verified — `T-024` for the shell under ADR-0025 and `T-021` for deletion under ADR-0024 — so there is no new behavior to test. `T-046` verifies the corrected navigation rule at release level as part of its own scope. Owner approval is still required before `Done`.
- **Planned tests:** None
- **Authorized commit:** Not applicable; `test_required` is `no`
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Recorded by the following evidence commit
- **Subject:** `T-049: correct two locked MVP criteria and the stale shell sentence`
- **Committed scope:** the `MVP-REL-002` second sentence and the `MVP-PRG-007` heading in the locked criteria document; one sentence in the local technical architecture; one consequence line in ADR-0025; the two findings marked resolved in the release verification matrix with their two criterion rows; this Task. No application source, schema, migration, generated type, or test source changed, and no other criterion moved.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T15:32:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** Three sentences change and each states what the Owner decided and what earlier Tasks already delivered. The `MVP-PRG-007` body is untouched, the criteria count is unchanged at 57, and no behavior moves.

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
- [x] Owner confirms transition to `Ready` by deciding both findings on `2026-09-06`

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
| `2026-09-06T15:24:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | `T-043` found three stale sentences and the criteria document is locked, so the corrections need their own Task rather than an evidence commit |
| `2026-09-06T15:24:00+02:00` | User / Owner | `Backlog` | `Ready` | Decided both findings: the bottom navigation must always be visible, and there is no archiving |
| `2026-09-06T15:32:00+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | The Owner's decisions are recorded, so the documents move to match the application |
| `2026-09-06T15:32:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered the three corrections and the ADR amendment; static checks passed and no feature test ran |
