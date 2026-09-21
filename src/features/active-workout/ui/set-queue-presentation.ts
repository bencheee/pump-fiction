import { isSetRecorded, setModeFields } from "../domain/set-entry";
import type { WorkoutExercise, WorkoutSet } from "../domain/workout";
import type { ExerciseLoadMode } from "@/features/exercises/domain/exercise";

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
export function loadColumnFor(
  ...values: readonly (number | null)[]
): readonly number[] {
  const extra = values.filter(
    (value): value is number =>
      value !== null && !loadColumnBase.includes(value),
  );
  if (extra.length === 0) return loadColumnBase;
  return [...new Set([...loadColumnBase, ...extra])].sort(
    (left, right) => left - right,
  );
}

/**
 * The reps column. The prototype stops at 40 because nothing it prescribes goes
 * past it; the application measures some exercises in seconds and prescribes
 * ranges like 30–60, so the column runs to whichever is higher — the
 * prototype's 40, the exercise's own maximum, or the value already entered.
 */
export function repsColumnFor(
  maxReps: number | null,
  ...values: readonly (number | null)[]
): readonly number[] {
  const top = Math.max(
    repsColumnTop,
    maxReps ?? 0,
    ...values.map((v) => v ?? 0),
  );
  return Array.from({ length: top }, (_unused, index) => index + 1);
}

/** Where the load column sits while the set holds no load (`kgIdx`, line 3154). */
export const loadFallbackIndex = 0;

/** And the reps column (`repsIdx`, line 3155, which reads 8 for a null). */
export function repsFallbackIndex(column: readonly number[]): number {
  return Math.max(0, column.indexOf(8));
}

/**
 * `${planned} × ${min}–${max}` — what the exercise prescribes, or null when it
 * prescribes nothing: a one-time workout and an exercise added to this one have
 * no prescription, which the prototype has no notion of. A seconds-measured
 * exercise keeps its unit, as step 2 settled.
 */
export function prescriptionText(exercise: WorkoutExercise): string | null {
  if (
    exercise.plannedSets === null ||
    exercise.minReps === null ||
    exercise.maxReps === null
  )
    return null;
  const unit = exercise.measurementType === "seconds" ? " sec" : "";
  return `${exercise.plannedSets} × ${exercise.minReps}–${exercise.maxReps}${unit}`;
}

/** `setChip` (line 3347). The prescription tail is dropped when there is none. */
export function setChipText(
  exercise: WorkoutExercise,
  set: WorkoutSet,
): string {
  const position = `Set ${set.position} of ${exercise.sets.length}`;
  const prescription = prescriptionText(exercise);
  return prescription === null
    ? position
    : `${position} · ${prescription} planned`;
}

export type SuggestedSetValues = Readonly<{
  loadKg: number | null;
  reps: number | null;
}>;

const noSuggestion: SuggestedSetValues = { loadKg: null, reps: null };

function carriesValues(set: WorkoutSet): boolean {
  return set.loadKg !== null || set.reps !== null;
}

/*
 * What the wheels offer on a set that holds nothing yet (Owner, 2026-09-21).
 *
 * The prototype never needs this: its seed fixtures and `addPicked` (line
 * 3444) give every set a kilogram and a repetition count the moment it exists,
 * so a set always arrives with numbers on it. `add_exercise` and `add_set` give
 * a set none, and the application knows where the numbers would have come
 * from — the last set that carried any, which is the one before this one in
 * this workout, or failing that the last set of the exercise's previous
 * performance.
 *
 * The load only carries when it still means the same thing: kilograms on the
 * bar are not kilograms hung from a belt, so the source set's load field has
 * to match this set's. Repetitions always carry.
 */
