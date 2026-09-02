import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";

import type { Exercise } from "../domain/exercise";
import {
  validateExerciseDefinition,
  type ExerciseDefinitionInput,
} from "../domain/exercise-validation";
import { exerciseRepositoryFailure } from "./exercise-failures";
import type { ExerciseRepository } from "./exercise-repository";

export async function listExercises(
  repository: ExerciseRepository,
  includeArchived = false,
): Promise<OperationResult<readonly Exercise[]>> {
  try {
    return operationSuccess(await repository.list(includeArchived));
  } catch (error) {
    return exerciseRepositoryFailure<readonly Exercise[]>(error, "load");
  }
}

export async function getExercise(
  repository: ExerciseRepository,
  id: unknown,
): Promise<OperationResult<Exercise>> {
  const exerciseId = parseExerciseId(id);
  if (exerciseId === null) return missingExercise();

  try {
    const exercise = await repository.getById(exerciseId);
    return exercise === null ? missingExercise() : operationSuccess(exercise);
  } catch (error) {
    return exerciseRepositoryFailure(error, "load");
  }
}

export async function createExercise(
  repository: ExerciseRepository,
  input: ExerciseDefinitionInput,
): Promise<OperationResult<Exercise>> {
  const validation = validateExerciseDefinition(input);
  if (!validation.ok) return invalidDefinition(validation.fieldErrors);

  try {
    return operationSuccess(await repository.create(validation.value));
  } catch (error) {
    return exerciseRepositoryFailure(error, "save");
  }
}

export async function updateExercise(
  repository: ExerciseRepository,
  id: unknown,
  input: ExerciseDefinitionInput,
): Promise<OperationResult<Exercise>> {
  const exerciseId = parseExerciseId(id);
  if (exerciseId === null) return missingExercise();

  const validation = validateExerciseDefinition(input);
  if (!validation.ok) return invalidDefinition(validation.fieldErrors);

  try {
    return operationSuccess(
      await repository.update(exerciseId, validation.value),
    );
  } catch (error) {
    return exerciseRepositoryFailure(error, "save");
  }
}

export async function archiveExercise(
  repository: ExerciseRepository,
  id: unknown,
): Promise<OperationResult<Exercise>> {
  return setExerciseStatus(repository, id, "archived");
}

export async function reactivateExercise(
  repository: ExerciseRepository,
  id: unknown,
): Promise<OperationResult<Exercise>> {
  return setExerciseStatus(repository, id, "active");
}

async function setExerciseStatus(
  repository: ExerciseRepository,
  id: unknown,
  status: "active" | "archived",
): Promise<OperationResult<Exercise>> {
  const exerciseId = parseExerciseId(id);
  if (exerciseId === null) return missingExercise();

  try {
    return operationSuccess(await repository.setStatus(exerciseId, status));
  } catch (error) {
    return exerciseRepositoryFailure(error, "save");
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseExerciseId(value: unknown): string | null {
  return typeof value === "string" && uuidPattern.test(value) ? value : null;
}

function missingExercise(): OperationResult<Exercise> {
  return operationFailure({
    code: "not_found",
    message: "The requested exercise is no longer available.",
    retryable: false,
  });
}

function invalidDefinition(
  fieldErrors: Readonly<Record<string, readonly string[]>>,
): OperationResult<Exercise> {
  return operationFailure({
    code: "validation",
    message: "Check the submitted values and try again.",
    retryable: false,
    fieldErrors,
  });
}
