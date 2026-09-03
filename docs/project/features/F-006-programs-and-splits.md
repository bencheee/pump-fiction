# F-006 — Programs and Splits

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-03T11:31:08+02:00`
- **Progress:** `1/2 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

The user can create and manage programs, ordered split templates, activation and archiving, and the persistent next-split rotation rules.

## Scope

- Included: primary ownership of `MVP-PRG-001` through `MVP-PRG-007`.
- Excluded: active-workout execution, historical charts, and behavior not present in the locked criteria.

## Acceptance criteria

- All owned criteria pass their eventual approval-gated verification and remain consistent with the canonical programs/splits specification.

## Tasks

- [`T-012`](../tasks/T-012-build-program-and-split-operations.md) — Build program and split operations (`Done`; approved replacement `5b781802d2bddfc77b55745f12108ae678bd2b76`)
- [`T-013`](../tasks/T-013-build-programs-mobile-experience.md) — Build Programs mobile experience (`Testing`; approved replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe`)

## Dependencies and blockers

- Dependencies: `F-003`, `F-004`, `F-005`
- Blockers: None; `T-013` is active after `T-012` completion

## Related decisions and documents

- ADRs: [ADR-0002](../../decisions/0002-template-snapshot-history-model.md)
- Canonical documents: [`../../product/programs-and-splits.md`](../../product/programs-and-splits.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified; the first executable work is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirms readiness through the 2026-09-02 direction to start `F-006`

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Assign primary ownership for programs, splits, and rotation |
| `2026-09-02T14:35:46+02:00` | User / Owner and Codex primary agent / Planner | Moved Feature to `Now`, accepted the two-Task breakdown, and started `T-012` | Begin Programs and Splits delivery with application/persistence operations before the dependent mobile experience |
| `2026-09-02T15:01:52+02:00` | Codex primary agent / Executor | Completed `T-012` implementation scope pending delivery | Program/split operations, transactional lifecycle and rotation rules, prepared tests, and canonical guidance are statically verified |
| `2026-09-02T15:04:53+02:00` | Codex primary agent / Executor | Delivered `T-012` for review | Exact commit `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` is ready for User review; feature tests remain unexecuted |
| `2026-09-02T15:07:10+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-012 delivery and began verification | Running only the recorded scoped tests against exact delivery `08f5e0f415c69f3d3d7f9800fb617d23cf8806bc` |
| `2026-09-02T15:11:26+02:00` | Codex primary agent / Tester | Returned `T-012` to `In Progress` | Unit 4/4 and pgTAP 26/26 passed; repository integration exposed an invalid test fixture and a test-only replacement requires fresh approval |
| `2026-09-02T15:13:44+02:00` | Codex primary agent / Executor | Corrected T-012 test fixture pending replacement delivery | The rejection scenario now uses a split without prior archived-exercise membership; static checks passed without feature tests |
| `2026-09-02T15:14:49+02:00` | Codex primary agent / Executor | Delivered T-012 test-only replacement for review | Exact replacement `5b781802d2bddfc77b55745f12108ae678bd2b76` awaits fresh User approval |
| `2026-09-02T15:29:06+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-012 replacement and began verification | Running the complete recorded test plan from the beginning against `5b781802d2bddfc77b55745f12108ae678bd2b76` |
| `2026-09-03T10:27:22+02:00` | Codex primary agent / Tester | Completed `T-012` within `F-006` | Exact replacement passed unit 4/4, clean reset, pgTAP 26/26, repository integration 1/1, and generated-type comparison; `T-013` awaits Owner direction |
| `2026-09-03T10:34:57+02:00` | User / Owner | Started `T-013` within `F-006` | Continue with the remaining Programs mobile experience delivery |
| `2026-09-03T10:46:33+02:00` | Codex primary agent / Executor | Completed `T-013` implementation scope pending delivery | S07–S09 mobile flows and approval-gated tests are prepared; all permitted static checks passed without executing feature tests |
| `2026-09-03T10:47:48+02:00` | Codex primary agent / Executor | Delivered `T-013` for review | Exact delivery `5c83acf4e5a2fe74f4ec1b3de76d99e48493bda4` awaits User review; feature tests remain unexecuted |
| `2026-09-03T10:49:36+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-013 delivery and began verification | Running only the recorded component and Chromium/WebKit phone-browser plan against exact delivery `5c83acf4e5a2fe74f4ec1b3de76d99e48493bda4` |
| `2026-09-03T10:52:46+02:00` | Codex primary agent / Tester | Returned `T-013` to `In Progress` | Component 4/4 and malformed routes 2/2 passed; both full browser flows stopped at an ambiguous Add-program matcher, so approval is invalidated and a test-only replacement is required |
| `2026-09-03T10:54:20+02:00` | Codex primary agent / Executor | Corrected T-013 browser matcher pending replacement | The Add-program icon locator now requires an exact accessible name; all static checks passed without rerunning feature tests |
| `2026-09-03T10:55:23+02:00` | Codex primary agent / Executor | Delivered T-013 test-only replacement for review | Exact replacement `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8` awaits fresh User approval |
| `2026-09-03T11:22:58+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved T-013 replacement and restarted verification | Running the complete recorded plan from the beginning against exact replacement `85c7b3d5eb8e33989c426e6fbafaf7c642000cf8` |
| `2026-09-03T11:26:18+02:00` | Codex primary agent / Tester | Returned `T-013` to `In Progress` | Component 4/4 and browser 3/4 passed, including the full WebKit flow; Chromium exposed a missing redirect wait in test source, so approval is invalidated |
| `2026-09-03T11:27:57+02:00` | Codex primary agent / Executor | Corrected T-013 redirect race pending replacement | The second split save now awaits its edit-route redirect before Back; all static checks passed without rerunning feature tests |
| `2026-09-03T11:28:42+02:00` | Codex primary agent / Executor | Delivered second T-013 test-only replacement | Exact replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` awaits fresh User approval |
| `2026-09-03T11:31:08+02:00` | User / Reviewer and Approver; Codex primary agent / Tester | Approved second T-013 replacement and restarted verification | Running the complete recorded plan from the beginning against exact replacement `000a62a70fbf03bb14f32fe7513ce0fb93f528fe` |
