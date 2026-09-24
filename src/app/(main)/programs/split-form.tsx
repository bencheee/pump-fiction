"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  createSplitAction,
  deleteSplitAction,
  reorderSplitExercisesAction,
  updateSplitAction,
} from "@/app/actions/programs";
import type {
  Exercise,
  ExerciseMeasurementType,
} from "@/features/exercises/domain/exercise";
import { exerciseDefinitionDetail } from "@/features/exercises/ui/exercise-presentation";
import type {
  Program,
  Split,
  SplitExercisePrescription,
} from "@/features/programs/domain/program";
import { validateSplitDefinition } from "@/features/programs/domain/program-validation";
import {
  Action,
  ActionsPanel,
  DestructiveDialog,
  EmptyCard,
  Icon,
  NameField,
  SectionHead,
  Sheet,
  TopBar,
  UnsavedChip,
  useHoldReorder,
  useSaveOutcome,
  useToast,
  useTransientOverlay,
  type ActionEntry,
  type ReorderRowProps,
} from "@/shared/ui";

import "./split-form.css";

/*
 * The Split editor — the prototype's screen 12, with Add exercise to split,
 * its screen 19 — ported for step 15 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 836-896, `data-screen-label="Split editor"`
 *                 lines 1233-1253, `data-screen-label="Add exercise to split"`
 *   bound values  lines 2686-2721 (`sfExercises`, `sfRemaining`), 2817-2827
 *                 (`doSaveSplit`, `doDeleteSplit`), 2847-2854 (this screen's
 *                 Actions entries), 2957-2982 (`sfTitle` … `sfAddOptions`),
 *                 1782 (`defDetail`)
 *
 * The name and the prescriptions are held for Save, as they always were here
 * and as the prototype's draft holds them. The order of an existing split's
 * exercises is written the moment a row is let go, as it always has been, so a
 * reorder alone leaves nothing unsaved.
 */

/** `gRow` (2578): the height an unmeasured prescription card is taken to be. */
const fallbackRowHeight = 76;

type Draft = Readonly<{
  exerciseId: string;
  exerciseName: string;
  measurementType: ExerciseMeasurementType;
  plannedSets: number;
  minReps: number;
  maxReps: number;
}>;

type Field = "plannedSets" | "minReps" | "maxReps";

