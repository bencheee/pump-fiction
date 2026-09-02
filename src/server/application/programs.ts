import "server-only";

import {
  activateProgram as runActivateProgram,
  advanceAfterProposedCompletion as runAdvanceAfterProposedCompletion,
  archiveProgram as runArchiveProgram,
  archiveSplit as runArchiveSplit,
  createProgram as runCreateProgram,
  createSplit as runCreateSplit,
  getProgram as runGetProgram,
  getSplit as runGetSplit,
  listPrograms as runListPrograms,
  reorderSplitExercises as runReorderSplitExercises,
  reorderSplits as runReorderSplits,
  setNextSplit as runSetNextSplit,
  updateProgram as runUpdateProgram,
  updateSplit as runUpdateSplit,
} from "@/features/programs/application/program-operations";
import type {
  ProgramDefinitionInput,
  SplitDefinitionInput,
} from "@/features/programs/domain/program-validation";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseProgramRepository } from "../repositories/supabase-program-repository";

export async function listPrograms() {
  return runListPrograms(createRepository());
}
export async function getProgram(id: unknown) {
  return runGetProgram(createRepository(), id);
}
export async function getSplit(id: unknown) {
  return runGetSplit(createRepository(), id);
}
export async function createProgram(input: ProgramDefinitionInput) {
  return runCreateProgram(createRepository(), input);
}
export async function updateProgram(
  id: unknown,
  input: ProgramDefinitionInput,
) {
  return runUpdateProgram(createRepository(), id, input);
}
export async function activateProgram(id: unknown, nextSplitId: unknown) {
  return runActivateProgram(createRepository(), id, nextSplitId);
}
export async function archiveProgram(id: unknown) {
  return runArchiveProgram(createRepository(), id);
}
export async function createSplit(
  programId: unknown,
  input: SplitDefinitionInput,
) {
  return runCreateSplit(createRepository(), programId, input);
}
export async function updateSplit(id: unknown, input: SplitDefinitionInput) {
  return runUpdateSplit(createRepository(), id, input);
}
export async function reorderSplits(programId: unknown, splitIds: unknown) {
  return runReorderSplits(createRepository(), programId, splitIds);
}
export async function reorderSplitExercises(
  splitId: unknown,
  exerciseIds: unknown,
) {
  return runReorderSplitExercises(createRepository(), splitId, exerciseIds);
}
export async function setNextSplit(programId: unknown, splitId: unknown) {
  return runSetNextSplit(createRepository(), programId, splitId);
}
export async function archiveSplit(id: unknown) {
  return runArchiveSplit(createRepository(), id);
}
export async function advanceAfterProposedCompletion(
  programId: unknown,
  completedSplitId: unknown,
) {
  return runAdvanceAfterProposedCompletion(
    createRepository(),
    programId,
    completedSplitId,
  );
}

function createRepository(): SupabaseProgramRepository {
  return new SupabaseProgramRepository(createServerDatabaseClient());
}