export function suggestedValuesFor(
  exercise: WorkoutExercise,
  setIndex: number,
  mode: ExerciseLoadMode,
): SuggestedSetValues {
  const field = setModeFields[mode].load;
  const take = (set: WorkoutSet): SuggestedSetValues => ({
    loadKg:
      field !== null &&
      set.loadMode !== null &&
      setModeFields[set.loadMode].load === field
        ? set.loadKg
        : null,
    reps: set.reps,
  });

  for (let index = setIndex - 1; index >= 0; index -= 1) {
    const candidate = exercise.sets[index];
    if (candidate !== undefined && carriesValues(candidate))
      return take(candidate);
  }

  const previous = exercise.lastPerformance;
  if (previous !== null)
    for (let index = previous.sets.length - 1; index >= 0; index -= 1) {
      const candidate = previous.sets[index];
      if (candidate !== undefined && carriesValues(candidate))
        return take(candidate);
    }

  return noSuggestion;
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

/*
 * ----- The set-logging flow, step 7 -------------------------------------
 *
 * Prototype sources, read through the Claude Design MCP:
 *   `afterLog`      lines 1898-1907
 *   `nextTarget`    lines 1886-1896
 *   `startHandoff`  lines 1909-1926
 *
 * `done` is read as `recorded` throughout, as everywhere else on this screen.
 */

/**
 * `nextTarget()` (1886): the first set still without values in an exercise
 * after this one, wrapping to the start when there is none. It is undefined
 * only when every set of the workout is recorded.
 */
export function nextTargetFor(
  flat: readonly FlatSet[],
  current: FlatSet,
): FlatSet | undefined {
  return (
    flat.find(
      (entry) => entry.exerciseIndex > current.exerciseIndex && !entry.recorded,
    ) ?? flat.find((entry) => !entry.recorded)
  );
}

/** What `afterLog()` does with the press, once the set has taken its values. */
export type LoggedOutcome =
  /** No set is left without values: the Workout complete screen. */
  | Readonly<{ kind: "complete" }>
  /** This exercise is finished and the next set is in another one. */
  | Readonly<{ kind: "handoff"; done: FlatSet; next: FlatSet }>
  /** Everything else: the pointer moves, as `advance()` (1871) moves it. */
  | Readonly<{ kind: "advance" }>;

/**
 * `afterLog()` (1898). `flat` is the workout as it stands *after* the press has
 * written whatever the wheels were offering, so a set the press could not fill
 * — one with nothing to offer — is still not recorded and the outcome is the
 * plain advance step 6 shipped.
 */
export function outcomeAfterLog(
  flat: readonly FlatSet[],
  current: FlatSet | undefined,
): LoggedOutcome {
  if (current === undefined) return { kind: "advance" };
  const target = nextTargetFor(flat, current);
  if (target === undefined) return { kind: "complete" };
  const exerciseComplete = flat
    .filter((entry) => entry.exerciseIndex === current.exerciseIndex)
    .every((entry) => entry.recorded);
  return exerciseComplete && target.exerciseIndex !== current.exerciseIndex
    ? { kind: "handoff", done: current, next: target }
    : { kind: "advance" };
}

/** What the Exercise handoff screen holds, the way `s.handoff` (1912) holds it. */
export type HandoffView = Readonly<{
  doneName: string;
  doneMeta: string;
  chips: readonly Readonly<{ key: string; text: string }>[];
  nextName: string;
  nextSet: string;
  /** Null for an exercise with no prescription; the prototype has no such one. */
  nextMeta: string | null;
  /** Where `finishHandoff()` (1928) puts the pointer. */
  next: FlatSet;
}>;

/** `startHandoff(doneEx, target)` (1909). */
export function handoffViewFor(
  flat: readonly FlatSet[],
  done: FlatSet,
  next: FlatSet,
  chipText: (entry: FlatSet) => string,
): HandoffView {
  const chips = flat
    .filter(
      (entry) => entry.exerciseIndex === done.exerciseIndex && entry.recorded,
    )
    .map((entry) => ({ key: entry.set.id, text: chipText(entry) }));
  const donePrescription = prescriptionText(done.exercise);
  const nextPrescription = prescriptionText(next.exercise);

  return {
    doneName: done.exercise.exerciseName,
    doneMeta: `${chips.length} set${chips.length === 1 ? "" : "s"} recorded${
      donePrescription === null ? "" : ` · planned ${donePrescription}`
    }`,
    chips,
    nextName: next.exercise.exerciseName,
    nextSet: `Set ${next.setIndex + 1} of ${next.exercise.sets.length}`,
    nextMeta: nextPrescription === null ? null : `${nextPrescription} planned`,
    next,
  };
}
