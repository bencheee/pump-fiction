# Product overview

## Purpose and scope

The application is a private progress tracker for one gym user. It records planned and ad hoc workouts, set-level performance, exercise progress, body weight, and user-defined body measurements. “Pump Fiction” is the repository's working title; the user-facing app name remains open.

It is exclusively a phone experience. Nutrition and calorie tracking are explicitly out of scope. Features not present in these canonical documents are not part of the agreed MVP unless the user accepts them.

The product boundary is recorded by [ADR-0001](../decisions/0001-private-mobile-only-app.md). Current phase and open questions live in [`PROJECT_STATE.md`](../PROJECT_STATE.md).

## Primary navigation

The persistent bottom navigation has exactly four destinations:

1. **Today**
2. **History**
3. **Programs**
4. **Exercises**

An active workout is a separate focused experience without the standard bottom navigation. Detailed navigation behavior is canonical in [`mobile-information-architecture.md`](../ux/mobile-information-architecture.md).

## Today

Today shows:

- today's date;
- the next split in the active program rotation;
- that split's average duration when completed historical data exists;
- the primary **Start Workout** action;
- **Choose Another Split**;
- **One-Time Workout**;
- today's weight entry when one has not yet been recorded.

**Choose Another Split** applies only to today's workout. It neither changes nor advances the future rotation.

**One-Time Workout** accepts an arbitrary name and exercises selected from the active exercise library. It is not attached to a split and does not affect rotation. Its exercise performances still contribute to exercise statistics, while it does not contribute to split statistics.

Rotation rules are canonical in [`programs-and-splits.md`](programs-and-splits.md#rotation). Workout behavior is in [`workouts.md`](workouts.md), and weight entry rules are in [`weight-and-body.md`](weight-and-body.md#weight-tracker).

## Accepted release boundary

Automatic saving and reliable restoration of the active workout are functionally required in the local MVP.

Export/backup, PWA installation, and explicit protection against accidentally closing an active workout are accepted post-MVP capabilities. Production-access protection is required before deployment but is not part of the local MVP. Their exact mechanisms remain open in [`PROJECT_STATE.md`](../PROJECT_STATE.md).
