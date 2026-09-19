"use server";

import type { ChartRange } from "@/features/history/domain/chart";
import {
  createMeasurementEntry,
  createMeasurementType,
  deleteMeasurementEntry,
  deleteMeasurementType,
  getMeasurementEntry,
  getMeasurementProgress,
  listBodyMeasurements,
  renameMeasurementType,
  updateMeasurementEntry,
} from "@/server/application/body";

export async function listBodyMeasurementsAction() {
  return listBodyMeasurements();
}

export async function getMeasurementProgressAction(
  measurementTypeId: string,
  options: Readonly<{ range?: ChartRange }> = {},
) {
  return getMeasurementProgress(measurementTypeId, options);
}

export async function getMeasurementEntryAction(
  measurementTypeId: string,
  entryDate: string,
) {
  return getMeasurementEntry(measurementTypeId, entryDate);
}

export async function createMeasurementTypeAction(input: unknown) {
  return createMeasurementType(input);
}

export async function renameMeasurementTypeAction(input: unknown) {
  return renameMeasurementType(input);
}

export async function deleteMeasurementTypeAction(input: unknown) {
  return deleteMeasurementType(input);
}

export async function createMeasurementEntryAction(input: unknown) {
  return createMeasurementEntry(input);
}

export async function updateMeasurementEntryAction(input: unknown) {
  return updateMeasurementEntry(input);
}

export async function deleteMeasurementEntryAction(input: unknown) {
  return deleteMeasurementEntry(input);
}
