import type { ExerciseLoadMode } from "@/features/exercises/domain/exercise";
import type { BandDirection } from "./active-workout-command";
import type { WorkoutSet } from "./workout";

export type SetLoadField = "kg" | "added_kg" | "assistance_kg";

export type SetModeFields = Readonly<{
  load: SetLoadField | null;
  band: BandDirection | null;
}>;

export const setModeFields: Readonly<Record<ExerciseLoadMode, SetModeFields>> =
  {
    weight: { load: "kg", band: null },
    weight_resistance_band: { load: "kg", band: "resistance" },
    bodyweight: { load: null, band: null },
    bodyweight_added_weight: { load: "added_kg", band: null },
    bodyweight_resistance_band: { load: null, band: "resistance" },
    bodyweight_assistance_band: { load: null, band: "assistance" },
    assistance_weight: { load: "assistance_kg", band: null },
    assistance_band: { load: null, band: "assistance" },
    resistance_band: { load: null, band: "resistance" },
  };

export const setLoadFieldLabels: Readonly<Record<SetLoadField, string>> = {
  kg: "kg",
  added_kg: "added kg",
  assistance_kg: "assistance kg",
};

export function missingConfirmValues(
  mode: ExerciseLoadMode,
  set: Pick<WorkoutSet, "loadKg" | "bandStrength" | "reps">,
): readonly string[] {
  const fields = setModeFields[mode];
  const missing: string[] = [];
  if (fields.load !== null && set.loadKg === null)
    missing.push(setLoadFieldLabels[fields.load]);
  if (fields.band !== null && set.bandStrength === null)
    missing.push("band strength");
  if (set.reps === null) missing.push("reps");
  return missing;
}

export function confirmValidationMessage(missing: readonly string[]): string {
  return `Enter ${missing.join(" and ")} to confirm this set.`;
}

export function changeSetMode(
  set: WorkoutSet,
  mode: ExerciseLoadMode,
): Readonly<{ set: WorkoutSet; clearedLabels: readonly string[] }> {
  const previous = set.loadMode === null ? null : setModeFields[set.loadMode];
  const next = setModeFields[mode];
  const cleared: string[] = [];

  let loadKg = set.loadKg;
  if (next.load === null || previous?.load !== next.load) {
    if (set.loadKg !== null && previous?.load != null)
      cleared.push(setLoadFieldLabels[previous.load]);
    loadKg = null;
  }

  let bandStrength = set.bandStrength;
  if (next.band === null) {
    if (set.bandStrength !== null) cleared.push("band strength");
    bandStrength = null;
  }

  return {
    set: {
      ...set,
      loadMode: mode,
      loadKg,
      bandStrength,
      bandDirection: next.band,
      isConfirmed: false,
    },
    clearedLabels: cleared,
  };
}
