# Product overview

## Purpose and scope

The application is a private progress tracker for one gym user. It records planned and ad hoc workouts, set-level performance, exercise progress, body weight, and user-defined body measurements. “Pump Fiction” is the repository's working title; the user-facing app name remains open.

It is exclusively a phone experience. Nutrition and calorie tracking are explicitly out of scope. Features not present in these canonical documents are not part of the agreed MVP unless the user accepts them.

The product boundary is recorded by [ADR-0001](../decisions/0001-private-mobile-only-app.md). The application is implemented and deployed; these product documents describe its current behavior.

## Primary navigation

The persistent bottom navigation has exactly five destinations:

1. **Today**
2. **History**
3. **Programs**
4. **Exercises**
5. **Body**

An active workout opens its own screen and keeps the bottom navigation, so the user can look something up elsewhere and come back; see [ADR-0025](../decisions/0025-active-workout-in-the-main-shell.md). Detailed navigation behavior is canonical in [`mobile-information-architecture.md`](../ux/mobile-information-architecture.md).

## Today

Today shows:

- today's date;
- the next split in the active program rotation;
- every exercise in the split currently selected for today, in split order;
- that split's average duration when completed historical data exists;
- the primary **Start today's workout** action;
- **Another split**, which opens **Choose another split**;
- **One-Time Workout**.

**Another split** applies only to today's workout. It neither changes nor advances the future rotation.

**One-Time Workout** opens the Add exercise panel on the active exercise library, and the workout starts, named **One-time workout**, with the exercises the panel adds; closing the panel starts nothing. It is not attached to a split and does not affect rotation. Its exercise performances still contribute to exercise statistics, while it does not contribute to split statistics.

Today carries no weight or measurement card. Both are recorded in Body, for today or any earlier date, under [ADR-0032](../decisions/0032-body-records-its-own-entries.md).

Rotation rules are canonical in [`programs-and-splits.md`](programs-and-splits.md#rotation). Workout behavior is in [`workouts.md`](workouts.md), and weight and measurement entry rules are in [`weight-and-body.md`](weight-and-body.md#weight-tracker).

## Possible future additions

Automatic saving and reliable restoration of the active workout are core delivered behavior.

The following ideas are deliberately undecided and must not be inferred as requirements: PWA installation, backup/export UX and format, estimated 1RM, RIR/RPE, a rest timer, warm-up sets, explicit protection against accidentally closing an active workout, and the final application name.
