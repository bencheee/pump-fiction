import { isSetRecorded } from "../domain/set-entry";
import type { WorkoutExercise, WorkoutSet } from "../domain/workout";

/*
 * The values the Active set queue binds, ported from the prototype for step 4
 * of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   KG / REPS columns  lines 1686-1687
 *   renderVals()       lines 3147-3178 — `kgIdx`, `repsIdx`, segments
 *   up next            lines 3243-3256
 *   setChip            line 3347
 *
 * Where the prototype carries a `done` flag on each set, the application
 * derives the same state from the entered values (`isSetRecorded`), exactly as
 * `workout_set_is_recorded` derives it in the database.
 */

/** `const KG = 0…200 step 2.5` (line 1686). */
const loadColumnBase: readonly number[] = Array.from(
  { length: 81 },
  (_unused, index) => index * 2.5,
);

/** `const REPS = 1…40 step 1` (line 1687). */
const repsColumnTop = 40;

/**
 * The load column. The prototype's own, plus whatever the set already holds:
 * a workout restored with 1.25 kg on it must still show that value and be able
 * to return to it, and the prototype's grid has no such value on it.
 */
export function loadColumnFor(value: number | null): readonly number[] {
  if (value === null || loadColumnBase.includes(value)) return loadColumnBase;
  return [...loadColumnBase, value].sort((left, right) => left - right);
}

/**
 * The reps column. The prototype stops at 40 because nothing it prescribes goes
 * past it; the application measures some exercises in seconds and prescribes
 * ranges like 30–60, so the column runs to whichever is higher — the
 * prototype's 40, the exercise's own maximum, or the value already entered.
 */
export function repsColumnFor(
  maxReps: number | null,
  value: number | null,
): readonly number[] {
  const top = Math.max(repsColumnTop, maxReps ?? 0, value ?? 0);
  return Array.from({ length: top }, (_unused, index) => index + 1);
}

/** Where the load column sits while the set holds no load (`kgIdx`, line 3154). */
export const loadFallbackIndex = 0;

/** And the reps column (`repsIdx`, line 3155, which reads 8 for a null). */
export function repsFallbackIndex(column: readonly number[]): number {
  return Math.max(0, column.indexOf(8));
}

/** `setChip` (line 3347). The prescription tail is dropped when there is none. */
export function setChipText(
  exercise: WorkoutExercise,
  set: WorkoutSet,
): string {
  const position = `Set ${set.position} of ${exercise.sets.length}`;
  if (
    exercise.plannedSets === null ||
    exercise.minReps === null ||
    exercise.maxReps === null
  )
    return position;
  const unit = exercise.measurementType === "seconds" ? " sec" : "";
  return `${position} · ${exercise.plannedSets} × ${exercise.minReps}–${exercise.maxReps}${unit} planned`;
}

export type FlatSet = Readonly<{
  exercise: WorkoutExercise;
  set: WorkoutSet;
  exerciseIndex: number;
  setIndex: number;
  recorded: boolean;
}>;

export function flattenSets(
  exercises: readonly WorkoutExercise[],
  baseModeOf: (exercise: WorkoutExercise) => WorkoutSet["loadMode"],
): readonly FlatSet[] {
  return exercises.flatMap((exercise, exerciseIndex) =>
    exercise.sets.map((set, setIndex) => ({
      exercise,
      set,
      exerciseIndex,
      setIndex,
      recorded: isSetRecorded(set.loadMode ?? baseModeOf(exercise), set),
    })),
  );
}

export type UpNext = Readonly<{ kicker: string; text: string }>;

/** Lines 3243-3256, unchanged but for reading `recorded` instead of `done`. */
export function upNextFor(
  flat: readonly FlatSet[],
  exerciseCount: number,
  current: FlatSet | undefined,
): UpNext {
  const nothingLeft = "Nothing left — review and finish";
  if (current === undefined) return { kicker: "Up next", text: nothingLeft };

  const position = flat.findIndex((entry) => entry.set.id === current.set.id);
  const next = flat.slice(position + 1).find((entry) => !entry.recorded);
  const isLastExercise = current.exerciseIndex === exerciseCount - 1;

  if (next !== undefined && next.exerciseIndex === current.exerciseIndex)
    return {
      kicker: isLastExercise ? "Last exercise" : "Up next",
      text: `Set ${next.setIndex + 1} of ${next.exercise.sets.length} · ${next.exercise.exerciseName}`,
    };
  if (next !== undefined)
    return {
      kicker: "Up next",
      text: `${next.exercise.exerciseName} · set ${next.setIndex + 1} of ${next.exercise.sets.length}`,
    };
  return {
    kicker: isLastExercise ? "Last exercise" : "Up next",
    text: nothingLeft,
  };
}

/**
 * `advance()` (lines 1871-1884): the next set of this exercise if there is one,
 * otherwise the first set still without values, searching forward and wrapping.
 */
export function nextInQueue(
  flat: readonly FlatSet[],
  current: FlatSet | undefined,
): FlatSet | undefined {
  if (current === undefined) return flat.find((entry) => !entry.recorded);
  const withinExercise = flat.find(
    (entry) =>
      entry.exerciseIndex === current.exerciseIndex &&
      entry.setIndex === current.setIndex + 1,
  );
  if (withinExercise !== undefined) return withinExercise;
  return (
    flat.find(
      (entry) => entry.exerciseIndex > current.exerciseIndex && !entry.recorded,
    ) ?? flat.find((entry) => !entry.recorded)
  );
}
