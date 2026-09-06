# F-010 — Local MVP Integration

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 3
- **Target date:** None
- **Created:** `2026-08-25T16:35:55+02:00`
- **Updated:** `2026-09-06T18:44:00+02:00`
- **Progress:** `6/7 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

All completed domain Features operate as one persistent, accessible, phone-only Local MVP and receive final cross-feature and visual-fidelity verification after exact-commit approval.

## Scope

- Included: primary ownership of `MVP-REL-003` through `MVP-REL-004` and `MVP-UX-001` through `MVP-UX-003`; release-level re-verification of all 57 criteria; accepted-reference visual comparison.
- Excluded: production deployment/security and all post-MVP capabilities.

## Acceptance criteria

- Every locked criterion has passed authorized verification against approved delivery commits and final integration introduces no contradiction.
- The complete app respects the accepted design package at its fixed references and behaves correctly across the agreed phone-width range.
- Documentation and implementation agree, and the user confirms the Local MVP result.

## Tasks

Recorded on `2026-09-06` at the Owner's request and confirmed by them the same day, without committing or implementing anything. The record precedes the verification, and the verification precedes the close, as operations preceded screens in `F-005` through `F-009`. Seven Tasks are required: `T-049` joined on `2026-09-06` when `T-043` found three stale sentences the Owner then decided, and `T-050` joined the same day when `T-046` found five more. Both are the same shape — the application was right and the documents had drifted — and both landed before the Task that reads them. `T-047` is `Canceled`, because the Owner performs the visual comparison themselves.

| Order | Task | Delivers | Depends on |
| --- | --- | --- | --- |
| 1 | [`T-043`](../tasks/T-043-record-release-verification-matrix.md) — Record the release verification matrix (`Done`; approved delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601`) | One row per locked criterion: owning Feature, approved SHA, recorded evidence, and the remaining gap with the Task that closes it | `F-004`–`F-009`, `F-011`–`F-014` `Done` |
| 2 | [`T-049`](../tasks/T-049-correct-two-locked-mvp-criteria.md) — Correct two locked MVP criteria and the stale shell sentence (`Done`; approved delivery `6cffc618d03198b576374b71db47a6156a2a296d`) | The `MVP-REL-002` navigation sentence, the `MVP-PRG-007` heading, the architecture document's focused-shell claim, and the ADR-0025 omission that let the contradiction survive | `T-043`; the Owner's decisions of `2026-09-06` |
| 3 | [`T-044`](../tasks/T-044-close-discovered-release-corrections.md) — Close the two discovered release corrections (`Done`; approved delivery `f2a46162b80e747c369e42e4c4e49854ae72cc42`, verified through inherited replacement `1bee438efe2a7fc4f9e3a399ccaf5ff27a465331`) | The finish review's stale `Confirmed sets` copy, and one production-visibility rule for both test-support routes so the browser suite runs one server | `T-037` `Done`; readiness answers 5 and 6 accepted |
| 4 | [`T-045`](../tasks/T-045-verify-cross-feature-persistence.md) — Verify cross-feature persistence and non-reinterpretation (`Done`; approved delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6`, verified through inherited replacement `a65a504b64482384c022175230176e983af66ce8`) | The release evidence for `MVP-REL-003` and `MVP-REL-004` as one browser scenario | `T-043`, `T-044` |
| 5 | [`T-046`](../tasks/T-046-verify-phone-interaction-and-affordances.md) — Verify phone interaction, affordances, and destructive confirmation (`Done`; approved delivery `300db8bed59d9ce62057064a0dea51ed3ae054e0`, verified through inherited replacement `5c07096fb34801166ddb798345e3fd1b9eb3e117`) | The release evidence for `MVP-UX-001`–`003` as one sweep over every route at four widths | `T-043`, `T-044` |
| — | [`T-047`](../tasks/T-047-compare-against-accepted-visual-references.md) — Compare against the accepted visual references (`Canceled` on `2026-09-06`) | Nothing; the Owner makes the comparison themselves and `T-048` records what they report | Not applicable |
| 6 | [`T-050`](../tasks/T-050-correct-the-reorder-and-current-set-language.md) — Correct the reorder affordance and the current-set sentence (`Done`; approved delivery `17b12f4233282af479501fc9d0af50052d9ca39a`) | The drag-handle requirement in five sentences across four documents, and the current-set sentence ADR-0027 left behind | `T-046`'s finding `R3`; lands before `T-046` delivers |
| 7 | [`T-048`](../tasks/T-048-run-release-verification-and-close-local-mvp.md) — Run the release verification and close the Local MVP | One complete suite run against one approved tree, the filled matrix, the recorded visual-comparison outcome, the documentation sweep, and the `F-010` and `M-001` completion records | `T-043`–`T-046`, `T-050`; the Owner's comparison result |

`T-043` came first because it was the only Task that made the remaining scope observable: until each criterion's existing evidence and gap was written down, `T-045` and `T-046` would have been verifying by assumption. It earned its place immediately by finding three sentences that contradicted accepted decisions, which `T-049` now corrects — before `T-046` verifies the navigation rule, so the sweep reads a criterion that matches the application. `T-044` comes before the two verification Tasks because both run on the browser harness whose rule it settles, and because the release sweep should not read a screen that still contradicts an accepted decision.

## Visual fidelity is the Owner's own

On `2026-09-06` the Owner took the accepted-reference visual comparison on themselves (`t-047 zanemari, sam ću napraviti vizualnu usporedbu`), so `F-010` allocates no Task for it and `T-047` is `Canceled`. The Feature's fidelity acceptance criterion is still satisfied through evidence, not assumption: `T-048` records the comparison the Owner reports — its date, what it covered, its outcome, and any deviation they accept — and claims no comparison the repository ran.

Three findings from the canceled Task's analysis are the input that comparison needs, and they are recorded here so they are not lost with it:

- the accepted package itself records under `PF-FIND-017` and Owner decision `OD-015` that the 404 PNGs were exported from the `v0.3` source and were **not** re-exported, and that the `v0.4` corrections change rendered pixels on **every** screen, so a raw pixel diff fails everywhere for an already-accepted reason; the manifest moves authority for color and cue placement to the `v0.4` tokens and specifications, and leaves geometry, spacing, type, copy, and chart geometry with the PNGs;
- 19 of the 202 frames depict states the project has since removed — 16 archiving and reactivation frames under [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), and the three `O02` per-set mode-chooser frames that `MVP-WRK-003` and [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md), [ADR-0026](../../decisions/0026-two-exercise-types-with-assistance-under-bodyweight.md), and [ADR-0027](../../decisions/0027-a-set-is-recorded-by-its-values.md) replaced — leaving 183 frames whose state the application still has;
- every reference is named `chromium151` and Playwright `1.62.1` bundles Chromium `151.0.7922.34`, an exact engine match at the two fixed references; the package holds no WebKit reference, which the `v0.4` manifest already records as an accepted limitation.

## Readiness answers

The Owner confirmed the breakdown and every remaining recommendation on `2026-09-06` (`ostalo potvrđujem da je ok`), which decides questions 5 through 7. Questions 1 through 4 existed only to define `T-047` and are withdrawn with it; their substance is recorded above for the Owner's own comparison. The Task named in the last column records each accepted answer in canonical documentation as part of its delivery.

| # | Question | Accepted answer | Recorded by |
| --- | --- | --- | --- |
| 5 | The finish review still says `Confirmed sets count toward exercise personal records and charts.`, the last sentence anywhere that predates ADR-0027. `T-037` found it and left it to the Owner. | Reword it to the recorded-set wording the rest of the screen uses. It changes copy only; the locked criteria text is unaffected. | `T-044` |
| 6 | `T-037` left one rule open for the two test-support routes: the durability harness is hidden in production, the mobile-UI-foundation harness has no guard, and that difference is why the browser suite starts a second development server. | Give both one rule — hidden unless an explicit opt-in environment flag is set — set the flag for the suite's own production server, and return the suite to one server with two projects. Record it as `ADR-0029`, because it changes what a production build exposes. | `T-044` |
| 7 | Does `F-010` re-run every criterion's verification, or cite what already passed? | Cite. Each criterion already passed an authorized verification against its own approved delivery, and those records are durable. `T-048` runs the complete suite once against one approved tree, which is the thing no earlier run could prove: that the Features hold together. | `T-043`, `T-048` |

## Accepted local decisions

Accepted with the same confirmation on `2026-09-06`. The Executor records each in canonical documentation during the Task that touches it:

- the release verification matrix is a new canonical document at `docs/project/mvp-release-verification.md`, routed from [`../../INDEX.md`](../../INDEX.md); it is a verification record, not product specification, so it does not touch the locked criteria document;
- the matrix cites evidence by approved SHA and Task link rather than restating results, so it cannot drift from the Task files that own them;
- `T-045` and `T-046` add browser scenarios and no application code; a defect either one finds is corrected as an in-scope replacement under ADR-0028 when it stays inside the Task, and becomes its own Task when it does not;
- the accepted-reference visual comparison is the Owner's, performed outside the managed Task flow; `T-048` records its outcome as reported and never restates it as a repository run;
- `T-046` derives its route inventory from the application rather than a hand-written list, so a route added later cannot escape the sweep;
- the four sweep widths are 320, 360, 390, and 430 CSS pixels: the accepted reflow range's ends plus the two fixed references;
- every `F-010` scenario follows the `T-037` harness rules — one worker, the production server, hydration awaited before the first entry after a navigation, and every row it creates removed;
- verification runs in a fresh isolated worktree at the exact approved delivery, with `npm run db:snapshot` before and `npm run db:restore` after, as every Feature since `F-013` has done;
- the `T-003-v1` outbound package is annotated as superseded where accepted decisions have moved past it, never rewritten; it records what was sent to the designer on `2026-08-26`;
- `F-010` introduces no product behavior. If a verification Task finds behavior that must change rather than a test that must change, it stops and the Owner decides, because a behavior change at release level is a new Task and possibly a new Feature.

## Dependencies and blockers

- Dependencies: `F-003` through `F-009` and `F-011` through `F-014` are `Done`, so every screen, operation, and verification this Feature reads exists; the Owner's own visual comparison, which `T-048` records
- Blockers: None; the Owner gave the go-ahead on `2026-09-06` (`kreni`) and `T-043` is `In Progress`

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0005](../../decisions/0005-documentation-as-system-of-record.md), [ADR-0006](../../decisions/0006-approval-gated-feature-testing.md), [ADR-0015](../../decisions/0015-readiness-and-completion-gates.md), [ADR-0021](../../decisions/0021-delivery-and-evidence-commit-model.md), [ADR-0022](../../decisions/0022-versioned-external-design-handoff.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), [ADR-0028](../../decisions/0028-replacements-inherit-task-approval.md), and new `ADR-0029` if the Owner accepts readiness answer 6
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../process/design-collaboration.md`](../../process/design-collaboration.md), [`../../process/development-governance.md`](../../process/development-governance.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../../design/T-004-v0.4-frozen/README.md`](../../design/T-004-v0.4-frozen/README.md), [`../../design/T-003-v1/README.md`](../../design/T-003-v1/README.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified (`T-043` through `T-046` and `T-048`; `T-047` is `Canceled`); `T-043` is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner answered the readiness questions, confirmed the breakdown, and gave the go-ahead on `2026-09-06`

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-08-25T16:35:55+02:00` | Codex primary agent / Planner | Created in `Next` | Reserve explicit ownership for cross-feature persistence, mobile interaction, and final accepted verification |
| `2026-09-05T20:09:42+02:00` | User / Owner | Moved `Next / 8` to `Next / 5` | Reconfirmed the order `F-013`, `F-014`, `F-012`, `F-008` after `F-013` became the current focus |
| `2026-09-05T20:24:07+02:00` | User / Owner | Moved `Next / 5` to `Next / 4` | `F-014` became the current focus once `F-013` was confirmed |
| `2026-09-05T21:27:54+02:00` | User / Owner | Moved to `Next / 3` | `F-014` was confirmed, so `F-012` becomes the current focus |
| `2026-09-06T14:36:00+02:00` | Claude Code primary agent / Planner | Recorded the six-Task breakdown `T-043`–`T-048` in `Backlog`, seven readiness questions with recommended answers, and the proposed local decisions | The Owner asked for the `F-010` Tasks; nothing is committed, locked, or started before their separate go-ahead |
| `2026-09-06T14:52:00+02:00` | User / Owner | Canceled `T-047` and took the visual comparison on themselves; confirmed the rest of the breakdown and every remaining recommendation | Replied `t-047 zanemari, sam ću napraviti vizualnu usporedbu. ostalo potvrđujem da je ok`, which decides readiness answers 5 through 7 and the local decisions and leaves five required Tasks |
| `2026-09-06T15:04:00+02:00` | User / Owner | Released `F-010` and started `T-043` | Gave the go-ahead (`kreni`) after the breakdown was locked; the record precedes the verification, so the matrix is first |
| `2026-09-06T15:16:00+02:00` | Claude Code primary agent / Executor | Delivered `T-043` for review | Exact delivery `d79c08f5bfe3a8e7c796fdd9bb0fe943dea9c601` awaits the Owner's approval; it records two findings, `R1` and `R2`, that need their product decision |
| `2026-09-06T15:24:00+02:00` | User / Approver | Approved `T-043` and decided both findings | `R1`: the bottom navigation must always be visible, so `MVP-REL-002` is corrected rather than the application; `R2`: there is no archiving, so the `MVP-PRG-007` heading follows its body |
| `2026-09-06T15:24:00+02:00` | Claude Code primary agent / Planner | Completed `T-043` and opened `T-049` in `Ready` | `test_required` was `no` and the Owner approved that reason; the criteria document is locked, so its corrections take their own Task instead of hiding in an evidence commit |
| `2026-09-06T15:34:00+02:00` | Claude Code primary agent / Executor | Delivered `T-049` for review | Exact delivery `6cffc618d03198b576374b71db47a6156a2a296d` carries both Owner decisions into the locked criteria document, corrects the architecture document's surviving focused-shell claim, and closes the ADR-0025 omission |
| `2026-09-06T15:40:00+02:00` | User / Approver | Approved `T-049`; completed it | Approved exact delivery `6cffc618d03198b576374b71db47a6156a2a296d` (`odobreno`); `test_required` was `no`, so the criteria corrections are closed and `T-044` starts |
| `2026-09-06T15:54:00+02:00` | Claude Code primary agent / Executor | Delivered `T-044` for review | Exact delivery `f2a46162b80e747c369e42e4c4e49854ae72cc42` rewords the finish review and gives both test-support routes one rule as `ADR-0029`; it awaits the Owner's approval before any feature test runs |
| `2026-09-06T15:58:00+02:00` | User / Approver | Approved `T-044` | Authorized the unit, component, and whole-browser-suite verification against exact delivery `f2a46162b80e747c369e42e4c4e49854ae72cc42` |
| `2026-09-06T16:12:00+02:00` | Claude Code primary agent / Tester | Completed `T-044` | The complete plan passed against inherited replacement `1bee438efe2a7fc4f9e3a399ccaf5ff27a465331`: unit 237/237, components 4/4, and the whole browser suite 38/38 on one production server, the durability spec included for the first time |
| `2026-09-06T16:20:00+02:00` | Claude Code primary agent / Executor | Started `T-045` | The record and the corrections are done, so the two release criteria no single Feature could prove come next |
| `2026-09-06T16:46:00+02:00` | Claude Code primary agent / Executor | Delivered `T-045` for review | Exact delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6` prepares the two release scenarios for `MVP-REL-003` and `MVP-REL-004`; it awaits the Owner's approval before either runs |
| `2026-09-06T16:52:00+02:00` | User / Approver | Approved `T-045` | Authorized both release scenarios against exact delivery `e59d513da9db55f36655bb3ef9ceb5b3438b90f6` |
| `2026-09-06T17:04:00+02:00` | Claude Code primary agent / Tester | Completed `T-045` | The complete plan passed against inherited replacement `a65a504b64482384c022175230176e983af66ce8`; `MVP-REL-003` and `MVP-REL-004` now carry release evidence and the whole browser suite passed 42/42 |
| `2026-09-06T17:32:00+02:00` | User / Owner | Decided finding `R3` and opened `T-050` | The named arrow controls are the correct reorder affordance, so five sentences move to them; the current-set sentence is an ADR-0027 leftover and goes |
| `2026-09-06T17:32:00+02:00` | Claude Code primary agent / Executor | Delivered `T-050` for review | Exact delivery `17b12f4233282af479501fc9d0af50052d9ca39a`; `T-046` delivers against the corrected criteria once it is approved |
| `2026-09-06T17:40:00+02:00` | User / Approver | Approved `T-050`; completed it | `test_required` was `no`; the criteria now describe the delivered affordance, so `T-046` can assert it |
| `2026-09-06T17:50:00+02:00` | Claude Code primary agent / Executor | Delivered `T-046` for review | Exact delivery `300db8bed59d9ce62057064a0dea51ed3ae054e0` sweeps all 29 routes for the last three open criteria; it awaits the Owner's approval before it runs |
| `2026-09-06T17:56:00+02:00` | User / Approver | Approved `T-046` | Authorized the sweep against exact delivery `300db8bed59d9ce62057064a0dea51ed3ae054e0` |
| `2026-09-06T18:06:00+02:00` | Claude Code primary agent / Tester | Completed `T-046`; all 57 criteria are covered | The sweep passed 10/10 with no application defect, the whole suite 52/52; only the release run and the Owner's visual comparison remain, which `T-048` records |
| `2026-09-06T18:24:00+02:00` | Claude Code primary agent / Executor | Started and delivered `T-048` for review | Exact delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb` sweeps the documentation; its approval authorizes the release run, and the Owner's visual comparison and the two completion records follow as evidence |
| `2026-09-06T18:30:00+02:00` | User / Approver | Approved `T-048` | Authorized the complete suite against exact delivery `9d8648d8dfd2acdc24cf60f8731d57821d6d75fb` |
| `2026-09-06T18:44:00+02:00` | Claude Code primary agent / Tester | Recorded the release run | 489 checks across five suites passed against one approved tree on the first attempt, with matching generated types and a database identical to its baseline; only the Owner's visual comparison remains |
