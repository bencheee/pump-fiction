import { setModeFields } from "../domain/set-entry";
import type { LastPerformance, WorkoutSet } from "../domain/workout";
import type { ExerciseMeasurementType } from "@/features/exercises/domain/exercise";

export function formatWorkoutClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainder = whole % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function formatSetSummary(
  set: WorkoutSet,
  measurementType: ExerciseMeasurementType = "reps",
): string {
  const parts: string[] = [];
  if (set.loadMode !== null) {
    const fields = setModeFields[set.loadMode];
    if (fields.load === "kg" && set.loadKg !== null)
      parts.push(`${set.loadKg} kg`);
    if (fields.load === "added_kg" && set.loadKg !== null)
      parts.push(`+${set.loadKg} kg`);
    if (fields.load === "assistance_kg" && set.loadKg !== null)
      parts.push(`−${set.loadKg} kg assistance`);
    if (fields.band !== null && set.bandStrength !== null)
      parts.push(`${set.bandStrength} ${fields.band} band`);
  }
  if (set.reps !== null)
    parts.push(
      measurementType === "seconds" ? `${set.reps} sec` : `× ${set.reps}`,
    );
  return parts.length > 0 ? parts.join(" ") : "No values";
}

export function formatLastPerformance(performance: LastPerformance): string {
  const date = formatLastPerformanceDate(performance.workoutDate);
  const sets = performance.sets
    .map((set) => formatSetSummary(set, performance.measurementType))
    .join(", ");
  return sets.length > 0 ? `${date} · ${sets}` : date;
}

export function formatLastPerformanceDate(workoutDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${workoutDate}T00:00:00Z`));
}

export function formatWorkoutSetLine(
  set: WorkoutSet,
  measurementType: ExerciseMeasurementType = "reps",
): string {
  const reps = set.reps ?? "—";
  if (measurementType === "seconds") {
    const load = formatSetSummary({ ...set, reps: null });
    return load === "No values" ? `${reps} sec` : `${load} · ${reps} sec`;
  }
  if (set.loadMode === null) return `${reps} x —`;

  switch (set.loadMode) {
    case "bodyweight":
      return `${reps} x BW`;
    case "weight":
      return `${reps} x ${set.loadKg ?? "—"} kg`;
    case "bodyweight_added_weight":
      return `${reps} x BW + ${set.loadKg ?? "—"} kg`;
    case "bodyweight_resistance_band":
      return `${reps} x BW + ${set.bandStrength ?? "—"} resistance band`;
    case "weight_resistance_band":
      return `${reps} x ${set.loadKg ?? "—"} kg + ${set.bandStrength ?? "—"} resistance band`;
    case "assistance_weight":
      return `${reps} x ${set.loadKg ?? "—"} kg assistance`;
    case "assistance_band":
      return `${reps} x ${set.bandStrength ?? "—"} assistance band`;
  }
}
