import type {
  ExerciseBaseType,
  ExerciseLoadMode,
  ExerciseMeasurementType,
} from "@/features/exercises/domain/exercise";
import type { BandDirection, BandStrength } from "./active-workout-command";

export type WorkoutStatus = "active" | "paused";
export type WorkoutSourceKind =
  "proposed_split" | "alternate_split" | "one_time";

export type TodaySplit = Readonly<{
  programId: string;
  programName: string;
  splitId: string;
  splitName: string;
  position: number;
  averageDurationSeconds: number | null;
  completedWorkoutCount: number;
  exercises: readonly TodaySplitExercise[];
}>;

export type TodaySplitExercise = Readonly<{
  exerciseId: string;
  exerciseName: string;
  measurementType?: ExerciseMeasurementType;
  position: number;
  plannedSets: number;
  minReps: number;
  maxReps: number;
}>;

export type TodayView = Readonly<{
  localDate: string;
  proposedSplit: TodaySplit | null;
  alternateSplits: readonly TodaySplit[];
  currentWorkout: CurrentWorkoutSummary | null;
}>;

export type CurrentWorkoutSummary = Readonly<{
  id: string;
  name: string;
  status: WorkoutStatus;
  accumulatedActiveSeconds: number;
  activeSegmentStartedAt: string | null;
}>;

export type WorkoutSet = Readonly<{
  id: string;
  position: number;
  loadMode: ExerciseLoadMode | null;
  loadKg: number | null;
  bandDirection: BandDirection | null;
  bandStrength: BandStrength | null;
  reps: number | null;
}>;

export type LastPerformance = Readonly<{
  workoutId: string;
  workoutDate: string;
  measurementType?: ExerciseMeasurementType;
  sets: readonly WorkoutSet[];
}>;

export type PreviousWorkoutNote = Readonly<{
  workoutDate: string;
  note: string;
}>;

export type WorkoutExercise = Readonly<{
  id: string;
  exerciseId: string;
  position: number;
  exerciseName: string;
  exerciseBaseType: ExerciseBaseType;
  measurementType?: ExerciseMeasurementType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
  plannedSets: number | null;
  minReps: number | null;
  maxReps: number | null;
  workoutNote: string;
  sets: readonly WorkoutSet[];
  lastPerformance: LastPerformance | null;
  previousWorkoutNote?: PreviousWorkoutNote | null;
}>;

export type CurrentWorkout = Readonly<{
  id: string;
  status: WorkoutStatus;
  sourceKind: WorkoutSourceKind;
  sourceProgramId: string | null;
  sourceSplitId: string | null;
  name: string;
  workoutDate: string;
  startedAt: string;
  accumulatedActiveSeconds: number;
  activeSegmentStartedAt: string | null;
  revision: number;
  exercises: readonly WorkoutExercise[];
}>;

export type StartWorkoutDefinition =
  | Readonly<{
      sourceKind: "proposed_split";
      splitId: string;
      startedAt: string;
    }>
  | Readonly<{
      sourceKind: "alternate_split";
      splitId: string;
      startedAt: string;
    }>
  | Readonly<{
      sourceKind: "one_time";
      name: string;
      exerciseIds: readonly string[];
      startedAt: string;
    }>;

export type StartWorkoutInput = Readonly<{
  sourceKind?: unknown;
  splitId?: unknown;
  name?: unknown;
  exerciseIds?: unknown;
  startedAt?: unknown;
}>;
