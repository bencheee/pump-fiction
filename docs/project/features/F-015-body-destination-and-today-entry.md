# F-015 — Body Destination and Today Entry

- **Milestone:** `M-002`
- **Owner:** User
- **Horizon:** `Next`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-06T19:10:00+02:00`
- **Updated:** `2026-09-06T19:34:00+02:00`
- **Progress:** `0/3 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

Weight and body measurements become their own bottom-navigation destination that reads and corrects but never creates, and everything for today is entered on Today.

## Scope

- Included: a fifth destination, `Body`, with Weight and Measurements as top tabs; the move of `S19`–`S24` out of History; the removal of every create action from those screens; the measurement card and sheet on Today; the unit shown in each measurement's label instead of its own section; and the revision of every criterion and document these contradict.
- Excluded: any change to how a weigh-in or a measurement is stored, derived, or charted; the Workouts, Exercises, and Splits subsections of History; goals, targets, and unit conversion.

## What the Owner asked for

Recorded from their request of `2026-09-06`, with the three answers they gave the same day:

- a new bottom-navigation destination, `Body`, with tabs at the top exactly as History has them;
- inside it, the weigh-in history and the measurements;
- **no creating** a weigh-in or a measurement value there. Measurement **types** can still be defined there;
- creating happens on Today, as today's weigh-in already does;
- no separate section stating that measurements are in centimetres — the unit belongs in the label under each measurement's name;
- History loses its Weight and Body tabs.

## Decisions the Owner gave on `2026-09-06`

| # | Question | Answer |
| --- | --- | --- |
| 1 | Can an existing entry still be corrected or deleted from Body? | Yes. Body creates nothing, but a row opens its entry so a wrong value can be fixed or removed. Retrospective **creation** goes: a missed day cannot be filled in afterwards. |
| 2 | How does Today take measurements? | One `Body measurements` card, shown while today is missing at least one measurement, opening one sheet that takes them all at once. It mirrors the weight card rather than multiplying cards per measurement. |
| 3 | What does the Weight tab keep? | Everything except the add action: the latest weigh-in, the weekly average, change and `n/7` count, the change from the previous weigh-in, the chart, and the list. `MVP-WGT-002` and `MVP-WGT-003` stand unchanged. |

## What this contradicts, and must revise

This is the reason `F-015` sits in `M-002` and not in `M-001`. Three locked criteria and one accepted ADR say the opposite of what the Owner asked for, and each has to be revised by decision rather than quietly outgrown:

| Says now | Must say | Where |
| --- | --- | --- |
| The bottom navigation exposes **exactly** Today, History, Programs, and Exercises | Five destinations, with Body among them | `MVP-REL-002` |
| History contains Workouts, Exercises, Splits, Weight, and Body | History contains Workouts, Exercises, and Splits | `MVP-HIS-001` |
| The user can create a weigh-in, defaulting to today, and retrospective dates are accepted | Creation is on Today and is today's; Body corrects and deletes | `MVP-WGT-001` |
| For each type, the user can create one value per local date, retrospective dates accepted | The same move | `MVP-BOD-002` |
| All historical records and statistics are grouped under History | Body is a peer destination; History keeps the workout record | [ADR-0003](../../decisions/0003-history-information-architecture.md) |

`MVP-TOD-004` gains a sibling for measurements, and `MVP-BOD-001` keeps the type lifecycle but loses the separate unit section. `MVP-WGT-002`, `MVP-WGT-003`, `MVP-BOD-003`, and `MVP-BOD-004` are untouched: nothing about derivation, weekly rules, or charts changes.

The loss worth naming: **a missed day can no longer be filled in.** Today only ever offers today, and Body no longer creates. If that matters, the Owner can keep retrospective creation in Body — it was answer 1's third option and it stays available until `T-051` is delivered.

## Tasks

Recorded on `2026-09-06` at the Owner's request, without committing or implementing anything. The criteria move first, so no Task implements against a document that contradicts it — the lesson `T-043` and `T-046` both paid for in `F-010`.

