# ADR-0003: History information architecture

- **Status:** Accepted

## Context

Workout records, exercise progress, split duration, weight, and body measurements are different views of historical progress. Scattering statistics into template libraries would blur definitions with outcomes and complicate navigation.

## Decision

Group all historical data and statistics under one **History** bottom-navigation destination with five subsections: Workouts, Exercises, Splits, Weight, and Body.

The Exercise Library remains a definition catalog and Programs remains the template/rotation area; neither owns performance statistics.

## Consequences

- Users have one predictable destination for past data and progress.
- Exercise and split detail views can link back to underlying workouts.
- Template screens remain focused on future behavior.
- History needs subsection navigation that remains practical on phone screens.

## Related documents

- [`../product/history-and-statistics.md`](../product/history-and-statistics.md)
- [`../product/weight-and-body.md`](../product/weight-and-body.md)
- [`../ux/mobile-information-architecture.md`](../ux/mobile-information-architecture.md)
- [`../ux/wireframe-decisions.md`](../ux/wireframe-decisions.md)
