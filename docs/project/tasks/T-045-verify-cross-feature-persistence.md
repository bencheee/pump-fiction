# T-045 — Verify cross-feature persistence and non-reinterpretation

- **Feature:** `F-010`
- **Status:** `Testing`
- **Horizon:** `Next`
- **Order:** 3
- **Target date:** None
- **Executor:** Claude Code primary agent
- **Reviewer:** User
- **Approver:** User
- **Created:** `2026-09-06T14:36:00+02:00`
- **Updated:** `2026-09-06T16:52:00+02:00`
- **Started:** `2026-09-06T16:20:00+02:00`
- **Review started:** `2026-09-06T16:44:00+02:00`
- **Approval requested:** `2026-09-06T16:44:00+02:00`
- **Approved:** `2026-09-06T16:52:00+02:00`
- **Testing started:** `2026-09-06T16:52:00+02:00`
- **Completed:** Not reached
- **Canceled:** Not reached
- **Next action:** Run the authorized scenarios against the exact approved delivery and record the result.

## Scope

Deliver the release evidence for the two criteria `F-010` owns at the data level, which no single Feature could prove because each one crosses all of them: `MVP-REL-003` persistent canonical history and `MVP-REL-004` no silent data reinterpretation.

One prepared browser scenario, `tests/browser/release-persistence.spec.ts`, that:

- seeds one dataset touching every persisted category in `MVP-REL-003` — exercise definitions of both types with each addition, a program with several splits, a rotation pointer that is not on the first split, a current active workout with entered sets, a workout-specific note and accumulated timer, at least one completed and one incomplete workout, weight entries across two calendar weeks, and two measurement types with entries;
- reloads the page and reopens the application in a fresh browser context, and asserts each of those categories comes back with its values, its order, and its rotation pointer intact, and that the active workout restores its entered sets, note, and accumulated duration rather than restarting;
- then edits one exercise definition's name, note, and addition and deletes another, and asserts that every saved workout snapshot, History row, exercise-history entry, and statistic that already contained them reads exactly as before, including the deleted exercise still appearing in Exercise History by its identity snapshot;
- deletes a split and asserts the workouts it produced keep their name snapshot and that only the rotation successor rule moves;
- corrects one historical workout and deletes another, and asserts the affected personal records, charts, split durations, and **Last time** recalculate while no template and no rotation pointer moves;
- removes every row it creates and leaves the Owner's own data untouched.

The delivery is test source and documentation. No application change is expected; a defect the run finds is corrected as an in-scope replacement under [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md), or becomes its own Task when it changes scope.

## Out of scope

- The phone-interaction sweep, owned by `T-046`, and the visual comparison, owned by `T-047`
- The release run of every suite, owned by `T-048`
- New product behavior, new derived statistics, and any change to the locked criteria
- Re-proving a criterion an owning Feature already verified against its approved delivery; this Task proves only what crossing the Features can break

## Acceptance criteria

- [ ] The scenario asserts every category `MVP-REL-003` names, and it fails if any one of them is lost by a reload or a reopen.
- [ ] The scenario asserts a definition edit and a definition deletion leave every existing snapshot, History row, and statistic unchanged, which is what `MVP-REL-004` forbids reinterpreting.
- [ ] The scenario asserts a historical correction and a historical deletion recalculate the derived output while the templates and the rotation pointer stand.
- [ ] It passes on mobile Chromium and mobile WebKit against the approved delivery, with structural captures attached.
- [ ] It leaves no row behind: the database after the run matches the state before it.
- [ ] The matrix rows for `MVP-REL-003` and `MVP-REL-004` cite this run and its approved SHA.

## Traceability

