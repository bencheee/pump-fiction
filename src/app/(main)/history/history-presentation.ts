import type { HistoryWorkoutSummary } from "@/features/history/domain/workout-history";

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

/**
 * `hhmm` (prototype line 1665): the 24-hour clock a saved timestamp shows.
 *
 * The zone is the configured one, read on the server and handed down, so the
 * server render and the hydration format the same minute. Formatting in the
 * device's own zone would put the two apart wherever the device disagrees
 * with the configured zone, and React would report the mismatch.
 */
export function formatHistoryTime(timestamp: string, timeZone: string): string {
  const parsed = new Date(timestamp);
  if (!Number.isFinite(parsed.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(parsed);
  } catch {
    return parsed.toISOString().slice(11, 16);
  }
}

/** Which local day a timestamp falls on, in the configured zone. */
export function localDateOf(timestamp: string, timeZone: string): string {
  const parsed = new Date(timestamp);
  if (!Number.isFinite(parsed.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(parsed);
  } catch {
    return parsed.toISOString().slice(0, 10);
  }
}

/** A duration in words, because History reads durations rather than counts them. */
export function formatHistoryDuration(seconds: number): string {
  const minutes = Math.max(0, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`;
}

/** `countText` (prototype line 1679): `1 workout`, `4 workouts`. */
export function formatCount(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function formatExerciseCount(count: number): string {
  return formatCount(count, "exercise");
}

export function summaryDetail(summary: HistoryWorkoutSummary): string {
  return [
    formatHistoryDate(summary.workoutDate),
    formatHistoryDuration(summary.activeDurationSeconds),
    formatExerciseCount(summary.performedExerciseCount),
  ].join(" · ");
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
