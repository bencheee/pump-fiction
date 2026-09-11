export type ProgramSplit = Readonly<{
  id: string;
  programId: string;
  name: string;
  position: number;
}>;

export type Program = Readonly<{
  id: string;
  name: string;
  isCurrent: boolean;
  nextSplitId: string | null;
  splits: readonly ProgramSplit[];
}>;

export type SplitExercisePrescription = Readonly<{
  exerciseId: string;
  exerciseName: string;
  measurementType?: import("@/features/exercises/domain/exercise").ExerciseMeasurementType;
  position: number;
  plannedSets: number;
  minReps: number;
  maxReps: number;
}>;

export type Split = ProgramSplit &
  Readonly<{
    exercises: readonly SplitExercisePrescription[];
  }>;

export type ProgramDefinition = Readonly<{ name: string }>;

export type SplitPrescriptionDefinition = Readonly<{
  exerciseId: string;
  plannedSets: number;
  minReps: number;
  maxReps: number;
}>;

export type SplitDefinition = Readonly<{
  name: string;
  exercises: readonly SplitPrescriptionDefinition[];
}>;
