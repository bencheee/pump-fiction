"use client";

import { useState } from "react";

import {
  createSplitAction,
  deleteSplitAction,
  reorderSplitExercisesAction,
  updateSplitAction,
} from "@/app/actions/programs";
import type { Exercise } from "@/features/exercises/domain/exercise";
import type {
  Program,
  Split,
  SplitExercisePrescription,
} from "@/features/programs/domain/program";
import { validateSplitDefinition } from "@/features/programs/domain/program-validation";
import {
  Action,
  DestructiveDialog,
  EmptyState,
  Icon,
  NumericField,
  SaveStatus,
  Sheet,
  StickyActionBar,
  TextField,
  TopBar,
  useSaveOutcome,
  useSavedSnapshot,
  useToast,
  type SavePhase,
} from "@/shared/ui";

type FieldErrors = Readonly<Record<string, readonly string[]>>;
type DraftPrescription = Omit<
  SplitExercisePrescription,
  "position" | "plannedSets" | "minReps" | "maxReps"
> & {
  plannedSets: string;
  minReps: string;
  maxReps: string;
};

export function SplitForm({
  program,
  split,
  exerciseLibrary,
}: {
  program: Program;
  split?: Split;
  exerciseLibrary: readonly Exercise[];
}) {
  const [name, setName] = useState(split?.name ?? "");
  const [prescriptions, setPrescriptions] = useState<
    readonly DraftPrescription[]
  >(() => (split?.exercises ?? []).map(toDraftPrescription));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>();
  const [phase, setPhase] = useState<SavePhase>("editing");
  const { returnToParent, reportFailure } = useSaveOutcome(
    `/programs/${program.id}/edit`,
  );
  const { showToast } = useToast();
  const { savedSnapshot, acceptAsSaved } = useSavedSnapshot(
    snapshotOf(name, prescriptions),
  );
  const busy = phase === "saving";
  const saveState =
    phase === "editing"
      ? snapshotOf(name, prescriptions) === savedSnapshot
        ? "clean"
        : "unsaved"
      : phase;
  const canDelete = !program.isCurrent || program.splits.length > 1;
  const remainingExercises = exerciseLibrary.filter(
    (exercise) =>
      !prescriptions.some((item) => item.exerciseId === exercise.id),
  );

  function changed(field?: string) {
    setPhase("editing");
    setMessage(undefined);
    if (!field) return;
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function addExercise(exercise: Exercise, close: () => void) {
    setPrescriptions((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        measurementType: exercise.measurementType ?? "reps",
        plannedSets: "3",
        minReps: "8",
        maxReps: "12",
      },
    ]);
    changed("exercises");
    close();
  }

  function updatePrescription(
    index: number,
    field: "plannedSets" | "minReps" | "maxReps",
    value: string,
  ) {
    setPrescriptions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    changed(`exercises.${index}.${field}`);
  }

  function removeExercise(index: number) {
    setPrescriptions((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    changed("exercises");
  }

  async function moveExercise(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= prescriptions.length) return;
    const previous = [...prescriptions];
    const reordered = [...prescriptions];
    [reordered[index], reordered[destination]] = [
      reordered[destination]!,
      reordered[index]!,
    ];
    setPrescriptions(reordered);
    if (!split) {
      showToast("Order updated. Save the split to keep it.");
      changed();
      return;
    }
    const result = await reorderSplitExercisesAction(
      split.id,
      reordered.map((item) => item.exerciseId),
    );
    if (!result.ok) {
      setPrescriptions(previous);
      setMessage(result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    setPhase("editing");
    acceptAsSaved(snapshotOf(name, reordered));
    showToast("Order saved.");
  }

  async function save() {
    const input = {
      name,
      exercises: prescriptions.map((item) => ({
        exerciseId: item.exerciseId,
        plannedSets: numericValue(item.plannedSets),
        minReps: numericValue(item.minReps),
        maxReps: numericValue(item.maxReps),
      })),
    };
    const validation = validateSplitDefinition(input);
    if (!validation.ok) {
      setErrors(validation.fieldErrors);
      setMessage(validationMessage);
      setPhase("editing");
      reportFailure(validationMessage);
      return;
    }

    setErrors({});
    setMessage(undefined);
    setPhase("saving");
    const result = split
      ? await updateSplitAction(split.id, validation.value)
      : await createSplitAction(program.id, validation.value);
    if (!result.ok) {
      setErrors(result.error.fieldErrors ?? {});
      setMessage(result.error.retryable ? undefined : result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Split saved.");
  }

  async function remove() {
    if (!split) return;
    setPhase("saving");
    const result = await deleteSplitAction(split.id);
    if (!result.ok) {
      setMessage(result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Split deleted.");
  }

  const successor = split ? successorAfter(program, split.id) : undefined;

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={split ? "Edit Split" : "New Split"}
        backHref={`/programs/${program.id}/edit`}
        backLabel={program.name}
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        <div className="space-y-6">
          <TextField
            id="split-name"
            label="Split name"
            value={name}
            error={errors.name?.[0]}
            disabled={busy}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              changed("name");
            }}
          />

          <section aria-labelledby="exercise-prescriptions-title">
            <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
              <h2
                id="exercise-prescriptions-title"
                className="text-[11px] font-semibold tracking-[0.1em] uppercase"
              >
                Prescription · {prescriptions.length}
              </h2>
              {remainingExercises.length > 0 ? (
                <Sheet
                  title="Add exercise"
                  description="Only active Exercise Library definitions are available."
                  trigger={
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 rounded-[var(--pf-r2)] px-2 font-semibold text-[var(--pf-accent-strong)]"
                    >
                      <Icon name="plus" size={16} /> Add Exercise
                    </button>
                  }
                >
                  {(close) => (
                    <div className="space-y-2">
                      {remainingExercises.map((exercise) => (
                        <Action
                          key={exercise.id}
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() => addExercise(exercise, close)}
                        >
                          {exercise.name}
                        </Action>
                      ))}
                    </div>
                  )}
                </Sheet>
              ) : null}
            </div>

            {prescriptions.length === 0 ? (
              <EmptyState
                title="No exercises yet"
                body={
                  exerciseLibrary.length === 0
                    ? "Add an active Exercise Library definition first."
                    : "Add exercises and define sets and rep ranges."
                }
              />
            ) : (
              <div className="space-y-3">
                {prescriptions.map((item, index) => (
                  <article
                    key={item.exerciseId}
                    className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-3"
                  >
                    <div className="flex min-h-11 items-center gap-2">
                      <Icon
                        name="grip-vertical"
                        size={18}
                        className="text-[var(--pf-text-3-deep)]"
                      />
                      <h3 className="min-w-0 flex-1 font-semibold [overflow-wrap:anywhere]">
                        {item.exerciseName}
                      </h3>
                      <button
                        type="button"
                        aria-label={`Move ${item.exerciseName} up`}
                        disabled={busy || index === 0}
                        onClick={() => void moveExercise(index, -1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-up" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${item.exerciseName} down`}
                        disabled={busy || index === prescriptions.length - 1}
                        onClick={() => void moveExercise(index, 1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-down" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${item.exerciseName}`}
                        disabled={busy}
                        onClick={() => removeExercise(index)}
                        className="flex size-11 items-center justify-center text-[var(--pf-danger)] disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="x" size={18} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <NumericField
                        id={`sets-${index}`}
                        label="Sets"
                        type="number"
                        min="1"
                        step="1"
                        value={item.plannedSets}
                        error={errors[`exercises.${index}.plannedSets`]?.[0]}
                        disabled={busy}
                        onChange={(event) =>
                          updatePrescription(
                            index,
                            "plannedSets",
                            event.target.value,
                          )
                        }
                      />
                      <NumericField
                        id={`min-reps-${index}`}
                        label={
                          exerciseLibrary.find(
                            (exercise) => exercise.id === item.exerciseId,
                          )?.measurementType === "seconds"
                            ? "Min seconds"
                            : "Min reps"
                        }
                        type="number"
                        min="1"
                        step="1"
                        value={item.minReps}
                        error={errors[`exercises.${index}.minReps`]?.[0]}
                        disabled={busy}
                        onChange={(event) =>
                          updatePrescription(
                            index,
                            "minReps",
                            event.target.value,
                          )
                        }
                      />
                      <NumericField
                        id={`max-reps-${index}`}
                        label={
                          exerciseLibrary.find(
                            (exercise) => exercise.id === item.exerciseId,
                          )?.measurementType === "seconds"
                            ? "Max seconds"
                            : "Max reps"
                        }
                        type="number"
                        min="1"
                        step="1"
                        value={item.maxReps}
                        error={errors[`exercises.${index}.maxReps`]?.[0]}
                        disabled={busy}
                        onChange={(event) =>
                          updatePrescription(
                            index,
                            "maxReps",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
            {errors.exercises ? (
              <p
                role="alert"
                className="mt-2 text-[12.5px] font-medium text-[var(--pf-danger)]"
              >
                {errors.exercises[0]}
              </p>
            ) : null}
            <p className="mt-3 text-[12.5px] text-[var(--pf-text-2)]">
              Prescriptions seed future workouts. Saved workouts keep their
              snapshots.
            </p>
          </section>
        </div>

        <StickyActionBar>
          <SaveStatus
            state={saveState}
            validationMessage={message}
            onRetry={() => void save()}
          />
          <Action disabled={busy} onClick={() => void save()}>
            Save Split
          </Action>
          {split && canDelete ? (
            <DestructiveDialog
              title="Delete split?"
              description={
                program.nextSplitId === split.id && successor
                  ? `The next split moves to ${successor.name}. Workouts already recorded keep this split in History.`
                  : "Workouts already recorded keep this split in History."
              }
              confirmLabel="Delete Split"
              onConfirm={() => void remove()}
              trigger={
                <Action variant="danger" disabled={busy}>
                  Delete Split
                </Action>
              }
            />
          ) : null}
          {split && !canDelete ? (
            <div>
              <Action variant="danger" className="w-full" disabled>
                Delete Split
              </Action>
              <p className="mt-2 text-center text-[12.5px] text-[var(--pf-text-2)]">
                The current program must keep at least one split.
              </p>
            </div>
          ) : null}
        </StickyActionBar>
      </main>
    </div>
  );
}

const validationMessage = "Check the highlighted fields.";

function snapshotOf(
  name: string,
  prescriptions: readonly DraftPrescription[],
): string {
  return JSON.stringify([
    name,
    prescriptions.map((item) => [
      item.exerciseId,
      item.measurementType,
      item.plannedSets,
      item.minReps,
      item.maxReps,
    ]),
  ]);
}

function toDraftPrescription(
  item: SplitExercisePrescription,
): DraftPrescription {
  return {
    exerciseId: item.exerciseId,
    exerciseName: item.exerciseName,
    measurementType: item.measurementType ?? "reps",
    plannedSets: String(item.plannedSets),
    minReps: String(item.minReps),
    maxReps: String(item.maxReps),
  };
}

function numericValue(value: string): number {
  return value.trim() === "" ? 0 : Number(value);
}

function successorAfter(program: Program, splitId: string) {
  const { splits } = program;
  const index = splits.findIndex((item) => item.id === splitId);
  if (index < 0 || splits.length <= 1) return undefined;
  return splits[(index + 1) % splits.length];
}
