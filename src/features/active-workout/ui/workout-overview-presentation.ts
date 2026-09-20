import type { WorkoutExercise } from "../domain/workout";
import type { FlatSet } from "./set-queue-presentation";

/*
 * The values the Start workout overview binds, ported from the prototype for
 * step 5 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup         lines 231-261, `data-screen-label="Start workout"`
 *   overview rows  lines 3187-3221 (`ex.meta`, `ex.metaColor`, `ex.bg`)
 *   screen values  lines 3351 (`overviewKicker`), 3435-3437
 *                  (`recordedSummary`, `resumeLabel`, `openAddExercise`)
 *
 * Where the prototype carries a `done` flag on each set, the application
 * derives the same state from the entered values, exactly as the queue does.
 */

/** `overviewKicker` (line 3351). */
export function overviewKicker(
  exerciseCount: number,
  setCount: number,
): string {
  const exercises = `${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"}`;
  return `${exercises} · ${setCount} set${setCount === 1 ? "" : "s"}`;
}

/**
 * `ex.meta` (line 3200). The prescription tail is dropped when there is none —
 * a one-time workout, or an exercise added to this one — the way `setChipText`
 * drops it, and a seconds-measured exercise keeps its unit, as Today's preview
 * does.
 */
export function overviewRowMeta(
  exercise: WorkoutExercise,
  recordedCount: number,
): string {
  const tally = `${recordedCount} of ${exercise.sets.length} recorded`;
  if (
    exercise.plannedSets === null ||
    exercise.minReps === null ||
    exercise.maxReps === null
  )
    return tally;
  const unit = exercise.measurementType === "seconds" ? " sec" : "";
  return `${exercise.plannedSets} × ${exercise.minReps}–${exercise.maxReps}${unit} · ${tally}`;
}

/** `recordedSummary` (line 3435), which does not pluralise its "sets". */
export function recordedSummaryText(
  recordedCount: number,
  setCount: number,
): string {
  return `${recordedCount} of ${setCount} sets recorded`;
}

/**
 * `resumeLabel` (line 3436). The prototype's `e` is the exercise the pointer
 * sits in and always has sets; the pointer here is a set, so the label reads
 * the set it resolved to.
 */
export function resumeLabelFor(
  recordedCount: number,
  current: FlatSet | undefined,
): string {
  if (recordedCount === 0) return "Start workout";
  if (current === undefined) return "Resume";
  return `Resume · set ${current.setIndex + 1} of ${current.exercise.sets.length}`;
}
