import type { WeeklySummary } from "@/features/history/domain/weight";

/** The typographic minus the accepted design uses for a fall. */
const minus = "−";

/** A weigh-in reads as it was entered, to at most two decimals. */
export function formatKg(value: number): string {
  return `${trim(value, 2)} kg`;
}

/** A derived value reads to one decimal; the derivation keeps its precision. */
export function formatAverageKg(value: number): string {
  return `${value.toFixed(1)} kg`;
}

export function formatChangeKg(value: number): string {
  const sign = value < 0 ? minus : "+";
  return `${sign}${Math.abs(value).toFixed(1)} kg`;
}

/** The `n/7` of `MVP-WGT-002`: measured days, never a seven-day assumption. */
export function formatRecordedDays(recordedDays: number): string {
  return `${recordedDays}/7 days`;
}

export function weekStatusLabel(week: WeeklySummary): string {
  return week.provisional ? "Provisional until Sunday" : "Final";
}

/** Unavailable is a state of its own, because a missing week is not a zero. */
export const noPreviousWeek = "No previous week to compare";

function trim(value: number, decimals: number): string {
  return String(Number(value.toFixed(decimals)));
}
