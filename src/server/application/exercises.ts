import "server-only";

import {
  createExercise as runCreateExercise,
  deleteExercise as runDeleteExercise,
  getExercise as runGetExercise,
  listExercises as runListExercises,
  updateExercise as runUpdateExercise,
} from "@/features/exercises/application/exercise-operations";
import type { ExerciseDefinitionInput } from "@/features/exercises/domain/exercise-validation";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseExerciseRepository } from "../repositories/supabase-exercise-repository";

export async function listExercises() {
  return runListExercises(createRepository());
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

export async function deleteExercise(id: unknown) {
  return runDeleteExercise(createRepository(), id);
}

function createRepository(): SupabaseExerciseRepository {
  return new SupabaseExerciseRepository(createServerDatabaseClient());
}
