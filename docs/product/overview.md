# Product overview

## Purpose and scope

The application is a private progress tracker for one gym user. It records planned and ad hoc workouts, set-level performance, exercise progress, body weight, and user-defined body measurements. “Pump Fiction” is the repository's working title; the user-facing app name remains open.

It is exclusively a phone experience. Nutrition and calorie tracking are explicitly out of scope. Features not present in these canonical documents are not part of the agreed MVP unless the user accepts them.

The product boundary is recorded by [ADR-0001](../decisions/0001-private-mobile-only-app.md). Current phase and open questions live in [`PROJECT_STATE.md`](../PROJECT_STATE.md).

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
- the primary **Start Workout** action;
- **Choose Another Split**;
- **One-Time Workout**;
- today's weight entry when one has not yet been recorded, and once it exists the recorded value in its place;
- today's body measurements when any defined measurement has no value for the date, and once none is missing the recorded values in their place.

**Choose Another Split** applies only to today's workout. It neither changes nor advances the future rotation.

**One-Time Workout** accepts an arbitrary name and exercises selected from the active exercise library. It is not attached to a split and does not affect rotation. Its exercise performances still contribute to exercise statistics, while it does not contribute to split statistics.

Today is where a weigh-in and a measurement are created, and the only place they are. Each card offers its entry only while the local date is missing it, in a sheet fixed to that date; once the day is recorded, the same card shows the values with a link to Body and no create control, so Today never reads as though a second entry were possible. The measurement card takes every measurement the day is missing in one sheet, names which they are, and does not appear at all when no measurement type is defined.

Correcting or deleting an existing value happens in Body, never here — and a day that passed without an entry stays without one, which [ADR-0030](../decisions/0030-body-is-its-own-destination.md) accepted as the cost of keeping entry on the day it belongs to.

Rotation rules are canonical in [`programs-and-splits.md`](programs-and-splits.md#rotation). Workout behavior is in [`workouts.md`](workouts.md), and weight and measurement entry rules are in [`weight-and-body.md`](weight-and-body.md#weight-tracker).

## Accepted release boundary

Automatic saving and reliable restoration of the active workout are functionally required in the local MVP.

Export/backup, PWA installation, and explicit protection against accidentally closing an active workout are accepted post-MVP capabilities. Production-access protection is required before deployment but is not part of the local MVP. Their exact mechanisms remain open in [`PROJECT_STATE.md`](../PROJECT_STATE.md).
