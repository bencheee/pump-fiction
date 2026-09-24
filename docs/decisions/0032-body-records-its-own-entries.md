# ADR-0032: Body records its own entries, for today or an earlier date

- **Status:** Accepted

## Context

[ADR-0030](0030-body-is-its-own-destination.md) made Body a destination of its own and split entry from reading: Today created the day's weigh-in and measurements, Body only read and corrected them, and a day not entered on the day stayed unrecorded. The Owner accepted that cost on 2026-09-06.

The second redesign ported the Owner's own prototype screen by screen. Its Today carries no weight or measurement card, and the Owner took both off Today in step 2 (2026-09-20). From then on nothing in the application could create an entry. The prototype enters them on Body instead, in one entry panel that opens on today, offers a date picker, and says *An earlier date is fine. A future one is not.* Steps 18 to 20 ported that panel.

With the choice in front of them — Body entry for any past date, Body entry locked to today, or the Today cards back with Body read-only — the Owner chose Body entry for today or any earlier date on 2026-09-24.

## Decision

**Body records its own entries.** The Weight tab's `Add`, a measurement's `Record measurement`, and the Measurements tab's `Add measurement` open one Body entry panel. It creates a weigh-in, a measurement's entry, or a measurement, and it corrects and deletes what exists.

**Any date up to today.** The panel opens on today. Its date picker offers every earlier day and no later one, and the server refuses a future date as it always has. A day that was missed can be filled in afterwards.

**One value per day still holds.** A save onto a date that already holds a value corrects that value rather than adding a second, as the prototype's own save does.

**Today carries no weight or measurement card.** The day's entry is reached from Body.

This supersedes the part of ADR-0030 that makes Body read-only, gives entry to Today, and leaves a missed day unrecorded. What ADR-0030 decided about Body as a fifth destination with its own two tabs, and about centimetres as a label rather than a field, is unchanged.

## Consequences

- `MVP-WGT-001`, `MVP-BOD-002`, `MVP-TOD-004` and `MVP-TOD-005` change with this decision.
- The transaction that recorded a whole day's missing measurements at once has no screen left. It stays in the application until it is removed deliberately.
- Retrospective entries recalculate weekly averages, changes and charts exactly as a correction always has.

## Related documents

- [ADR-0030](0030-body-is-its-own-destination.md), which this supersedes in part
- [`../product/weight-and-body.md`](../product/weight-and-body.md)
- [`../product/mvp-acceptance-criteria.md`](../product/mvp-acceptance-criteria.md)
- [`../design/redesign-v2/PLAN.md`](../design/redesign-v2/PLAN.md), steps 2 and 18 to 20
