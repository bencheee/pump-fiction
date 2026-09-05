"use client";

/* eslint-disable jsx-a11y/role-supports-aria-props -- Each focusable mode control carries the accepted group validation state. */

import { useRef, useState } from "react";

import {
  createExerciseAction,
  deleteExerciseAction,
  updateExerciseAction,
} from "@/app/actions/exercises";
import {
  baseLoadModeByBaseType,
  defaultLoadModesByBaseType,
  exerciseBaseTypes,
  optionalLoadModesByBaseType,
  type Exercise,
  type ExerciseBaseType,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import { validateExerciseDefinition } from "@/features/exercises/domain/exercise-validation";
import {
  Action,
  DestructiveDialog,
  Icon,
  SaveStatus,
  StickyActionBar,
  TextAreaField,
  TextField,
  TopBar,
  useSaveOutcome,
  useSavedSnapshot,
  type SavePhase,
} from "@/shared/ui";

import {
  exerciseModeDetails,
  exerciseOptionalModeLabels,
  exerciseTypeLabels,
} from "@/features/exercises/ui/exercise-presentation";

type FieldErrors = Readonly<Record<string, readonly string[]>>;

const validationMessage = "Check the highlighted fields.";

export function ExerciseForm({ exercise }: { exercise?: Exercise }) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [baseType, setBaseType] = useState<ExerciseBaseType>(
    exercise?.baseType ?? "weights",
  );
  const [modes, setModes] = useState<readonly ExerciseLoadMode[]>(
    exercise?.allowedLoadModes ?? defaultLoadModesByBaseType.weights,
  );
  const [note, setNote] = useState(exercise?.persistentNote ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<SavePhase>("editing");
  const [saveMessage, setSaveMessage] = useState<string>();
  const [modeNotice, setModeNotice] = useState<string>();
  const modeGroupRef = useRef<HTMLButtonElement>(null);

  const definition = {
    name,
    baseType,
    allowedLoadModes: modes,
    persistentNote: note,
  };
  const { returnToParent, reportFailure } = useSaveOutcome("/exercises");
  const { savedSnapshot } = useSavedSnapshot(snapshotOf(definition));
  const isSaving = phase === "saving";
  const saveState =
    phase === "editing"
      ? snapshotOf(definition) === savedSnapshot
        ? "clean"
        : "unsaved"
      : phase;

  function markChanged(field?: string) {
    setPhase("editing");
    setSaveMessage(undefined);
    if (!field) return;
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function chooseType(nextType: ExerciseBaseType) {
    if (nextType === baseType) return;
    const hadOptionalMode = modes.some(
      (mode) => mode !== baseLoadModeByBaseType[baseType],
    );
    setBaseType(nextType);
    setModes(defaultLoadModesByBaseType[nextType]);
    setModeNotice(
      hadOptionalMode
        ? "Choices that do not apply to this type were cleared."
        : undefined,
    );
    markChanged("baseType");
    setErrors((current) => {
      const next = { ...current };
      delete next.allowedLoadModes;
      return next;
    });
  }

  function toggleMode(mode: ExerciseLoadMode) {
    const baseMode = baseLoadModeByBaseType[baseType];
    setModes(modes.includes(mode) ? [baseMode] : [baseMode, mode]);
    setModeNotice(undefined);
    markChanged("allowedLoadModes");
  }

  async function save() {
    const validation = validateExerciseDefinition(definition);
    if (!validation.ok) {
      setErrors(validation.fieldErrors);
      setPhase("editing");
      setSaveMessage(validationMessage);
      reportFailure(validationMessage);
      if (validation.fieldErrors.allowedLoadModes)
        modeGroupRef.current?.focus();
      return;
    }

    setErrors({});
    setSaveMessage(undefined);
    setPhase("saving");
    const result = exercise
      ? await updateExerciseAction(exercise.id, validation.value)
      : await createExerciseAction(validation.value);

    if (!result.ok) {
      setErrors(result.error.fieldErrors ?? {});
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }

    returnToParent("Exercise saved.");
  }

  async function remove() {
    if (!exercise) return;
    setPhase("saving");
    setSaveMessage(undefined);
    const result = await deleteExerciseAction(exercise.id);
    if (!result.ok) {
      setPhase("failure");
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Exercise deleted.");
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={exercise ? "Edit Exercise" : "New Exercise"}
        backHref="/exercises"
        backLabel="Exercises"
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        <div className="space-y-6">
          <TextField
            id="exercise-name"
            label="Name"
            value={name}
            error={errors.name?.[0]}
            disabled={isSaving}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              markChanged("name");
            }}
          />

          <fieldset disabled={isSaving}>
            <legend className="mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
              Type
            </legend>
            <div
              role="group"
              aria-label="Exercise type"
              className="grid grid-cols-2 gap-2"
            >
              {exerciseBaseTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={baseType === type}
                  onClick={() => chooseType(type)}
                  className={`min-h-14 rounded-[var(--pf-r2)] border px-3 font-semibold ${
                    baseType === type
                      ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent-dim)] text-[var(--pf-accent-strong)]"
                      : "border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)]"
                  }`}
                >
                  {exerciseTypeLabels[type]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={isSaving}>
            <legend className="mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase">
              Optional per-set additions
            </legend>
            <p className="mb-2 text-[12.5px] text-[var(--pf-text-2)]">
              {baseModeSummary[baseType]}
            </p>
            <div className="space-y-2">
              {optionalLoadModesByBaseType[baseType].map((mode, index) => {
                const selected = modes.includes(mode);
                return (
                  <button
                    key={mode}
                    ref={index === 0 ? modeGroupRef : undefined}
                    type="button"
                    aria-pressed={selected}
                    aria-invalid={errors.allowedLoadModes ? true : undefined}
                    aria-describedby={
                      errors.allowedLoadModes
                        ? "allowed-modes-error"
                        : undefined
                    }
                    onClick={() => toggleMode(mode)}
                    className={`flex min-h-16 w-full items-center gap-3 rounded-[var(--pf-r2)] border p-3 text-left ${
                      selected
                        ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent-dim)]"
                        : "border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                        selected
                          ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent)] text-[var(--pf-on-accent)]"
                          : "border-[var(--pf-border-control)]"
                      }`}
                    >
                      {selected ? <Icon name="check" size={14} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {exerciseOptionalModeLabels[mode]}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-[var(--pf-text-2)]">
                        {exerciseModeDetails[mode]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {modeNotice ? (
              <p className="mt-2 text-[12.5px] text-[var(--pf-text-2)]">
                {modeNotice}
              </p>
            ) : null}
            {errors.allowedLoadModes ? (
              <p
                id="allowed-modes-error"
                role="alert"
                className="mt-2 text-[12.5px] font-medium text-[var(--pf-danger)]"
              >
                {errors.allowedLoadModes[0]}
              </p>
            ) : null}
          </fieldset>

          <TextAreaField
            id="exercise-note"
            label="Exercise note"
            value={note}
            disabled={isSaving}
            error={errors.persistentNote?.[0]}
            hint="Snapshotted into workouts as read-only. Editing it never changes a saved workout."
            onChange={(event) => {
              setNote(event.target.value);
              markChanged("persistentNote");
            }}
          />

          {exercise ? (
            <section className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4">
              <p className="font-semibold">
                Used in {exercise.splitUsageCount}{" "}
                {exercise.splitUsageCount === 1 ? "split" : "splits"}
              </p>
              <p className="mt-2 text-[13px] leading-[1.45] text-[var(--pf-text-2)]">
                Changes affect future workouts only. Saved and active workouts
                keep their snapshots.
              </p>
            </section>
          ) : null}
        </div>

        <StickyActionBar>
          <SaveStatus
            state={saveState}
            validationMessage={saveMessage}
            onRetry={() => void save()}
          />
          <Action disabled={isSaving} onClick={() => void save()}>
            Save Exercise
          </Action>
          {exercise ? (
            <DestructiveDialog
              title="Delete exercise?"
              description={deleteDescription(exercise.splitUsageCount)}
              confirmLabel="Delete Exercise"
              onConfirm={() => void remove()}
              trigger={
                <Action variant="danger" disabled={isSaving}>
                  Delete Exercise
                </Action>
              }
            />
          ) : null}
        </StickyActionBar>
      </main>
    </div>
  );
}

function snapshotOf(definition: {
  name: string;
  baseType: ExerciseBaseType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
}): string {
  return JSON.stringify([
    definition.name,
    definition.baseType,
    [...definition.allowedLoadModes].sort(),
    definition.persistentNote,
  ]);
}

function deleteDescription(splitUsageCount: number): string {
  const usage =
    splitUsageCount === 0
      ? "No split uses it."
      : `It is removed from ${splitUsageCount} ${splitUsageCount === 1 ? "split" : "splits"}.`;
  return `${usage} Workouts already recorded keep this exercise in History.`;
}

const baseModeSummary: Readonly<Record<ExerciseBaseType, string>> = {
  weights: "Every set stores kilograms and reps.",
  bodyweight: "Every set stores reps.",
};
