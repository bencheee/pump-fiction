export type ProgramStatus = "draft" | "active" | "archived";
export type SplitStatus = "active" | "archived";

export type ProgramSplit = Readonly<{
  id: string;
  programId: string;
  name: string;
  position: number;
  status: SplitStatus;
}>;

export type Program = Readonly<{
  id: string;
  name: string;
  status: ProgramStatus;
  nextSplitId: string | null;
  splits: readonly ProgramSplit[];
}>;

export type SplitExercisePrescription = Readonly<{
  exerciseId: string;
  exerciseName: string;
  exerciseStatus: "active" | "archived";
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
