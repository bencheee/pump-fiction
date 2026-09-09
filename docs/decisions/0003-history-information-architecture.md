# ADR-0003: History information architecture

- **Status:** Superseded in part by [ADR-0030](0030-body-is-its-own-destination.md)

## Context

Workout records, exercise progress, split duration, weight, and body measurements are different views of historical progress. Scattering statistics into template libraries would blur definitions with outcomes and complicate navigation.

## Decision

The original decision grouped all historical data and statistics under one **History** bottom-navigation destination with five subsections: Workouts, Exercises, Splits, Weight, and Body. ADR-0030 later moved Weight and Body to their own **Body** destination; History now contains Workouts, Exercises, and Splits.

The Exercise Library remains a definition catalog and Programs remains the template/rotation area; neither owns performance statistics.

## Consequences

- Workout and performance history remain grouped in one predictable destination.
- Exercise and split detail views can link back to underlying workouts.
- Template screens remain focused on future behavior.
- History and Body each need subsection navigation that remains practical on phone screens.

## Related documents

- [`../product/history-and-statistics.md`](../product/history-and-statistics.md)
- [`../product/weight-and-body.md`](../product/weight-and-body.md)
- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../ux/wireframe-decisions.md`](../ux/wireframe-decisions.md)
