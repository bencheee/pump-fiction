import type { Exercise, ExerciseDefinition } from "../domain/exercise";

export interface ExerciseRepository {
  list(): Promise<readonly Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  create(definition: ExerciseDefinition): Promise<Exercise>;
  update(id: string, definition: ExerciseDefinition): Promise<Exercise>;
  delete(id: string): Promise<void>;
}

export type ExerciseRepositoryErrorCode =
  "duplicate_name" | "not_found" | "constraint" | "unavailable" | "unexpected";

export class ExerciseRepositoryError extends Error {
  readonly code: ExerciseRepositoryErrorCode;

  constructor(code: ExerciseRepositoryErrorCode, options?: ErrorOptions) {
    super("Exercise repository operation failed", options);
    this.name = "ExerciseRepositoryError";
    this.code = code;
  }
}
