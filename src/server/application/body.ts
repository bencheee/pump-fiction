import "server-only";

import {
  createMeasurementEntry as runCreateMeasurementEntry,
  createMeasurementType as runCreateMeasurementType,
  deleteMeasurementEntry as runDeleteMeasurementEntry,
  deleteMeasurementType as runDeleteMeasurementType,
  getMeasurementEntry as runGetMeasurementEntry,
  getMeasurementProgress as runGetMeasurementProgress,
  listBodyMeasurements as runListBodyMeasurements,
  renameMeasurementType as runRenameMeasurementType,
  updateMeasurementEntry as runUpdateMeasurementEntry,
  type BodyMeasurements,
  type MeasurementProgress,
} from "@/features/history/application/body-operations";
import type {
  MeasurementEntry,
  MeasurementType,
} from "@/features/history/domain/body";
import type { ChartRange } from "@/features/history/domain/chart";
import type { OperationResult } from "@/shared/application/operation-result";

import { createServerDatabaseClient } from "../database/client";
import { SupabaseBodyRepository } from "../repositories/supabase-body-repository";

function repository(): SupabaseBodyRepository {
  return new SupabaseBodyRepository(createServerDatabaseClient());
}

export async function listBodyMeasurements(): Promise<
  OperationResult<BodyMeasurements>
> {
  return runListBodyMeasurements(repository());
}

export async function getMeasurementProgress(
  measurementTypeId: string,
  options: Readonly<{ range?: ChartRange }> = {},
): Promise<OperationResult<MeasurementProgress>> {
  return runGetMeasurementProgress(repository(), measurementTypeId, options);
}

export async function getMeasurementEntry(
  measurementTypeId: string,
  entryDate: string,
): Promise<OperationResult<MeasurementEntry>> {
  return runGetMeasurementEntry(repository(), measurementTypeId, entryDate);
}

export async function createMeasurementType(
  input: unknown,
): Promise<OperationResult<MeasurementType>> {
  return runCreateMeasurementType(repository(), input);
}

export async function renameMeasurementType(
  input: unknown,
): Promise<OperationResult<MeasurementType>> {
  return runRenameMeasurementType(repository(), input);
}

export async function deleteMeasurementType(
  input: unknown,
): Promise<OperationResult<null>> {
  return runDeleteMeasurementType(repository(), input);
}

export async function createMeasurementEntry(
  input: unknown,
): Promise<OperationResult<MeasurementEntry>> {
  return runCreateMeasurementEntry(repository(), input);
}

export async function updateMeasurementEntry(
  input: unknown,
): Promise<OperationResult<MeasurementEntry>> {
  return runUpdateMeasurementEntry(repository(), input);
}

export async function deleteMeasurementEntry(
  input: unknown,
): Promise<OperationResult<null>> {
  return runDeleteMeasurementEntry(repository(), input);
}
