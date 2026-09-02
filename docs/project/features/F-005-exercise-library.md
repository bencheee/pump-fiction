# F-005 — Exercise Library

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-02T10:00:54+02:00`
- **Progress:** `0/2 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The user can manage a persistent exercise library with accepted type/load-mode validation, notes, dependency warnings, archive/reactivation, and stable identity.

## Scope

- Included: primary ownership of `MVP-EXE-001` through `MVP-EXE-008`.
- Excluded: workout entry, performance statistics, and new exercise capabilities outside the locked MVP.

## Acceptance criteria

- All owned criteria pass their eventual approval-gated verification and remain consistent with the canonical exercise specification.

## Tasks

- [`T-010`](../tasks/T-010-build-exercise-library-operations.md) — Build exercise-library operations (`Testing`; approved replacement `410c44edd4f8b1698f7de6b792eed0be16a26052`)
- [`T-011`](../tasks/T-011-build-exercise-library-mobile-experience.md) — Build Exercise Library mobile experience (`Backlog`)

## Dependencies and blockers

- Dependencies: `F-003`, `F-004`
- Blockers: None for `T-010`; `T-011` depends on `T-010` becoming `Done`

## Related decisions and documents

- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md)
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified; the first executable work is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness through the 2026-09-02 direction to start `F-005`

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Assign primary ownership for the exercise-library acceptance group |
| `2026-09-02T08:59:17+02:00` | User / Owner and Codex primary agent / Planner | Moved Feature to `Now`, accepted the two-Task breakdown, and started `T-010` | Begin Exercise Library delivery with application/persistence operations before the dependent mobile experience |
| `2026-09-02T09:21:51+02:00` | Codex primary agent / Executor | Completed `T-010` implementation scope pending delivery | Exercise operations, atomic definition writes, lifecycle queries, prepared tests, and canonical guidance are statically verified |
| `2026-09-02T09:24:32+02:00` | Codex primary agent / Executor | Delivered `T-010` for review | Exact commit `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` is ready for User review; feature tests remain unexecuted |
| `2026-09-02T09:43:39+02:00` | User / Reviewer and Approver | Approved exact `T-010` delivery for testing | Commit `320749fc8b3e7bc3c4bccc7ad0e93a0e5ba300c7` may run only its recorded scoped verification |
| `2026-09-02T09:47:00+02:00` | Codex primary agent / Tester | Began T-010 verification | Running only the recorded scoped tests in an isolated worktree at the exact approved delivery |
| `2026-09-02T09:51:21+02:00` | Codex primary agent / Tester | Returned `T-010` to `In Progress` | Exercise pgTAP exposed leaking constraint-mode state between fixtures; repository tests stopped and a test-only replacement requires fresh approval |
| `2026-09-02T09:55:08+02:00` | Codex primary agent / Executor | Corrected T-010 test isolation pending replacement delivery | Every pgTAP scenario now explicitly starts deferred; all static checks passed without rerunning feature tests |
| `2026-09-02T09:56:40+02:00` | Codex primary agent / Executor | Delivered corrected `T-010` replacement for review | Exact replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` awaits fresh User review and approval |
| `2026-09-02T10:00:54+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved replacement and began verification | Running the complete recorded test plan from the beginning against exact replacement `410c44edd4f8b1698f7de6b792eed0be16a26052` |
