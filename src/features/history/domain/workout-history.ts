import type {
  BandDirection,
  BandStrength,
} from "@/features/active-workout/domain/active-workout-command";
import type {
  WorkoutSet,
  WorkoutSourceKind,
} from "@/features/active-workout/domain/workout";
import type {
  ExerciseBaseType,
  ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";

/** History holds only saved workouts; the current one is not part of it. */
export type HistoryWorkoutStatus = "completed";

export type HistoryWorkoutSummary = Readonly<{
  id: string;
  workoutDate: string;
  name: string;
  programName: string | null;
  sourceKind: WorkoutSourceKind;
  status: HistoryWorkoutStatus;
  activeDurationSeconds: number;
  /** Occurrences holding at least one recorded set. */
  performedExerciseCount: number;
}>;

/** Calendar months, newest first, each holding its workouts newest first. */
export type HistoryMonthGroup = Readonly<{
  /** `YYYY-MM` in the configured local time zone. */
  month: string;
  workouts: readonly HistoryWorkoutSummary[];
}>;

export type HistoryWorkoutExercise = Readonly<{
  id: string;
  /** Never null, so performances group across renames, edits, and deletion. */
  exerciseIdentityId: string;
  /** Null once the definition is deleted; the snapshot below still stands. */
  exerciseId: string | null;
  stillInLibrary: boolean;
  position: number;
  exerciseName: string;
  exerciseBaseType: ExerciseBaseType;
  measurementType?: import("@/features/exercises/domain/exercise").ExerciseMeasurementType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
  plannedSets: number | null;
  minReps: number | null;
  maxReps: number | null;
  workoutNote: string;
  sets: readonly WorkoutSet[];
}>;

export type HistoryWorkout = Readonly<{
  id: string;
  status: HistoryWorkoutStatus;
  sourceKind: WorkoutSourceKind;
  sourceProgramId: string | null;
  sourceSplitId: string | null;
  sourceProgramIdentityId: string | null;
  sourceSplitIdentityId: string | null;
  programName: string | null;
  splitName: string | null;
  name: string;
  workoutDate: string;
  startedAt: string;
  finishedAt: string;
  /**
   * The measured active duration. Editing the timestamps deliberately leaves it
   * alone: paused wall-clock time cannot be reconstructed afterwards.
   */
  activeDurationSeconds: number;
  exercises: readonly HistoryWorkoutExercise[];
}>;

/**
 * One historical correction. Each is applied atomically and none of them
 * touches a split template or a rotation pointer.
 */
export type HistoryCorrection =
  | Readonly<{
      kind: "timing";
      workoutId: string;
      workoutDate: string;
      startedAt: string;
      finishedAt: string;
    }>
  | Readonly<{ kind: "exercise_note"; workoutExerciseId: string; note: string }>
  | Readonly<{
      kind: "update_set";
      workoutSetId: string;
      loadMode: ExerciseLoadMode | null;
      loadKg: number | null;
      bandDirection: BandDirection | null;
      bandStrength: BandStrength | null;
      reps: number | null;
    }>
  | Readonly<{ kind: "add_set"; workoutExerciseId: string }>
  | Readonly<{
      kind: "remove_set";
      workoutSetId: string;
      confirmedPopulatedRemoval: boolean;
    }>
  | Readonly<{ kind: "add_exercise"; workoutId: string; exerciseId: string }>
  | Readonly<{
      kind: "remove_exercise";
      workoutExerciseId: string;
      confirmedPopulatedRemoval: boolean;
    }>
  | Readonly<{
      kind: "reorder_exercises";
      workoutId: string;
      workoutExerciseIds: readonly string[];
    }>
  | Readonly<{ kind: "delete"; workoutId: string }>;

export type HistoryCorrectionKind = HistoryCorrection["kind"];

/** A deletion has no workout to return; every other correction reloads one. */
export function correctionTargetWorkoutIsRemoved(
  correction: HistoryCorrection,
): boolean {
  return correction.kind === "delete";
}
