"use client";

import { useEffect, useRef, useState } from "react";

import {
  createExerciseAction,
  deleteExerciseAction,
  updateExerciseAction,
} from "@/app/actions/exercises";
import {
  baseLoadModeByBaseType,
  defaultLoadModesByBaseType,
  exerciseBaseTypes,
  exerciseMeasurementTypes,
  optionalLoadModesByBaseType,
  type Exercise,
  type ExerciseBaseType,
  type ExerciseLoadMode,
  type ExerciseMeasurementType,
} from "@/features/exercises/domain/exercise";
import { validateExerciseDefinition } from "@/features/exercises/domain/exercise-validation";
import {
  exerciseDefinitionDetail,
  exerciseModeDetails,
  exerciseOptionalModeLabels,
  exerciseTypeLabels,
} from "@/features/exercises/ui/exercise-presentation";
import {
  Action,
  ActionsPanel,
  DestructiveDialog,
  Icon,
  NameField,
  TopBar,
  UnsavedChip,
  useSaveOutcome,
  useToast,
  useTransientOverlay,
  type ActionEntry,
} from "@/shared/ui";

import "./exercise-form.css";

/*
 * The Exercise definition — the prototype's screen 14 — ported for step 17 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 937-1003, `data-screen-label="Exercise definition"`
 *   bound values  lines 2740-2741 (`dfMeasureWord`), 2828-2835 (`doSaveDef`,
 *                 `doDeleteDef`), 2855-2861 (this screen's Actions entries),
 *                 3005-3044 (`dfTitle` … `dfDelete`), 1732-1741 (`OPT_MODES`)
 *
 * The rules are the application's and were already the prototype's: an
 * exercise is weights or bodyweight, a set is counted in reps or seconds, and
 * it may carry one addition of those its type offers, which a change of type
 * clears (ADR-0023, ADR-0026).
 */

const measurementLabels: Readonly<Record<ExerciseMeasurementType, string>> = {
  reps: "Reps",
  seconds: "Seconds",
};

