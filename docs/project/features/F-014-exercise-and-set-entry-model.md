# F-014 — Exercise and Set-Entry Model Corrections

- **Milestone:** `M-001`
- **Owner:** User
- **Horizon:** `Now`
- **Order:** 1
- **Target date:** None
- **Created:** `2026-09-05T19:28:05+02:00`
- **Updated:** `2026-09-05T21:26:21+02:00`
- **Progress:** `2/2 required Tasks Done`
- **Blocked Tasks:** `0`
- **Awaiting approval Tasks:** `0`

## Outcome

An exercise is either weights or bodyweight, with assistance expressed as a bodyweight option, and a set is recorded by entering its values instead of by ticking a box.

## Scope

- Included: the exercise base types and their options, the disappearance of explicit set confirmation, and every canonical document, MVP criterion, database artifact, and screen those two changes touch.
- Excluded: History and statistics screens (`F-008`), weight and body progress (`F-009`), and any capability the Owner has not requested.

## Owner corrections

| # | Correction | Task |
| --- | --- | --- |
| 1 | Only `weights` and `bodyweight` types; assistance becomes a bodyweight option | `T-028` |
| 2 | No confirmation control; entered values are the record, and the set-number tick disappears | `T-029` |

## Accepted Owner decisions

Recorded on `2026-09-05`:

- a bodyweight exercise permits **at most one** of its four options: added weight, resistance band, assistance weight, assistance band;
- a set counts toward personal records and statistics when it holds **everything its mode requires**: kilograms and reps for weighted modes, reps for plain bodyweight, band strength and reps for band modes. A partially entered set is kept but does not count.

## Acceptance criteria

- Product criteria revised by this Feature: `MVP-EXE-001`, `MVP-EXE-003`, `MVP-EXE-004`, `MVP-WRK-003`, `MVP-WRK-004`, `MVP-WRK-011`, and the confirmed-set wording in `MVP-HIS-003`–`MVP-HIS-008` where it appears
- Product criteria that must keep passing unchanged: `MVP-EXE-002`, `MVP-EXE-005`–`MVP-EXE-008`, `MVP-WRK-001`–`MVP-WRK-002`, `MVP-WRK-005`–`MVP-WRK-010`, `MVP-WRK-012`
- Feature-specific criteria: the library offers exactly two types, a bodyweight exercise carries at most one option, no screen shows a confirmation control, and the finish review counts sets by completeness

## Tasks

- `T-028` — Merge assisted exercises into bodyweight options — `Done`
- `T-029` — Record a set by its entered values — `Done`

## Dependencies and blockers

- Dependencies: `F-011` is `Done`; both Tasks revise decisions it accepted
- Blockers: None

## Related decisions and documents

- ADRs to create: one superseding the type table in [ADR-0023](../../decisions/0023-simplified-exercise-load-mode-model.md), and one for the recorded-set model
- Canonical documents: [`../../product/exercises.md`](../../product/exercises.md), [`../../product/workouts.md`](../../product/workouts.md), [`../../product/history-and-statistics.md`](../../product/history-and-statistics.md), [`../../product/mvp-acceptance-criteria.md`](../../product/mvp-acceptance-criteria.md), [`../../architecture/domain-model.md`](../../architecture/domain-model.md), [`../../ux/wireframe-decisions.md`](../../ux/wireframe-decisions.md)

## Readiness

- [x] Outcome and boundaries are clear
- [x] Acceptance criteria are observable and linked
- [x] Required Tasks are identified
- [x] Dependencies and blockers are understood
- [x] Documentation impact is known
- [ ] Owner confirms readiness and the first `Ready` Task

## Completion

- [x] All required Tasks are `Done`
- [x] Feature acceptance criteria are satisfied
- [x] Canonical documentation is current
- [x] No required follow-up scope is hidden
- [ ] User confirms the feature result

## History

| Timestamp | Actor/role | Change | Reason |
| --- | --- | --- | --- |
| `2026-09-05T19:28:05+02:00` | User / Owner | Created `F-014` in `Next / 2` with both decisions recorded | Asked for two types with assistance under bodyweight, and for entered values to replace explicit confirmation |
| `2026-09-05T20:09:42+02:00` | User / Owner | Moved `Next / 2` to `Next / 1` | Reconfirmed the order `F-013`, `F-014`, `F-012`, `F-008` after `F-013` became the current focus |
| `2026-09-05T20:24:07+02:00` | User / Owner | Moved `F-014` to `Now / 1` and started it | Confirmed the `F-013` result and asked for the model corrections next |
| `2026-09-05T20:36:12+02:00` | Claude Code primary agent / Executor | `T-028` delivered `481ef7dc410733ad1b0502a8cea0a02ac53259bc` and entered review | The two-type model with assistance under bodyweight is ready for the Owner's review |
| `2026-09-05T21:01:46+02:00` | Claude Code primary agent / Executor | `T-028` returned to `In Progress` and delivered replacement `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` | The authorized run failed on exercise-form component tests the first delivery had not updated |
| `2026-09-05T21:05:10+02:00` | Claude Code primary agent / Tester | `T-028` verified and `Done` for `14fdd0ac8785127e2407584afd9a201aeaeb2cb2` | The two-type model is delivered and verified; `T-029` needs the Owner's confirmation of readiness |
| `2026-09-05T21:18:30+02:00` | Claude Code primary agent / Executor | `T-029` delivered `a64adcc3a1b547ac2af2ec9121c958653323d2f2` and entered review | Explicit set confirmation is removed and the recorded state is derived from the entered values |
| `2026-09-05T21:23:55+02:00` | Claude Code primary agent / Executor | `T-029` returned to `In Progress` and delivered replacement `9374b8c23f55882f4c813a3e9a761f26b291e2b5` | The authorized run exposed two component expectations the first delivery renamed without re-deriving what the new rule counts |
| `2026-09-05T21:26:21+02:00` | Claude Code primary agent / Tester | `T-029` verified and `Done` for `9374b8c23f55882f4c813a3e9a761f26b291e2b5` | Both corrections are delivered and verified; the Feature result awaits the Owner's confirmation |