export function SplitForm({
  program,
  split,
  exerciseLibrary,
}: {
  program: Program;
  split?: Split;
  exerciseLibrary: readonly Exercise[];
}) {
  const { showToast } = useToast();
  const { returnToParent, reportFailure } = useSaveOutcome(
    `/programs/${program.id}/edit`,
  );
  const [name, setName] = useState(split?.name ?? "");
  const [drafts, setDrafts] = useState<readonly Draft[]>(() =>
    (split?.exercises ?? []).map(toDraft),
  );
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  // What the server holds, which `Unsaved` is measured against: the name and
  // the prescriptions apart, because a reorder writes the second alone.
  const [savedName, setSavedName] = useState(split?.name ?? "");
  const [savedRows, setSavedRows] = useState(() => rowsOf(drafts));
  const rowsDirty = rowsOf(drafts) !== savedRows;
  const dirty = name !== savedName || rowsDirty;

  const actionsOverlay = useTransientOverlay();
  const addOverlay = useTransientOverlay();
  const confirmOverlay = useTransientOverlay();
  const pendingRef = useRef<(() => void) | null>(null);
  const actionsRef = useRef<HTMLButtonElement>(null);

  // What an Actions entry runs waits for the panel to give its history entry
  // back first — the mechanism steps 6, 9 and 14 use.
  useEffect(() => {
    if (actionsOverlay.open) return;
    const run = pendingRef.current;
    if (run === null) return;
    pendingRef.current = null;
    run();
  }, [actionsOverlay.open]);

  const reorder = useHoldReorder({
    count: drafts.length,
    fallbackHeight: fallbackRowHeight,
    onMove: (from, to) => void moveExercise(from, to),
  });

  /* `sfRemaining` (2721): what the library holds that the split does not. */
  const remaining = exerciseLibrary.filter(
    (exercise) => !drafts.some((item) => item.exerciseId === exercise.id),
  );
  /* `sfCanDelete` (2966): the current program keeps at least one split. */
  const canDelete =
    split !== undefined && (!program.isCurrent || program.splits.length > 1);

  /* `adj` (2689-2696): sets run 1 to 10, the minimum up to the maximum and the
     maximum from the minimum to 180. A value already past a bound is left
     where it is rather than pulled back by a press toward it. */
  function adjust(index: number, field: Field, delta: -1 | 1) {
    setDrafts((current) =>
      current.map((item, position) => {
        if (position !== index) return item;
        const value = item[field];
        const [low, high] =
          field === "plannedSets"
            ? [1, 10]
            : field === "minReps"
              ? [1, item.maxReps]
              : [item.minReps, 180];
        const next = value + delta;
        if (next < low || next > high) return item;
        return { ...item, [field]: next };
      }),
    );
  }

  /* `o.pick` (2974-2981): a new prescription is 3 × 8–12, or 3 × 20–40 for an
     exercise measured in seconds. */
  function addExercise(exercise: Exercise) {
    const seconds = exercise.measurementType === "seconds";
    setDrafts((current) => [
      ...current,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        measurementType: exercise.measurementType ?? "reps",
        plannedSets: 3,
        minReps: seconds ? 20 : 8,
        maxReps: seconds ? 40 : 12,
      },
    ]);
    addOverlay.requestOpenChange(false);
  }

  /* `ex.remove` (2708-2712). */
  function removeExercise(index: number) {
    setDrafts((current) =>
      current.filter((_unused, position) => position !== index),
    );
  }

  /* `gripUp` (2703-2707). An existing split whose prescriptions are as saved
     writes its new order at once; one holding unsaved prescriptions, or a new
     one, keeps the order for Save with everything else. */
  async function moveExercise(from: number, to: number) {
    const previous = drafts;
    const reordered = [...drafts];
    const [moved] = reordered.splice(from, 1);
    if (moved === undefined) return;
    reordered.splice(to, 0, moved);
    setDrafts(reordered);
    if (!split || rowsDirty) return;
    const result = await reorderSplitExercisesAction(
      split.id,
      reordered.map((item) => item.exerciseId),
    );
    if (!result.ok) {
      setDrafts(previous);
      reportFailure(result.error.message);
      return;
    }
    setSavedRows(rowsOf(reordered));
    showToast("Order saved.");
  }

  /* `doSaveSplit` (2817-2827). */
  async function save() {
    const validation = validateSplitDefinition({
      name,
      exercises: drafts.map((item) => ({
        exerciseId: item.exerciseId,
        plannedSets: item.plannedSets,
        minReps: item.minReps,
        maxReps: item.maxReps,
      })),
    });
    if (!validation.ok) {
      const nameRefused = validation.fieldErrors.name !== undefined;
      setInvalid(nameRefused);
      showToast(
        nameRefused
          ? "Enter a split name."
          : (Object.values(validation.fieldErrors)[0]?.[0] ??
              "Check the split."),
      );
      return;
    }
    setBusy(true);
    const result = split
      ? await updateSplitAction(split.id, validation.value)
      : await createSplitAction(program.id, validation.value);
    setBusy(false);
    if (!result.ok) {
      setInvalid(Boolean(result.error.fieldErrors?.name));
      reportFailure(result.error.message);
      return;
    }
    setSavedName(name);
    setSavedRows(rowsOf(drafts));
    returnToParent("Split saved.");
  }

  async function remove() {
    if (!split) return;
    setBusy(true);
    const result = await deleteSplitAction(split.id);
    setBusy(false);
    if (!result.ok) {
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Split deleted.");
  }

  /* `actRaw` for a split (2847-2854). */
  const actions: ActionEntry[] = [
    {
      key: "save",
      label: split ? "Save changes" : "Save split",
      icon: "check",
      disabled: busy,
      run: () => {
        pendingRef.current = () => void save();
      },
    },
    {
      key: "add",
      label: "Add exercise",
      icon: "plus",
      disabled: busy,
      run: () => {
        pendingRef.current = () => addOverlay.requestOpenChange(true);
      },
    },
    ...(canDelete
      ? [
          {
            key: "delete",
            label: "Delete split",
            icon: "trash-2" as const,
            disabled: busy,
            run: () => {
              pendingRef.current = () => confirmOverlay.requestOpenChange(true);
            },
          },
        ]
      : []),
  ];

  const successor = split ? successorAfter(program, split.id) : undefined;
  const count = drafts.length;

  return (
    <div data-split-editor="">
      <TopBar
        screen="split-editor"
        title={split ? "Edit split" : "New split"}
        backHref={`/programs/${program.id}/edit`}
        backLabel="Back"
        trailing={dirty ? <UnsavedChip /> : null}
      />

      <div data-split-editor-body="">
        <NameField
          label="Split name"
          value={name}
          invalid={invalid}
          disabled={busy}
          onChange={(event) => {
            setName(event.target.value);
            setInvalid(false);
          }}
        />

        <SectionHead aside="Hold to reorder">
          Prescription · {count}
        </SectionHead>

        {drafts.map((item, index) => (
          <PrescriptionCard
            key={item.exerciseId}
            item={item}
            index={index}
            count={count}
            disabled={busy}
            gesture={reorder.rowProps(index)}
            onAdjust={(field, delta) => adjust(index, field, delta)}
            onRemove={() => removeExercise(index)}
          />
        ))}

        {count === 0 ? (
          <EmptyCard icon="dumbbell" title="No exercises yet">
            {exerciseLibrary.length === 0
              ? "Add an exercise to the Exercise Library first."
              : "Add exercises, then set the planned sets and rep range for each."}
          </EmptyCard>
        ) : null}

        <Action
          variant="add"
          aria-label="Add exercise"
          title="Add exercise"
          disabled={busy}
          onClick={() => addOverlay.requestOpenChange(true)}
        >
          <Icon name="plus" size={17} />
          Add exercise
        </Action>

        <p data-split-editor-footnote="">
          Prescriptions seed future workouts. Saved workouts keep their
          snapshots.
        </p>
      </div>

      <div data-split-editor-footer="">
        <ActionsPanel
          panel="split-actions"
          heading={name.trim() || "Untitled split"}
          meta={`${count} ${count === 1 ? "exercise" : "exercises"}${dirty ? " · Unsaved changes" : ""}`}
          overlay={actionsOverlay}
          items={actions}
          trigger={
            <Action
              ref={actionsRef}
              variant="actions"
              data-edits=""
              aria-label="Actions"
              title="Actions"
            >
              {"···"}
            </Action>
          }
        />
      </div>

      <Sheet
        panel="add-to-split"
        overlay={addOverlay}
        returnFocusRef={actionsRef}
        title="Add exercise"
        description="Only active Exercise Library definitions are available."
      >
        {remaining.map((exercise, index) => (
          <button
            key={exercise.id}
            type="button"
            data-add-option=""
            aria-label={exercise.name}
            style={
              {
                "--option-delay": `${40 + Math.min(index, 8) * 40}ms`,
              } as CSSProperties
            }
            onClick={() => addExercise(exercise)}
          >
            <span>
              <span>{exercise.name}</span>
              <span>{exerciseDefinitionDetail(exercise)}</span>
            </span>
            <Icon name="plus" size={16} />
          </button>
        ))}
        {remaining.length === 0 ? (
          <p data-add-option-empty="">
            {exerciseLibrary.length === 0
              ? "The Exercise Library holds no exercise yet."
              : "Every library exercise is already in this split."}
          </p>
        ) : null}
      </Sheet>

      {split ? (
        <DestructiveDialog
          overlay={confirmOverlay}
          title={`Delete ${split.name || "this split"}?`}
          description={
            program.nextSplitId === split.id && successor
              ? `The next split moves to ${successor.name}. Workouts already recorded keep this split in History.`
              : "Workouts already recorded keep this split in History."
          }
          confirmLabel="Delete split"
          onConfirm={() => void remove()}
        />
      ) : null}
    </div>
  );
}

