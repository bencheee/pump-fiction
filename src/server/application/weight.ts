import "server-only";

import {
  createWeightEntry as runCreateWeightEntry,
  deleteWeightEntry as runDeleteWeightEntry,
  getTodayWeight as runGetTodayWeight,
  getWeightEntry as runGetWeightEntry,
  getWeightProgress as runGetWeightProgress,
  updateWeightEntry as runUpdateWeightEntry,
  type WeightProgress,
} from "@/features/history/application/weight-operations";
import type { ChartRange } from "@/features/history/domain/chart";
import type { WeightEntry } from "@/features/history/domain/weight";
import type { OperationResult } from "@/shared/application/operation-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseWeightRepository } from "../repositories/supabase-weight-repository";

function repository(): SupabaseWeightRepository {
  return new SupabaseWeightRepository(createServerDatabaseClient());
}

export async function getWeightProgress(
  options: Readonly<{ range?: ChartRange }> = {},
): Promise<OperationResult<WeightProgress>> {
  return runGetWeightProgress(repository(), options);
}

export async function getWeightEntry(
  entryDate: string,
): Promise<OperationResult<WeightEntry>> {
  return runGetWeightEntry(repository(), entryDate);
}

export async function getTodayWeight(): Promise<
  OperationResult<Readonly<{ localDate: string; entry: WeightEntry | null }>>
> {
  return runGetTodayWeight(repository());
}

export async function createWeightEntry(
  input: unknown,
): Promise<OperationResult<WeightEntry>> {
  return runCreateWeightEntry(repository(), input);
}

export async function updateWeightEntry(
  input: unknown,
): Promise<OperationResult<WeightEntry>> {
  return runUpdateWeightEntry(repository(), input);
}

export async function deleteWeightEntry(
  input: unknown,
): Promise<OperationResult<null>> {
  return runDeleteWeightEntry(repository(), input);
}
