import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "@/shared/application/operation-result";

import type { Program, Split } from "../domain/program";
import {
  parseUuid,
  parseUuidOrder,
  validateProgramDefinition,
  validateSplitDefinition,
  type ProgramDefinitionInput,
  type SplitDefinitionInput,
} from "../domain/program-validation";
import { programRepositoryFailure } from "./program-failures";
import type { ProgramRepository } from "./program-repository";

export async function listPrograms(
  repository: ProgramRepository,
): Promise<OperationResult<readonly Program[]>> {
  try {
    return operationSuccess(await repository.list());
  } catch (error) {
    return programRepositoryFailure(error, "load");
  }
}

export async function getProgram(
  repository: ProgramRepository,
  id: unknown,
): Promise<OperationResult<Program>> {
  const programId = parseUuid(id);
  if (programId === null) return missing<Program>();

  try {
    const program = await repository.getProgram(programId);
    return program === null ? missing<Program>() : operationSuccess(program);
  } catch (error) {
    return programRepositoryFailure(error, "load");
  }
}

export async function getSplit(
  repository: ProgramRepository,
  id: unknown,
): Promise<OperationResult<Split>> {
  const splitId = parseUuid(id);
  if (splitId === null) return missing<Split>();

  try {
    const split = await repository.getSplit(splitId);
    return split === null ? missing<Split>() : operationSuccess(split);
  } catch (error) {
    return programRepositoryFailure(error, "load");
  }
}

export async function createProgram(
  repository: ProgramRepository,
  input: ProgramDefinitionInput,
): Promise<OperationResult<Program>> {
  const validation = validateProgramDefinition(input);
  if (!validation.ok) return invalid<Program>(validation.fieldErrors);
  return save(() => repository.createProgram(validation.value));
}

export async function updateProgram(
  repository: ProgramRepository,
  id: unknown,
  input: ProgramDefinitionInput,
): Promise<OperationResult<Program>> {
  const programId = parseUuid(id);
  if (programId === null) return missing<Program>();
  const validation = validateProgramDefinition(input);
  if (!validation.ok) return invalid<Program>(validation.fieldErrors);
  return save(() => repository.updateProgram(programId, validation.value));
}

export async function activateProgram(
  repository: ProgramRepository,
  id: unknown,
  nextSplitId: unknown,
): Promise<OperationResult<Program>> {
  const programId = parseUuid(id);
  const splitId = parseUuid(nextSplitId);
  if (programId === null || splitId === null) return missing<Program>();
  return save(() => repository.activateProgram(programId, splitId));
}

export async function archiveProgram(
  repository: ProgramRepository,
  id: unknown,
): Promise<OperationResult<Program>> {
  const programId = parseUuid(id);
  if (programId === null) return missing<Program>();
  return save(() => repository.archiveProgram(programId));
}

export async function createSplit(
  repository: ProgramRepository,
  programId: unknown,
  input: SplitDefinitionInput,
): Promise<OperationResult<Split>> {
  const parentId = parseUuid(programId);
  if (parentId === null) return missing<Split>();
  const validation = validateSplitDefinition(input);
  if (!validation.ok) return invalid<Split>(validation.fieldErrors);
  return save(() => repository.createSplit(parentId, validation.value));
}

export async function updateSplit(
  repository: ProgramRepository,
  id: unknown,
  input: SplitDefinitionInput,
): Promise<OperationResult<Split>> {
  const splitId = parseUuid(id);
  if (splitId === null) return missing<Split>();
  const validation = validateSplitDefinition(input);
  if (!validation.ok) return invalid<Split>(validation.fieldErrors);
  return save(() => repository.updateSplit(splitId, validation.value));
}

export async function reorderSplits(
  repository: ProgramRepository,
  programId: unknown,
  splitIds: unknown,
): Promise<OperationResult<Program>> {
  const parentId = parseUuid(programId);
  const order = parseUuidOrder(splitIds);
  if (parentId === null) return missing<Program>();
  if (order === null) return invalidOrder<Program>();
  return save(() => repository.reorderSplits(parentId, order));
}

export async function reorderSplitExercises(
  repository: ProgramRepository,
  splitId: unknown,
  exerciseIds: unknown,
): Promise<OperationResult<Split>> {
  const id = parseUuid(splitId);
  const order = parseUuidOrder(exerciseIds);
  if (id === null) return missing<Split>();
  if (order === null) return invalidOrder<Split>();
  return save(() => repository.reorderSplitExercises(id, order));
}

export async function setNextSplit(
  repository: ProgramRepository,
  programId: unknown,
  splitId: unknown,
): Promise<OperationResult<Program>> {
  const parentId = parseUuid(programId);
  const nextId = parseUuid(splitId);
  if (parentId === null || nextId === null) return missing<Program>();
  return save(() => repository.setNextSplit(parentId, nextId));
}

export async function archiveSplit(
  repository: ProgramRepository,
  id: unknown,
): Promise<OperationResult<Split>> {
  const splitId = parseUuid(id);
  if (splitId === null) return missing<Split>();
  return save(() => repository.archiveSplit(splitId));
}

export async function advanceAfterProposedCompletion(
  repository: ProgramRepository,
  programId: unknown,
  completedSplitId: unknown,
): Promise<OperationResult<string | null>> {
  const parentId = parseUuid(programId);
  const splitId = parseUuid(completedSplitId);
  if (parentId === null || splitId === null) return missing<string | null>();
  return save(() =>
    repository.advanceAfterProposedCompletion(parentId, splitId),
  );
}

async function save<T>(
  operation: () => Promise<T>,
): Promise<OperationResult<T>> {
  try {
    return operationSuccess(await operation());
  } catch (error) {
    return programRepositoryFailure(error, "save");
  }
}

function missing<T>(): OperationResult<T> {
  return operationFailure({
    code: "not_found",
    message: "The requested program or split is no longer available.",
    retryable: false,
  });
}

function invalid<T>(
  fieldErrors: Readonly<Record<string, readonly string[]>>,
): OperationResult<T> {
  return operationFailure({
    code: "validation",
    message: "Check the submitted values and try again.",
    retryable: false,
    fieldErrors,
  });
}

function invalidOrder<T>(): OperationResult<T> {
  return operationFailure({
    code: "validation",
    message: "Provide each item exactly once in the new order.",
    retryable: false,
    fieldErrors: { order: ["Provide a complete order without duplicates."] },
  });
}
