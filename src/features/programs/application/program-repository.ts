import type {
  Program,
  ProgramDefinition,
  Split,
  SplitDefinition,
} from "../domain/program";

export interface ProgramRepository {
  list(): Promise<readonly Program[]>;
  getProgram(id: string): Promise<Program | null>;
  getSplit(id: string): Promise<Split | null>;
  createProgram(definition: ProgramDefinition): Promise<Program>;
  updateProgram(id: string, definition: ProgramDefinition): Promise<Program>;
  setCurrentProgram(id: string, nextSplitId: string): Promise<Program>;
  deleteProgram(id: string): Promise<void>;
  createSplit(programId: string, definition: SplitDefinition): Promise<Split>;
  updateSplit(id: string, definition: SplitDefinition): Promise<Split>;
  reorderSplits(
    programId: string,
    splitIds: readonly string[],
  ): Promise<Program>;
  reorderSplitExercises(
    splitId: string,
    exerciseIds: readonly string[],
  ): Promise<Split>;
  setNextSplit(programId: string, splitId: string): Promise<Program>;
  deleteSplit(id: string): Promise<void>;
  advanceAfterProposedCompletion(
    programId: string,
    completedSplitId: string,
  ): Promise<string | null>;
}

export type ProgramRepositoryErrorCode =
  | "duplicate_name"
  | "not_found"
  | "unknown_exercise"
  | "last_split"
  | "invalid_next_split"
  | "invalid_order"
  | "constraint"
  | "unavailable"
  | "unexpected";

export class ProgramRepositoryError extends Error {
  readonly code: ProgramRepositoryErrorCode;

  constructor(code: ProgramRepositoryErrorCode, options?: ErrorOptions) {
    super("Program repository operation failed", options);
    this.name = "ProgramRepositoryError";
    this.code = code;
  }
}
