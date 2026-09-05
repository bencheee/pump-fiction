"use server";

import type { ExerciseDefinitionInput } from "@/features/exercises/domain/exercise-validation";
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "@/server/application/exercises";

export async function createExerciseAction(input: ExerciseDefinitionInput) {
  return createExercise(input);
}

export async function updateExerciseAction(
  id: unknown,
  input: ExerciseDefinitionInput,
) {
  return updateExercise(id, input);
}

export async function deleteExerciseAction(id: unknown) {
  return deleteExercise(id);
}
