"use server";

import { revalidatePath } from "next/cache";

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
  const result = await createWeightEntry(input);
  // The panel that records a weigh-in closes through the overlay history, and
  // the entry it returns to holds the list as it was. Marking the path stale
  // here is what makes the new row show, rather than a client refresh the
  // restore would discard.
  if (result.ok) revalidatePath("/body/weight");
  return result;
}

export async function updateWeightEntryAction(input: unknown) {
  return updateWeightEntry(input);
}

export async function deleteWeightEntryAction(input: unknown) {
  return deleteWeightEntry(input);
}