- MVP criteria: `MVP-REL-003`, `MVP-REL-004`; supporting `MVP-WRK-001`, `MVP-WRK-005`, `MVP-EXE-006`, `MVP-EXE-008`, `MVP-PRG-005`, `MVP-PRG-007`, `MVP-HIS-003`, `MVP-HIS-004`, `MVP-HIS-005`, `MVP-WGT-004`, `MVP-BOD-004`
- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md), [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md), [ADR-0019](../../decisions/0019-application-boundaries-and-active-workout-durability.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../architecture/active-workout-durability.md`](../../architecture/active-workout-durability.md), [`../../architecture/server-data-boundaries.md`](../../architecture/server-data-boundaries.md), [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md)

## Dependencies and blockers

- Dependencies: `T-043` `Done`, which named the gap; `T-044` `Done`, which settled the harness rule and returned the suite to one production server; `F-004` through `F-009` `Done`
- Blockers: None; the Owner gave the go-ahead on `2026-09-06`
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: `docs/project/mvp-release-verification.md` rows for the two criteria, this Task, `F-010`, registry, dashboard, project state
- Documentation that should remain unchanged: the locked criteria text, the domain model and durability documents unless the run proves them wrong, every completed Task record

## Execution checklist

- [x] Write the seeding and teardown helpers so the scenario owns every row it creates.
- [x] Write the persistence half: reload, reopen, and assert each category and the restored active workout.
- [x] Write the non-reinterpretation half: definition edit, definition deletion, split deletion, historical correction, historical deletion.
- [x] Attach structural captures at both reference viewports.
- [x] Prepare the scenario; do not run it.
- [x] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`
- Results: Passed on `2026-09-06T16:44:00+02:00` with Node.js `22.21.0` and npm `10.9.4`. `npm run check` passed Prettier, ESLint, strict TypeScript, the production build, the UI asset checksums, Markdown lint across 131 files, and all 1390 internal links. `git diff --check` was clean. This Task adds test source only: no application source, schema, migration, or generated type changed. No feature test ran; the scenario is prepared and unexecuted.

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval: `npm run test:browser` for this scenario alone on one worker across mobile Chromium and mobile WebKit, after a clean reset and with the Owner's data snapshotted and restored around it; then the unit suite to confirm nothing else moved. Must not run before that approval; replacements inherit it under ADR-0028.
- **Authorized commit:** `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`
- **Subject:** `T-045: verify cross-feature persistence and non-reinterpretation`
- **Committed scope:** `tests/browser/release-persistence.spec.ts` alone — two prepared scenarios, their seeding through the accepted operations, and their teardown. Test source only.

## Written against the source, not against assumption

Every locator and every enum value in the scenario was read out of the application before it was written, because a browser scenario that guesses costs an approval cycle. Six assumptions were wrong and were corrected before delivery rather than discovered by a run:

- the restored active workout renders its values in fields, not as History text, so the reopened context reads the kilogram and reps field values, the note textarea, and the `Active duration` label;
- that label is the timer's only handle: there is no test id anywhere in the workout routes;
- the timer formats as `m:ss`, so the seed starts the current workout 25 minutes in the past and the assertion is a range a restarted timer could not satisfy;
- a bodyweight set renders through `formatSetSummary` as `× 12`, not `12 reps`;
- the load-mode enum member is `weight_resistance_band`, not `weight_with_resistance_band`;
- sets come back ordered by exercise position and then set position, so the completed workout's second entry belongs to set index 2, the chin-up, not index 1, which is the press's second set — the original indexing would have tried to record a bodyweight value against a weights exercise.

One more would have failed every assertion in the reopened context: a context built from the raw `browser` fixture inherits nothing from the project, so `baseURL` and the phone profile are passed in explicitly. Without that, every relative `goto` would have thrown.

The rotation pointer is read from the programs list row, whose markup states it as `Next: <split>` beside the split count and the `Current` badge — one row that proves the program, its splits, the current-program flag, and the pointer together.

## Review

- **Reviewer:** User
- **Reviewed at:** `2026-09-06T16:44:00+02:00`
- **Outcome:** Recommended for approval
- **Findings:** The reopen half is the part no earlier scenario could reach: a fresh context carries no localStorage, no IndexedDB, and no session, so whatever survives it is genuinely persisted rather than remembered by the browser. The pointer deliberately sits on the second split, so a rotation state that was lost and rebuilt from scratch would land on the first and fail. The scenario adds no application code; a defect it finds is corrected as an in-scope replacement or becomes its own Task.

## Approval

- **Approved commit:** `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`
- **Approved by:** User / Approver
- **Approved at:** `2026-09-06T16:52:00+02:00`
- **Approval note:** Approved (`potvrda`), which authorizes both scenarios against this exact tree. Replacements within scope inherit it under ADR-0028.

## Definition of Ready

- [x] ID, parent Feature, horizon, and order are set
- [x] Scope and out-of-scope are clear
- [x] Acceptance criteria are observable
- [x] MVP criteria, ADRs, and canonical documents are linked or explicitly not applicable
- [x] Executor and Reviewer are named
- [x] Dependencies are known; the scope is accepted and only the go-ahead and the two preceding Tasks remain
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
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | User / Owner | `Backlog` | `Backlog` | Confirmed the breakdown and the proposed local decisions (`ostalo potvrđujem da je ok`); only the go-ahead remains |
| `2026-09-06T16:20:00+02:00` | User / Owner | `Backlog` | `Ready` | Gave the go-ahead (`kreni`) once `T-044` completed |
| `2026-09-06T16:20:00+02:00` | Claude Code primary agent / Executor | `Ready` | `In Progress` | The matrix names `MVP-REL-003` and `MVP-REL-004` as the two gaps no single Feature could close |
| `2026-09-06T16:44:00+02:00` | Claude Code primary agent / Executor | `In Progress` | `Awaiting Approval` | Delivered the two prepared scenarios; static checks passed and no feature test ran |
| `2026-09-06T16:52:00+02:00` | User / Approver | `Awaiting Approval` | `Approved` | Approved exact delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6` (`potvrda`) |
| `2026-09-06T16:52:00+02:00` | Claude Code primary agent / Tester | `Approved` | `Testing` | The two release scenarios run on one worker across both phones, with the unit suite after them |
