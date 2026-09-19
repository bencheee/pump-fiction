"use client";

import { useState } from "react";

import { setModeFields } from "@/features/active-workout/domain/set-entry";
import type { ExerciseLoadMode } from "@/features/exercises/domain/exercise";
import {
  Action,
  Chip,
  countOptions,
  formatWheelNumber,
  Icon,
  loadOptions,
  optionIndex,
  Overlay,
  ValueWheel,
  WheelSeparator,
} from "@/shared/ui";

export type SetDraft = Readonly<{
  loadMode: ExerciseLoadMode;
  loadKg: string;
  bandStrength: string;
  reps: string;
}>;

const loadModeNouns: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "Weight",
  weight_resistance_band: "Resistance band",
  bodyweight: "Bodyweight",
  bodyweight_added_weight: "Added weight",
  bodyweight_resistance_band: "Resistance band",
  assistance_weight: "Assistance weight",
  assistance_band: "Assistance band",
};

const loadUnits: Readonly<Record<string, string>> = {
  kg: "kg",
  added_kg: "+kg",
  assistance_kg: "−kg",
};

function toNumber(value: string): number | null {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Correcting one recorded set, as the design draws it: the value is turned on
 * a wheel rather than typed, over a panel that also carries whatever the set's
 * mode needs. Apply writes the value back into the form's draft; nothing is
 * sent until the screen is saved.
 */
export function SetCorrectionOverlay({
  trigger,
  exerciseName,
  measurementType = "reps",
  position,
  setCount,
  entry,
  baseMode,
  optionalMode,
  recordedSummary,
  canRemove,
  loadFallback = null,
  countFallback = null,
  onApply,
  onRemove,
}: {
  trigger: React.ReactElement;
  exerciseName: string;
  measurementType?: "reps" | "seconds";
  position: number;
  setCount: number;
  entry: SetDraft;
  baseMode: ExerciseLoadMode;
  optionalMode: ExerciseLoadMode | null;
  recordedSummary: string;
  canRemove: boolean;
  /** Where each wheel starts before this set has a value. */
  loadFallback?: number | null;
  countFallback?: number | null;
  onApply: (next: SetDraft) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(entry);
  const fields = setModeFields[draft.loadMode];

  const loadColumn = loadOptions(toNumber(draft.loadKg) ?? loadFallback);
  const countColumn = countOptions(
    toNumber(draft.reps) ?? countFallback,
    measurementType,
  );

  return (
    <Overlay
      title="Correct set"
      trigger={trigger}
      onOpenChange={(open) => {
        if (open) setDraft(entry);
      }}
      footer={(close) => (
        <>
          <Action
            onClick={() => {
              onApply(draft);
              close();
            }}
          >
            <Icon name="check" size={18} />
            Apply to set
          </Action>
          <Action
            variant="secondary"
            disabled={!canRemove}
            className={canRemove ? undefined : "text-[var(--pf-glyph-dim)]"}
            onClick={() => {
              onRemove();
              close();
            }}
          >
            <Icon name="trash-2" size={15} />
            Remove this set
          </Action>
        </>
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center">
        <span className="shrink-0 rounded-full bg-[var(--pf-accent-dim)] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[var(--pf-accent)]">
          Set {position} of {setCount}
        </span>
        <h2 className="mt-3 shrink-0 text-center text-[24px] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
          {exerciseName}
        </h2>

        {optionalMode !== null ? (
          <div
            role="group"
            aria-label="Entered as"
            className="mt-4 flex shrink-0 flex-wrap justify-center gap-2"
          >
            {[baseMode, optionalMode].map((option) => (
              <Chip
                key={option}
                selected={draft.loadMode === option}
                onClick={() =>
                  setDraft({
                    loadMode: option,
                    loadKg:
                      setModeFields[option].load === null ? "" : draft.loadKg,
                    bandStrength:
                      setModeFields[option].band === null
                        ? ""
                        : draft.bandStrength,
                    reps: draft.reps,
                  })
                }
              >
                {loadModeNouns[option]}
              </Chip>
            ))}
          </div>
        ) : null}

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-5">
          <div className="flex shrink-0 items-center gap-2.5">
            {fields.load ? (
              <>
                <ValueWheel
                  label={
                    fields.load === "kg"
                      ? "Kilograms"
                      : fields.load === "added_kg"
                        ? "Added kilograms"
                        : "Assistance kilograms"
                  }
                  options={loadColumn}
                  index={optionIndex(loadColumn, toNumber(draft.loadKg))}
                  fallbackIndex={optionIndex(loadColumn, loadFallback) ?? 0}
                  onIndexChange={(next) =>
                    setDraft({
                      ...draft,
                      loadKg: formatWheelNumber(loadColumn[next] ?? 0),
                    })
                  }
                  unit={loadUnits[fields.load] ?? "kg"}
                  width={132}
                  format={formatWheelNumber}
                />
                <WheelSeparator />
              </>
            ) : (
              <>
                <span className="pf-numeric rounded-full border border-[var(--pf-border)] px-4 py-2 text-[16px] font-semibold tracking-[0.1em] text-[var(--pf-text-3)] uppercase">
                  Bodyweight
                </span>
                <WheelSeparator />
              </>
            )}
            <ValueWheel
              label={measurementType === "seconds" ? "Seconds" : "Reps"}
              options={countColumn}
              index={optionIndex(countColumn, toNumber(draft.reps))}
              fallbackIndex={optionIndex(countColumn, countFallback) ?? 0}
              onIndexChange={(next) =>
                setDraft({ ...draft, reps: String(countColumn[next] ?? 0) })
              }
              unit={measurementType === "seconds" ? "sec" : "reps"}
            />
          </div>

          {fields.band ? (
            <div
              role="group"
              aria-label={
                fields.band === "resistance"
                  ? "Resistance band"
                  : "Assistance band"
              }
              className="flex shrink-0 gap-2"
            >
              {(["light", "medium", "strong"] as const).map((strength) => (
                <Chip
                  key={strength}
                  selected={draft.bandStrength === strength}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      bandStrength:
                        draft.bandStrength === strength ? "" : strength,
                    })
                  }
                >
                  {strength === "light"
                    ? "Light"
                    : strength === "medium"
                      ? "Medium"
                      : "Strong"}
                </Chip>
              ))}
            </div>
          ) : null}

          <p className="pf-numeric shrink-0 text-[15px] text-[var(--pf-text-4)]">
            Recorded {recordedSummary}
          </p>
        </div>
      </div>
    </Overlay>
  );
}
