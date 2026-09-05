"use server";

import type {
  ProgramDefinitionInput,
  SplitDefinitionInput,
} from "@/features/programs/domain/program-validation";
import {
  createProgram,
  createSplit,
  deleteProgram,
  deleteSplit,
  reorderSplitExercises,
  reorderSplits,
  setCurrentProgram,
  setNextSplit,
  updateProgram,
  updateSplit,
} from "@/server/application/programs";

export async function createProgramAction(input: ProgramDefinitionInput) {
  return createProgram(input);
}
export async function updateProgramAction(
  id: unknown,
  input: ProgramDefinitionInput,
) {
  return updateProgram(id, input);
}
export async function setCurrentProgramAction(
  id: unknown,
  nextSplitId: unknown,
) {
  return setCurrentProgram(id, nextSplitId);
}
export async function deleteProgramAction(id: unknown) {
  return deleteProgram(id);
}
export async function createSplitAction(
  programId: unknown,
  input: SplitDefinitionInput,
) {
  return createSplit(programId, input);
}
export async function updateSplitAction(
  id: unknown,
  input: SplitDefinitionInput,
) {
  return updateSplit(id, input);
}
export async function reorderSplitsAction(
  programId: unknown,
  splitIds: unknown,
) {
  return reorderSplits(programId, splitIds);
}
export async function reorderSplitExercisesAction(
  splitId: unknown,
  exerciseIds: unknown,
) {
  return reorderSplitExercises(splitId, exerciseIds);
}
export async function setNextSplitAction(programId: unknown, splitId: unknown) {
  return setNextSplit(programId, splitId);
}
export async function deleteSplitAction(id: unknown) {
  return deleteSplit(id);
}
