"use client";

import { isSetRecorded } from "@/features/active-workout/domain/set-entry";
import type { CurrentWorkout } from "@/features/active-workout/domain/workout";
import { formatWorkoutClock } from "@/features/active-workout/ui/workout-presentation";
import { DestructiveDialog, Icon, Sheet } from "@/shared/ui";
import type { TransientOverlay } from "@/shared/ui";
import type { RefObject } from "react";

import "./review-finish-sheet.css";

/*
 * The Review & finish panel — the prototype's screen 30 — ported for step 6 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 1469-1503, `data-screen-label="Review and finish"`
 *   bound values  lines 3237-3241 (`outstanding`), 3484-3490
 *
 * It replaces the `/workout/current/finish` screen, which was the one place
 * the application drew this surface twice. `docs/product/workouts.md` already
 * describes it as "an in-place sheet from the current client workout
 * snapshot", which is what the prototype opens.
 *
 * Three things the application knows that the prototype does not:
 *
 *   - MVP-WRK-011 asks the review to *name* the planned sets left without
 *     values. `outstandingLabel` (3487) only counts them, so the names go in
 *     the same card under the count.
 *   - A one-time workout has no prescription, so it has no outstanding count
 *     at all; the prototype has no such workout.
 *   - The finish is a command that has to reach the server. The prototype's
 *     `finish()` (1940) is done the moment it is called.
 */
export function ReviewFinishSheet({
  workout,
  displaySeconds,
  overlay,
  returnFocusRef,
  submitting,
  onComplete,
  onDiscard,
  onOpenChange,
}: {
  workout: CurrentWorkout;
  displaySeconds: number;
  overlay: TransientOverlay;
  returnFocusRef?: RefObject<HTMLElement | null>;
  submitting: boolean;
  onComplete: () => void;
  onDiscard: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const recorded = workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.filter((set) => isSetRecorded(set.loadMode, set)).length,
    0,
  );
  // `outstanding` (line 3237): a planned set is one whose position is inside
  // the prescription, and it is outstanding while it holds no values.
  const outstanding = workout.exercises.flatMap((exercise) =>
    exercise.plannedSets === null
      ? []
      : exercise.sets
          .filter(
            (set) =>
              set.position <= (exercise.plannedSets ?? 0) &&
              !isSetRecorded(set.loadMode, set),
          )
          .map((set) => ({
            key: set.id,
            label: `${exercise.exerciseName} set ${set.position}`,
          })),
  );
  const isOneTime = workout.sourceKind === "one_time";

  return (
    <Sheet
      panel="review-finish"
      overlay={overlay}
      returnFocusRef={returnFocusRef}
      onOpenChange={onOpenChange}
      title="Review & finish"
    >
      {(close) => (
        <>
          <h2 data-panel-heading="">{workout.name}</h2>

          <dl data-review-stats="">
            <div data-review-stat="">
              <dt>Duration</dt>
              <dd>{formatWorkoutClock(displaySeconds)}</dd>
            </div>
            <div data-review-stat="">
              <dt>Exercises</dt>
              <dd>{workout.exercises.length}</dd>
            </div>
            <div data-review-stat="">
              <dt>Sets</dt>
              <dd>{recorded}</dd>
            </div>
          </dl>

          {outstanding.length > 0 ? (
            <div data-review-outstanding="">
              <p>
                <Icon name="circle-alert" size={15} />
                {outstanding.length} planned set
                {outstanding.length === 1 ? "" : "s"} left without values
              </p>
              <ul>
                {outstanding.map((entry) => (
                  <li key={entry.key}>{entry.label}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {isOneTime ? (
            <p data-review-note="">
              A one-time workout has no prescription, so none of its sets can be
              left planned without values.
            </p>
          ) : null}

          <div data-review-actions="">
            <button
              type="button"
              data-review-complete=""
              aria-label="Complete workout"
              disabled={submitting}
              onClick={onComplete}
            >
              <Icon name="check-check" size={19} />
              {submitting ? "Finishing…" : "Complete workout"}
            </button>
            <button
              type="button"
              data-review-continue=""
              aria-label="Continue workout"
              title="Continue workout"
              onClick={close}
            >
              Continue workout
            </button>
            <DestructiveDialog
              trigger={
                <button
                  type="button"
                  data-review-discard=""
                  aria-label="Discard workout"
                  title="Discard workout"
                  disabled={submitting}
                >
                  Discard workout
                </button>
              }
              title="Discard this workout?"
              description="Its entered sets and notes are lost, no History record is created, and rotation is unchanged."
              confirmLabel="Discard"
              onConfirm={onDiscard}
            />
          </div>
        </>
      )}
    </Sheet>
  );
}
