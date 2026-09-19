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
  ActionOverlay,
  ActionsTrigger,
  Badge,
  CompactStepper,
  DestructiveDialog,
  EmptyState,
  Icon,
  Kicker,
  Overlay,
  SaveStatus,
  ScreenBody,
  StickyActionBar,
  TextField,
  TopBar,
  useReorder,
  useSaveOutcome,
  useSavedSnapshot,
  useToast,
  useTransientOverlay,
  type SavePhase,
} from "@/shared/ui";

type FieldErrors = Readonly<Record<string, readonly string[]>>;
type PrescriptionField = "plannedSets" | "minReps" | "maxReps";
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
    field: PrescriptionField,
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

  async function moveExerciseTo(from: number, to: number) {
    if (to < 0 || to >= prescriptions.length || to === from) return;
    const previous = [...prescriptions];
    const reordered = [...prescriptions];
    const [moved] = reordered.splice(from, 1);
    if (!moved) return;
    reordered.splice(to, 0, moved);
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
    <SplitFormBody
      split={split}
      program={program}
      name={name}
      setName={setName}
      prescriptions={prescriptions}
      remainingExercises={remainingExercises}
      exerciseLibrary={exerciseLibrary}
      errors={errors}
      busy={busy}
      saveState={saveState}
      message={message}
      canDelete={canDelete}
      successorName={successor?.name}
      onChanged={changed}
      onSave={() => void save()}
      onDelete={() => void remove()}
      onAdd={addExercise}
      onRemove={removeExercise}
      onMove={(from, to) => void moveExerciseTo(from, to)}
      onUpdate={updatePrescription}
    />
  );
}

