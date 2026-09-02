import "server-only";

import {
  archiveExercise as runArchiveExercise,
  createExercise as runCreateExercise,
  getExercise as runGetExercise,
  listExercises as runListExercises,
  reactivateExercise as runReactivateExercise,
  updateExercise as runUpdateExercise,
} from "@/features/exercises/application/exercise-operations";
import type { ExerciseDefinitionInput } from "@/features/exercises/domain/exercise-validation";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseExerciseRepository } from "../repositories/supabase-exercise-repository";

export async function listExercises(includeArchived = false) {
  return runListExercises(createRepository(), includeArchived);
}

export async function getExercise(id: unknown) {
  return runGetExercise(createRepository(), id);
}

export async function createExercise(input: ExerciseDefinitionInput) {
  return runCreateExercise(createRepository(), input);
}

export async function updateExercise(
  id: unknown,
  input: ExerciseDefinitionInput,
) {
  return runUpdateExercise(createRepository(), id, input);
}

export async function archiveExercise(id: unknown) {
  return runArchiveExercise(createRepository(), id);
}

export async function reactivateExercise(id: unknown) {
  return runReactivateExercise(createRepository(), id);
}

function createRepository(): SupabaseExerciseRepository {
  return new SupabaseExerciseRepository(createServerDatabaseClient());
}