export function ExerciseForm({ exercise }: { exercise?: Exercise }) {
  const { showToast } = useToast();
  const { returnToParent, reportFailure } = useSaveOutcome("/exercises");
  const [name, setName] = useState(exercise?.name ?? "");
  const [baseType, setBaseType] = useState<ExerciseBaseType>(
    exercise?.baseType ?? "weights",
  );
  const [measurementType, setMeasurementType] =
    useState<ExerciseMeasurementType>(exercise?.measurementType ?? "reps");
  const [modes, setModes] = useState<readonly ExerciseLoadMode[]>(
    exercise?.allowedLoadModes ?? defaultLoadModesByBaseType.weights,
  );
  const [note, setNote] = useState(exercise?.persistentNote ?? "");
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);

  const definition = {
    name,
    baseType,
    measurementType,
    allowedLoadModes: modes,
    persistentNote: note,
  };
  const [savedSnapshot] = useState(() => snapshotOf(definition));
  /* `dfDirty` (3006). A new definition is a draft from the first frame, as
     `dfAdd` (3001) marks it; a saved one only once it differs. */
  const dirty =
    exercise === undefined || snapshotOf(definition) !== savedSnapshot;

  const actionsOverlay = useTransientOverlay();
  const confirmOverlay = useTransientOverlay();
  const pendingRef = useRef<(() => void) | null>(null);

  // What an Actions entry runs waits for the panel to give its history entry
  // back first — the mechanism steps 6, 9, 14 and 15 use.
  useEffect(() => {
    if (actionsOverlay.open) return;
    const run = pendingRef.current;
    if (run === null) return;
    pendingRef.current = null;
    run();
  }, [actionsOverlay.open]);

  const measureWord = measurementType === "seconds" ? "seconds" : "reps";

  /* `t.pick` (3016): a new type clears the addition, which belonged to the
     other type. The prototype clears it without a word; the application says
     so, because a choice the user made has gone. */
  function chooseType(next: ExerciseBaseType) {
    if (next === baseType) return;
    const hadAddition = modes.some(
      (mode) => mode !== baseLoadModeByBaseType[baseType],
    );
    setBaseType(next);
    setModes(defaultLoadModesByBaseType[next]);
    if (hadAddition)
      showToast("Choices that do not apply to this type were cleared.");
  }

  /* `o.toggle` (3031): at most one addition, and pressing the one that is on
     takes it off again. */
  function toggleMode(mode: ExerciseLoadMode) {
    const base = baseLoadModeByBaseType[baseType];
    setModes(modes.includes(mode) ? [base] : [base, mode]);
  }

  /* `doSaveDef` (2828-2834). */
  async function save() {
    const validation = validateExerciseDefinition(definition);
    if (!validation.ok) {
      const nameRefused = validation.fieldErrors.name !== undefined;
      setInvalid(nameRefused);
      showToast(
        nameRefused
          ? "Enter an exercise name."
          : (Object.values(validation.fieldErrors)[0]?.[0] ??
              "Check the exercise."),
      );
      return;
    }
    setBusy(true);
    const result = exercise
      ? await updateExerciseAction(exercise.id, validation.value)
      : await createExerciseAction(validation.value);
    setBusy(false);
    if (!result.ok) {
      setInvalid(Boolean(result.error.fieldErrors?.name));
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Exercise saved.");
  }

  async function remove() {
    if (!exercise) return;
    setBusy(true);
    const result = await deleteExerciseAction(exercise.id);
    setBusy(false);
    if (!result.ok) {
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Exercise deleted.");
  }

  /* `actRaw` for a definition (2855-2861). */
  const actions: ActionEntry[] = [
    {
      key: "save",
      label: "Save exercise",
      icon: "check",
      disabled: busy,
      run: () => {
        pendingRef.current = () => void save();
      },
    },
    ...(exercise
      ? [
          {
            key: "delete",
            label: "Delete exercise",
            icon: "trash-2" as const,
            disabled: busy,
            run: () => {
              pendingRef.current = () => confirmOverlay.requestOpenChange(true);
            },
          },
        ]
      : []),
  ];

  /* `actMeta` (2857): the definition as it now stands. */
  const meta = `${exercise ? exerciseDefinitionDetail({ ...exercise, baseType, measurementType, allowedLoadModes: modes }) : "New definition"}${dirty ? " · Unsaved changes" : ""}`;
  const usage = exercise?.splitUsageCount ?? 0;

  return (
    <div data-definition="">
      <TopBar
        screen="definition"
        title={exercise ? "Edit exercise" : "New exercise"}
        backHref="/exercises"
        backLabel="Back"
        trailing={dirty ? <UnsavedChip /> : null}
      />

      <div data-definition-body="">
        <NameField
          label="Name"
          accessibleName="Exercise name"
          value={name}
          invalid={invalid}
          disabled={busy}
          onChange={(event) => {
            setName(event.target.value);
            setInvalid(false);
          }}
        />

        {/* `dfTypes` (lines 953-960, values at 3011-3017). */}
        <section data-definition-section="" aria-labelledby="definition-type">
          <p id="definition-type">Type</p>
          <div data-definition-choices="">
            {exerciseBaseTypes.map((type) => (
              <button
                key={type}
                type="button"
                data-definition-choice=""
                aria-pressed={baseType === type}
                aria-label={exerciseTypeLabels[type]}
                disabled={busy}
                onClick={() => chooseType(type)}
              >
                {exerciseTypeLabels[type]}
              </button>
            ))}
          </div>
        </section>

        {/* `dfMeasures` (lines 962-970, values at 3018-3025). */}
        <section
          data-definition-section=""
          aria-labelledby="definition-measure"
        >
          <p id="definition-measure">Set measurement</p>
          <div data-definition-choices="">
            {exerciseMeasurementTypes.map((type) => (
              <button
                key={type}
                type="button"
                data-definition-choice=""
                aria-pressed={measurementType === type}
                aria-label={measurementLabels[type]}
                disabled={busy}
                onClick={() => setMeasurementType(type)}
              >
                {measurementLabels[type]}
              </button>
            ))}
          </div>
          <p data-definition-hint="">
            {measurementType === "seconds"
              ? "Each set records its duration in seconds."
              : "Each set records a repetition count."}
          </p>
        </section>

        {/* `dfOptions` (lines 972-984, values at 3027-3035). */}
        <section
          data-definition-section=""
          aria-labelledby="definition-additions"
        >
          <p id="definition-additions">Optional per-set additions</p>
          <p data-definition-hint="">
            {baseType === "weights"
              ? `Every set stores kilograms and ${measureWord}.`
              : `Every set stores ${measureWord}.`}
          </p>
          {optionalLoadModesByBaseType[baseType].map((mode) => {
            const on = modes.includes(mode);
            return (
              <button
                key={mode}
                type="button"
                data-definition-option=""
                aria-pressed={on}
                aria-label={exerciseOptionalModeLabels[mode]}
                disabled={busy}
                onClick={() => toggleMode(mode)}
              >
                <span data-definition-check="">
                  <Icon name="check" size={13} />
                </span>
                <span>
                  <span>{exerciseOptionalModeLabels[mode]}</span>
                  <span>
                    {exerciseModeDetails[mode].replace("reps", measureWord)}
                  </span>
                </span>
              </button>
            );
          })}
        </section>

        {/* `dfNote` (lines 986-990). */}
        <label data-definition-note="">
          <span>Exercise note</span>
          <textarea
            value={note}
            placeholder="Cue you want to see during every set"
            disabled={busy}
            onChange={(event) => setNote(event.target.value)}
          />
          <span>
            Snapshotted into workouts as read-only. Editing it never changes a
            saved workout.
          </span>
        </label>

        {/* `dfExisting` and `dfUsage` (lines 992-997). */}
        {exercise ? (
          <section data-definition-usage="">
            <p>
              Used in {usage} {usage === 1 ? "split" : "splits"}
            </p>
            <p>
              Changes affect future workouts only. Saved and active workouts
              keep their snapshots.
            </p>
          </section>
        ) : null}
      </div>

      <div data-definition-footer="">
        <ActionsPanel
          panel="definition-actions"
          heading={name.trim() || "Untitled exercise"}
          meta={meta}
          overlay={actionsOverlay}
          items={actions}
          trigger={
            <Action
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

      {exercise ? (
        <DestructiveDialog
          overlay={confirmOverlay}
          title={`Delete ${exercise.name || "this exercise"}?`}
          description={deleteDescription(usage)}
          confirmLabel="Delete exercise"
          onConfirm={() => void remove()}
        />
      ) : null}
    </div>
  );
}

function snapshotOf(definition: {
  name: string;
  baseType: ExerciseBaseType;
  measurementType: ExerciseMeasurementType;
  allowedLoadModes: readonly ExerciseLoadMode[];
  persistentNote: string;
}): string {
  return JSON.stringify([
    definition.name,
    definition.baseType,
    definition.measurementType,
    [...definition.allowedLoadModes].sort(),
    definition.persistentNote,
  ]);
}

/* `doDeleteDef` (2835). */
function deleteDescription(splitUsageCount: number): string {
  const usage =
    splitUsageCount === 0
      ? "No split uses it."
      : `It is removed from ${splitUsageCount} ${splitUsageCount === 1 ? "split" : "splits"}.`;
  return `${usage} Workouts already recorded keep this exercise in History.`;
}
