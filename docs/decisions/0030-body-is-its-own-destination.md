# ADR-0030: Body is its own destination and today's values are entered on Today

- **Status:** Accepted

## Context

[ADR-0003](0003-history-information-architecture.md) grouped every historical record and statistic under one History destination, so weight and body measurements became two of its five subsections. `F-008` built that shell and `F-009` filled those two subsections with `S19` through `S24`.

Using the delivered application, the Owner found two things wrong with it on 2026-09-06.

Weight and body are not workout history. They are read on their own rhythm, they answer a different question, and reaching them costs two taps and a horizontal scroll through a tab bar that also carries Workouts, Exercises, and Splits. Frequency and subject both argue for a destination rather than a subsection.

And entry was scattered. Today already asks for the day's weigh-in, because `MVP-TOD-004` put it there; a measurement taken the same morning had to be entered through History instead, three screens away, on a form that asks which date it belongs to when the answer is always today.

## Decision

**Body becomes the fifth bottom-navigation destination**, holding Weight and Measurements as its own two tabs. History keeps Workouts, Exercises, and Splits.

**Body reads and corrects; it never creates.** The weigh-in list, the measurement list, and the measurement detail carry no add action, and the routes that created an entry are gone. An existing entry still opens, still saves a corrected value, and still deletes: a correction is not a creation, and a wrong number must remain fixable. Measurement **types** are still defined, renamed, and deleted in Body, because defining a measurement is not entering one.

**Today owns entry.** It already offers the day's weigh-in while the day has none; it now offers a `Body measurements` card on the same terms, taking every measurement that today is missing in one sheet. Both are fixed to the local date.

**A missed day cannot be filled in afterwards.** This is the accepted cost of the decision, not an oversight. Today only ever offers today, and Body creates nothing, so a weigh-in or a measurement not entered on its own day is not recorded later. The Owner accepted this on 2026-09-06 with the alternative — keeping retrospective creation in Body — in front of them.

**The unit stops being a field.** Every measurement is in centimetres, so the type form no longer shows a unit block; `cm` appears in the label under each measurement's name where a number is read or entered.

## Consequences

This supersedes the part of ADR-0003 that groups *all* historical records under History. What ADR-0003 decided about keeping records separate from templates is untouched and still governs.

It revises five locked criteria, each in the Task that delivers its change:

- `MVP-REL-002` — the bottom navigation carries five destinations, not exactly four;
- `MVP-HIS-001` — History contains Workouts, Exercises, and Splits;
- `MVP-WGT-001` — creation is Today's and is today's; Body corrects and deletes; retrospective creation is removed;
- `MVP-BOD-002` — the same move for measurement values;
- `MVP-BOD-001` — the type lifecycle is unchanged but the unit is no longer stated as its own thing.

`MVP-TOD-004` gains a sibling, `MVP-TOD-005`, for the measurement card. Nothing about derivation changes: `MVP-WGT-002`, `MVP-WGT-003`, `MVP-BOD-003`, and `MVP-BOD-004` keep their text, their weekly rules, and their charts, and the Weight tab keeps every summary and chart it had.

The four-destination rule was load-bearing in the delivered application: the shell, the mobile-UI-foundation browser spec, and the `T-046` route inventory all assert it. `T-052` changes them together, because a half-moved route surface is not reviewable.

Both design packages predate this decision and gain one more supersession row rather than a rewrite, as `T-048` established.

## Related documents

- [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md)
- [`../product/weight-and-body.md`](../product/weight-and-body.md)
- [`../product/overview.md`](../product/overview.md)
- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../project/features/F-015-body-destination-and-today-entry.md`](../project/features/F-015-body-destination-and-today-entry.md)
