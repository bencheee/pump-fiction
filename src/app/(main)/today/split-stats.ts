import type { TodaySplit } from "@/features/active-workout/domain/workout";

/*
 * A split's own line, `SPLITS[].meta` in the prototype (line 1718):
 * `Avg 1h 08m · 7 workouts`. Today's card and the Choose split panel both write
 * it; only the type differs between them. A split with no completed workout has
 * no average, and then neither surface writes a line at all.
 */
export function splitStatsText(split: TodaySplit): string | null {
  if (split.averageDurationSeconds === null) return null;
  const workouts = split.completedWorkoutCount === 1 ? "workout" : "workouts";
  return `Avg ${formatDuration(split.averageDurationSeconds)} · ${split.completedWorkoutCount} ${workouts}`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0
    ? `${hours}h ${String(remainder).padStart(2, "0")}m`
    : `${minutes}m`;
}
