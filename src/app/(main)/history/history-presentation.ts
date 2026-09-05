import type {
  HistoryWorkoutStatus,
  HistoryWorkoutSummary,
} from "@/features/history/domain/workout-history";

/** `2026-09` becomes `September 2026`. */
export function formatHistoryMonth(month: string): string {
  const parsed = new Date(`${month}-01T00:00:00Z`);
  return Number.isFinite(parsed.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsed)
    : month;
}

/** `2026-09-04` becomes `Fri 4 Sep`. */
export function formatHistoryDate(localDate: string): string {
  const parsed = new Date(`${localDate}T00:00:00Z`);
  return Number.isFinite(parsed.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(parsed)
    : localDate;
}

/** A duration in words, because History reads durations rather than counts them. */
export function formatHistoryDuration(seconds: number): string {
  const minutes = Math.max(0, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`;
}

export function formatExerciseCount(count: number): string {
  return count === 1 ? "1 exercise" : `${count} exercises`;
}

export function summaryDetail(summary: HistoryWorkoutSummary): string {
  return [
    formatHistoryDate(summary.workoutDate),
    formatHistoryDuration(summary.activeDurationSeconds),
    formatExerciseCount(summary.performedExerciseCount),
  ].join(" · ");
}

/** Why an incomplete workout is kept but excluded, stated once. */
export const incompleteExplanation =
  "Saved as incomplete. It stays in History but does not feed personal records, exercise charts, or split durations.";

export function isIncomplete(status: HistoryWorkoutStatus): boolean {
  return status === "incomplete";
}

/** The datetime-local value a saved timestamp starts from. */
export function toDateTimeLocalValue(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (!Number.isFinite(parsed.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

/** The ISO timestamp a `datetime-local` value means in the viewer's zone. */
export function fromDateTimeLocalValue(value: string): string | null {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}