| Order | Task | Delivers | Depends on |
| --- | --- | --- | --- |
| 1 | [`T-051`](../tasks/T-051-accept-the-body-destination.md) — Accept the Body destination | The criteria revisions, `ADR-0030`, and every document that states the four-destination rule or puts weight and body under History | The Owner's go-ahead |
| 2 | [`T-052`](../tasks/T-052-build-the-body-destination.md) — Build the Body destination | The fifth destination with its two tabs, `S19`–`S24` moved and stripped of creation, History reduced to three subsections, the unit in the label, and every spec the move invalidates | `T-051` |
| 3 | [`T-053`](../tasks/T-053-add-todays-measurement-entry.md) — Add today's measurement entry | The `Body measurements` card and its sheet on Today, which is where the entry paths Body gave up now live | `T-051`, `T-052` |

`T-052` and `T-053` each carry their own tests, as every screen Task in this project has, so the suite is never left red between them. `T-052` is the larger: it moves six routes, removes four create paths, and breaks the foundation spec's four-destination assertion, `T-046`'s route inventory, and the `T-045` fixture.

## Proposed local decisions

Not decided. The Executor records each in canonical documentation during the Task that touches it, if the Owner accepts them with the go-ahead:

- the destination lives at `/body`, with `/body/weight` and `/body/measurements` as its tabs, and the six moved routes follow beneath them; the old `/history/weight` and `/history/body` paths are removed outright rather than redirected, because nothing outside this application links to them;
- the tab bar reuses the History subsection component rather than a second implementation of the same thing; it is generalized in `T-052` and History keeps its three tabs through it;
- no schema, migration, or generated-type change is expected: every read and write these screens need already exists from `T-038` and `T-041`. If the Today sheet needs a read that does not, it stays inside `T-053` rather than becoming a fourth Task;
- the Today card follows the weight card exactly — shown while something is missing for today, replaced by the recorded values and a link to Body once nothing is;
- the unit appears as `cm` in the label under each measurement's name on the list, the detail, and the entry screen, and the type form loses its unit block entirely;
- `S22` keeps creating, renaming, and deleting measurement types inside Body: defining a measurement is not entering one;
- the design packages gain one more supersession row, as `T-048` established, rather than being rewritten.

## Acceptance criteria

- The bottom navigation offers five destinations and Body opens on its Weight tab; History offers Workouts, Exercises, and Splits only.
- No screen under Body creates a weigh-in or a measurement value; every existing entry can still be corrected and deleted there.
- Today offers a `Body measurements` card while today lacks a measurement, takes them all in one sheet, and shows the recorded values with a link to Body once none are missing.
- No screen states the centimetre unit anywhere but in each measurement's label.
- Every revised criterion is revised in the Task that delivers its change, and the release verification matrix records the revision.

## Dependencies and blockers

- Dependencies: `M-001` complete, so what is being revised is known to work; `F-008` and `F-009` `Done`, which built every screen this Feature moves
- Blockers: None; the Owner confirmed `M-001` and gave the go-ahead on `2026-09-06`

## Related decisions and documents

- ADRs: [ADR-0001](../../decisions/0001-private-mobile-only-app.md), [ADR-0003](../../decisions/0003-history-information-architecture.md), [ADR-0024](../../decisions/0024-deletion-with-preserved-history.md), and new `ADR-0030` for the Body destination
- Canonical documents: [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../product/weight-and-body.md`](../../product/weight-and-body.md), [`../../product/overview.md`](../../product/overview.md), [`../../ux/mobile-information-architecture.md`](../../ux/mobile-information-architecture.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md), [`../../architecture/mobile-ui-foundation.md`](../../architecture/mobile-ui-foundation.md), [`../mvp-release-verification.md`](../mvp-release-verification.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified (`T-051` through `T-053`); `T-051` is `In Progress`
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [x] Owner confirmed readiness and gave the go-ahead on `2026-09-06`

## Completion

- [ ] All required Tasks are `Done`
- [ ] Feature acceptance criteria are satisfied
- [ ] Canonical documentation is current
- [ ] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-06T19:10:00+02:00` | Claude Code primary agent / Planner | Created in `Next` with the three-Task breakdown and the Owner's three answers | The Owner asked for a Body destination, entry moved to Today, and Weight and Body removed from History; nothing is committed or started before their go-ahead |
| `2026-09-06T19:34:00+02:00` | User / Owner | Released `F-015` and started `T-051` | Gave the go-ahead (`nastavi`) after confirming the `M-001` result; the criteria move before anything builds against them |
