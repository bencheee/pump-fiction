import type {
  Exercise,
  ExerciseDefinition,
  ExerciseStatus,
} from "../domain/exercise";

export interface ExerciseRepository {
  list(includeArchived: boolean): Promise<readonly Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  create(definition: ExerciseDefinition): Promise<Exercise>;
  update(id: string, definition: ExerciseDefinition): Promise<Exercise>;
  setStatus(id: string, status: ExerciseStatus): Promise<Exercise>;
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
