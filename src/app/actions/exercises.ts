"use server";

import type { ExerciseDefinitionInput } from "@/features/exercises/domain/exercise-validation";
import {
  archiveExercise,
  createExercise,
  reactivateExercise,
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

export async function archiveExerciseAction(id: unknown) {
  return archiveExercise(id);
}

export async function reactivateExerciseAction(id: unknown) {
  return reactivateExercise(id);
}
