"use server";

import type { ChartRange } from "@/features/history/domain/chart";
import {
  createWeightEntry,
  deleteWeightEntry,
  getTodayWeight,
  getWeightEntry,
  getWeightProgress,
  updateWeightEntry,
} from "@/server/application/weight";

export async function getWeightProgressAction(
  options: Readonly<{ range?: ChartRange }> = {},
) {
  return getWeightProgress(options);
}

export async function getWeightEntryAction(entryDate: string) {
  return getWeightEntry(entryDate);
}

export async function getTodayWeightAction() {
  return getTodayWeight();
}

export async function createWeightEntryAction(input: unknown) {
  return createWeightEntry(input);
}

export async function updateWeightEntryAction(input: unknown) {
  return updateWeightEntry(input);
}

export async function deleteWeightEntryAction(input: unknown) {
  return deleteWeightEntry(input);
}
