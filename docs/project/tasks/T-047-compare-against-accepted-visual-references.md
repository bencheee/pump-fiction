# T-047 — Compare the application against the accepted visual references

- **Feature:** `F-010`
- **Status:** `Canceled`
- **Horizon:** `Next`
- **Order:** 5
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
- **Canceled:** `2026-09-06T14:52:00+02:00`
- **Next action:** None; this Task is terminal. The Owner performs the visual comparison themselves, outside the managed Task flow.

## Scope

Canceled on `2026-09-06`: the Owner will make the visual comparison against the accepted references themselves, so `F-010` allocates no Task for it. `T-048` records the outcome the Owner reports rather than a run of its own. The original scope follows for audit, and its findings — the accepted `OD-015` limitation, the 19 superseded frames, and the exact engine match — are the input the Owner's own comparison needs.

Deliver the accepted-reference visual comparison the fidelity contract in [`../../process/design-collaboration.md`](../../process/design-collaboration.md) requires, within the limits the accepted package itself records.

The comparison runs at the two fixed references, `390 × 844 @3x` and `360 × 800 @3x`, on the Chromium the references were captured with. Playwright `1.62.1` bundles Chromium `151.0.7922.34` and every reference file is named `chromium151`, so the engine matches exactly. For each in-scope frame the harness drives the application into that screen and state and records:

- the geometric and textual signature — element box geometry, row heights, spacing, type sizes and weights, visible copy, and chart geometry — against the frozen `v0.3` PNG, which the accepted manifest says remains accurate for exactly those things;
- the token colors read from the computed style against `tokens/pump-fiction.tokens.json`, and the save, validation, and outcome cue position against the `v0.4` specifications, which is where the accepted package moves authority for color and cue placement;
- a per-frame verdict and every difference with its explanation, written to a result document in the repository.

A recorded exclusion list carries, with the deciding ADR for each entry, the frames whose state the project has since removed: the 16 archiving and reactivation frames under [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md) — `S05`, `S06`, `S07`, `S08`, `S09`, `S15`, `S16`, `S17`, `S18`, `S21`, `S22`, `S23` archived, `O01` archive-losing-selection, and the three `O05` frames — and the three `O02` per-set mode-chooser frames, which `MVP-WRK-003` and [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md), [ADR-0026](../../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md), and [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) replaced with a mode derived from the definition. That is 19 of the 202 frames; the remaining 183 are in scope. The frozen package is not edited: it is a historical artifact and the exclusion list lives in this repository.

The 404 reference PNGs are 91 MB and stay outside Git, as [`.gitignore`](../../../.gitignore) already keeps them. The harness reads the directory from `PF_DESIGN_REFERENCE_DIR`, verifies it against the package's `reference/SHA256SUMS.txt` before comparing anything, and fails loudly when the directory is absent or its bytes have changed, rather than reporting a pass it did not perform.

## Out of scope

- A raw per-pixel diff against the `v0.3` PNGs. The accepted package records under `PF-FIND-017` and Owner decision `OD-015` that the set was not re-exported for `v0.4` and that the `v0.4` corrections change rendered pixels on every screen. A byte comparison would fail everywhere for a reason the Owner already accepted.
- Commissioning a re-exported reference set, which would be a new versioned handoff under [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md) and its own Feature
- WebKit raster comparison: the package holds no WebKit reference, and the `v0.4` manifest already recorded that as an accepted limitation
- Redesign, token changes, and any correction of the application's appearance; a difference this Task finds is reported, and the Owner decides whether it becomes a Task
- The persistence and interaction evidence, owned by `T-045` and `T-046`

## Acceptance criteria

- [ ] The harness refuses to run without a reference directory whose checksums match `reference/SHA256SUMS.txt`.
- [ ] All 183 in-scope frames are compared at both reference viewports; the 19 excluded frames are listed with the ADR that removed their state.
- [ ] Every frame has a recorded verdict, and every difference is either explained against the accepted `OD-015` limitation or reported as an unexplained finding.
- [ ] The comparison runs on Chromium `151.0.7922.34` at device pixel ratio 3, and the result document records the engine, the viewport, the fonts, and the theme it ran under.
- [ ] The result document names every unexplained difference for the Owner's decision and claims no fidelity the run did not measure.
- [ ] The matrix row for the accepted-reference comparison cites this run and its approved SHA.

## Traceability

- MVP criteria: none directly; this Task delivers the fidelity contract of [`../../process/design-collaboration.md`](../../process/design-collaboration.md) and the `F-010` acceptance criterion that the app respects the accepted design package at its fixed references
- ADRs: [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0020](../../decisions/0020-mobile-ui-charting-and-quality-tooling.md), [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0026](../../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md), [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md)
- Canonical documents: [`../../process/design-collaboration.md`](../../process/design-collaboration.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Dependencies and blockers

- Dependencies: `T-043` for the comparison definition the Owner accepts; the Owner's extraction of the frozen package, which is the only copy of the references
- Blockers: readiness questions 1 through 4 and the `F-010` go-ahead
- Blocked from status: Not blocked

## Documentation impact

- Documents to create or update: the comparison result document and its exclusion list, `docs/project/mvp-release-verification.md`, the design-collaboration fidelity section only if the Owner's answers refine what the comparison means, this Task, `F-010`, registry, dashboard, project state
- Documentation that should remain unchanged: both frozen design packages, the locked criteria text, the accepted tokens

## Execution checklist

- [ ] Write the reference-integrity check and the environment gate.
- [ ] Write the exclusion list with a deciding ADR for every entry.
- [ ] Map each in-scope frame to the route, state, and fixture that reaches it.
- [ ] Write the geometric and textual signature comparison and the token and cue checks.
- [ ] Write the result document's shape, so the run fills a record rather than inventing one.
- [ ] Prepare the harness; do not run it.
- [ ] Run only permitted static checks and deliver one reviewable commit.

## Static-check plan and results

- Planned checks: `npm run check` (formatting, ESLint, strict TypeScript, production build, asset checksums, Markdown lint, internal links) and `git diff --check`; confirm no reference image and no design source enters the repository
- Results: Not run

## Test plan and results

- **Test required:** `yes`
- **No-test reason:** Not applicable
- **Planned tests:** After the Task's one approval, and only then: the comparison across all 183 in-scope frames at both reference viewports on Chromium, against the exact approved delivery, with the reference directory verified first. The fidelity contract states plainly that visual comparison is a feature test whose references may be prepared earlier and which must not run before approval; replacements inherit that approval under ADR-0028.
- **Authorized commit:** Not authorized
- **Results:** Not run

## Delivery commit

- **Delivery commit SHA:** Not created
- **Subject:** `T-047: compare the application against the accepted visual references`
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

Not applicable: the Task was canceled in `Backlog` and never entered `Ready`.

## Definition of Done

Not applicable: `Canceled` is terminal and this Task delivered nothing.

## Transition history

| Timestamp | Actor/role | From | To | Reason or outcome |
| --- | --- | --- | --- | --- |
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | — | `Backlog` | Recorded in the `F-010` breakdown at the Owner's request; nothing is committed or started before their go-ahead |
| `2026-09-06T14:52:00+02:00` | User / Owner | `Backlog` | `Canceled` | The Owner takes the visual comparison on themselves (`t-047 zanemari, sam ću napraviti vizualnu usporedbu`), so no Task owns it; `T-048` records the outcome they report |