function SplitFormBody({
  split,
  program,
  name,
  setName,
  prescriptions,
  remainingExercises,
  exerciseLibrary,
  errors,
  busy,
  saveState,
  message,
  canDelete,
  successorName,
  onChanged,
  onSave,
  onDelete,
  onAdd,
  onRemove,
  onMove,
  onUpdate,
}: {
  split?: Split;
  program: Program;
  name: string;
  setName: (value: string) => void;
  prescriptions: readonly DraftPrescription[];
  remainingExercises: readonly Exercise[];
  exerciseLibrary: readonly Exercise[];
  errors: Readonly<Record<string, readonly string[] | undefined>>;
  busy: boolean;
  saveState: "clean" | "unsaved" | "saving" | "failure";
  message?: string;
  canDelete: boolean;
  successorName?: string;
  onChanged: (field: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onAdd: (exercise: Exercise, close: () => void) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onUpdate: (index: number, field: PrescriptionField, value: string) => void;
}) {
  const confirmDelete = useTransientOverlay();
  const reorder = useReorder({ count: prescriptions.length, onMove });
  const dirty = saveState === "unsaved";

  const countLabel = (exerciseId: string) =>
    exerciseLibrary.find((exercise) => exercise.id === exerciseId)
      ?.measurementType === "seconds"
      ? "sec"
      : "reps";

  const step = (
    index: number,
    field: PrescriptionField,
    value: string,
    delta: number,
  ) => {
    const next = Math.max(1, (Number(value) || 0) + delta);
    onUpdate(index, field, String(next));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={split ? "Split" : "New split"}
        backHref={`/programs/${program.id}/edit`}
        backLabel={program.name}
        trailing={dirty ? <Badge tone="accent">Unsaved</Badge> : undefined}
      />
      <ScreenBody className="gap-2.5">
        <TextField
          id="split-name"
          label="Split name"
          value={name}
          error={errors.name?.[0]}
          disabled={busy}
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            onChanged("name");
          }}
        />

        <div className="mt-1.5 flex min-h-11 items-center justify-between gap-3">
          <Kicker>Prescription · {prescriptions.length}</Kicker>
          {prescriptions.length > 1 ? (
            <span className="text-[12px] text-[var(--pf-text-3)]">
              Hold to reorder
            </span>
          ) : null}
        </div>

        {prescriptions.length === 0 ? (
          <EmptyState
            icon="dumbbell"
            title="No exercises yet"
            body={
              exerciseLibrary.length === 0
                ? "Add an active Exercise Library definition first."
                : "Add exercises, then set the planned sets and rep range for each."
            }
          />
        ) : (
          prescriptions.map((item, index) => {
            const row = reorder.row(index);
            const unit = countLabel(item.exerciseId);

            return (
              <section
                key={item.exerciseId}
                {...row}
                aria-label={item.exerciseName}
                className="relative cursor-grab rounded-[var(--pf-r4)] border border-transparent bg-[var(--pf-bg-surface)] pt-3.5 pr-3 pb-4 pl-[18px]"
              >
                <div className="flex items-center gap-2">
                  <h3 className="min-w-0 flex-1 text-[15.5px] leading-[1.25] font-semibold [text-wrap:pretty]">
                    {item.exerciseName}
                  </h3>
                  <button
                    type="button"
                    aria-label={`Remove ${item.exerciseName}`}
                    disabled={busy}
                    onClick={() => onRemove(index)}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-4)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:text-[var(--pf-text-2)] disabled:opacity-[var(--pf-opacity-disabled)]"
                  >
                    <Icon name="x" size={15} />
                  </button>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  <CompactStepper
                    label="Sets"
                    value={item.plannedSets}
                    decrementLabel={`One set fewer for ${item.exerciseName}`}
                    incrementLabel={`One set more for ${item.exerciseName}`}
                    onDecrement={() =>
                      step(index, "plannedSets", item.plannedSets, -1)
                    }
                    onIncrement={() =>
                      step(index, "plannedSets", item.plannedSets, 1)
                    }
                  />
                  <CompactStepper
                    label={`Min ${unit}`}
                    value={item.minReps}
                    decrementLabel={`Fewer minimum ${unit} for ${item.exerciseName}`}
                    incrementLabel={`More minimum ${unit} for ${item.exerciseName}`}
                    onDecrement={() => step(index, "minReps", item.minReps, -1)}
                    onIncrement={() => step(index, "minReps", item.minReps, 1)}
                  />
                  <CompactStepper
                    label={`Max ${unit}`}
                    value={item.maxReps}
                    decrementLabel={`Fewer maximum ${unit} for ${item.exerciseName}`}
                    incrementLabel={`More maximum ${unit} for ${item.exerciseName}`}
                    onDecrement={() => step(index, "maxReps", item.maxReps, -1)}
                    onIncrement={() => step(index, "maxReps", item.maxReps, 1)}
                  />
                </div>
                {prescriptionErrors(errors, index).map((text) => (
                  <p
                    key={text}
                    role="alert"
                    className="mt-2 text-[12.5px] font-medium text-[var(--pf-danger)]"
                  >
                    {text}
                  </p>
                ))}
              </section>
            );
          })
        )}

        {errors.exercises ? (
          <p
            role="alert"
            className="text-[12.5px] font-medium text-[var(--pf-danger)]"
          >
            {errors.exercises[0]}
          </p>
        ) : null}

        {remainingExercises.length > 0 ? (
          <Overlay
            title="Add exercise"
            description="Only active Exercise Library definitions are available."
            trigger={
              <Action variant="accent" className="mt-1" disabled={busy}>
                <Icon name="plus" size={17} />
                Add exercise
              </Action>
            }
          >
            {(close) => (
              <div className="flex flex-col gap-2">
                {remainingExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => onAdd(exercise, close)}
                    className="flex min-h-[68px] items-center gap-3.5 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[18px] py-3.5 text-left transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-border-strong)]"
                  >
                    <span className="min-w-0 flex-1 text-[15.5px] font-semibold [text-wrap:pretty]">
                      {exercise.name}
                    </span>
                    <Icon
                      name="plus"
                      size={16}
                      className="shrink-0 text-[var(--pf-accent)]"
                    />
                  </button>
                ))}
              </div>
            )}
          </Overlay>
        ) : null}

        <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
          Prescriptions seed future workouts. Saved workouts keep their
          snapshots.
        </p>
      </ScreenBody>

      <StickyActionBar>
        <SaveStatus
          state={saveState}
          validationMessage={message}
          onRetry={onSave}
        />
        <ActionOverlay
          trigger={
            <ActionsTrigger
              label="Split actions"
              tone={dirty ? "accent" : "muted"}
              disabled={busy}
            />
          }
          title={name.trim() === "" ? "New split" : name}
          meta={`${prescriptions.length} ${prescriptions.length === 1 ? "exercise" : "exercises"}`}
          actions={[
            {
              key: "save",
              label: split ? "Save changes" : "Save split",
              icon: "check",
              onRun: onSave,
            },
            ...(split
              ? [
                  {
                    key: "delete",
                    label: canDelete
                      ? "Delete this split"
                      : "Delete — the current program must keep at least one split",
                    icon: "trash-2" as const,
                    disabled: !canDelete,
                    onRun: () => confirmDelete.requestOpenChange(true),
                  },
                ]
              : []),
          ]}
        />
      </StickyActionBar>

      <DestructiveDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.requestOpenChange}
        title="Delete split?"
        description={
          split && program.nextSplitId === split.id && successorName
            ? `The next split moves to ${successorName}. Workouts already recorded keep this split in History.`
            : "Workouts already recorded keep this split in History."
        }
        confirmLabel="Delete split"
        onConfirm={onDelete}
      />
    </div>
  );
}

/** Every message the prescription's own fields produced, in field order. */
function prescriptionErrors(
  errors: Readonly<Record<string, readonly string[] | undefined>>,
  index: number,
): string[] {
  return (["plannedSets", "minReps", "maxReps"] as const)
    .map((field) => errors[`exercises.${index}.${field}`]?.[0])
    .filter((text): text is string => text !== undefined);
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