/*
 * `sfExercises` (lines 857-876, values at 2686-2719). The card is a
 * `<section>` in the prototype and so here; it is focusable, which the
 * prototype's is not, so Alt with an arrow moves it.
 */
function PrescriptionCard({
  item,
  index,
  count,
  disabled,
  gesture,
  onAdjust,
  onRemove,
}: {
  item: Draft;
  index: number;
  count: number;
  disabled: boolean;
  gesture: ReorderRowProps;
  onAdjust: (field: Field, delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  const seconds = item.measurementType === "seconds";
  const fields: readonly {
    key: Field;
    label: string;
    downLabel: string;
    upLabel: string;
  }[] = [
    {
      key: "plannedSets",
      label: "Sets",
      downLabel: "One set fewer",
      upLabel: "One set more",
    },
    {
      key: "minReps",
      label: seconds ? "Min sec" : "Min reps",
      downLabel: "Lower the minimum",
      upLabel: "Raise the minimum",
    },
    {
      key: "maxReps",
      label: seconds ? "Max sec" : "Max reps",
      downLabel: "Lower the maximum",
      upLabel: "Raise the maximum",
    },
  ];

  return (
    <section
      {...gesture}
      data-prescription=""
      tabIndex={0}
      aria-label={`${item.exerciseName}, position ${index + 1} of ${count}`}
    >
      <div data-prescription-head="">
        <h3>{item.exerciseName}</h3>
        <Action
          variant="row-icon"
          aria-label={`Remove ${item.exerciseName}`}
          title="Remove"
          disabled={disabled}
          onClick={onRemove}
        >
          <Icon name="x" size={15} />
        </Action>
      </div>
      <div data-prescription-fields="">
        {fields.map((field) => (
          <div key={field.key} data-prescription-field="">
            <span>{field.label}</span>
            <div>
              {/* The prototype names the button and not the exercise; a
                  screen with several of these says whose it is. */}
              <button
                type="button"
                aria-label={`${field.downLabel}, ${item.exerciseName}`}
                disabled={disabled}
                onClick={() => onAdjust(field.key, -1)}
              >
                <Icon name="minus" size={12} />
              </button>
              <span aria-live="polite">{item[field.key]}</span>
              <button
                type="button"
                aria-label={`${field.upLabel}, ${item.exerciseName}`}
                disabled={disabled}
                onClick={() => onAdjust(field.key, 1)}
              >
                <Icon name="plus" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function toDraft(item: SplitExercisePrescription): Draft {
  return {
    exerciseId: item.exerciseId,
    exerciseName: item.exerciseName,
    measurementType: item.measurementType ?? "reps",
    plannedSets: item.plannedSets,
    minReps: item.minReps,
    maxReps: item.maxReps,
  };
}

/** The prescriptions as `Unsaved` compares them: order and the three numbers. */
function rowsOf(drafts: readonly Draft[]): string {
  return JSON.stringify(
    drafts.map((item) => [
      item.exerciseId,
      item.plannedSets,
      item.minReps,
      item.maxReps,
    ]),
  );
}

function successorAfter(program: Program, splitId: string) {
  const { splits } = program;
  const index = splits.findIndex((item) => item.id === splitId);
  if (index < 0 || splits.length <= 1) return undefined;
  return splits[(index + 1) % splits.length];
}
