"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { correctHistoryWorkoutAction } from "@/app/actions/workout-history";
import { setModeFields } from "@/features/active-workout/domain/set-entry";
import type { Exercise } from "@/features/exercises/domain/exercise";
import type {
  HistoryCorrection,
  HistoryWorkout,
  HistoryWorkoutExercise,
} from "@/features/history/domain/workout-history";
import {
  Action,
  Badge,
  Chip,
  DestructiveDialog,
  Icon,
  NumericField,
  PageFrame,
  SaveStatus,
  Sheet,
  StickyActionBar,
  TextAreaField,
  TextField,
  TopBar,
  useSaveOutcome,
  useSavedSnapshot,
  type SavePhase,
} from "@/shared/ui";

import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../../../history-presentation";

type SetDraft = Readonly<{
  loadKg: string;
  bandStrength: string;
  reps: string;
}>;

type Draft = Readonly<{
  workoutDate: string;
  startedAt: string;
  finishedAt: string;
  notes: Readonly<Record<string, string>>;
  sets: Readonly<Record<string, SetDraft>>;
}>;

function draftOf(workout: HistoryWorkout): Draft {
  return {
    workoutDate: workout.workoutDate,
    startedAt: toDateTimeLocalValue(workout.startedAt),
    finishedAt: toDateTimeLocalValue(workout.finishedAt),
    notes: Object.fromEntries(
      workout.exercises.map((exercise) => [exercise.id, exercise.workoutNote]),
    ),
    sets: Object.fromEntries(
      workout.exercises.flatMap((exercise) =>
        exercise.sets.map((set) => [
          set.id,
          {
            loadKg: set.loadKg === null ? "" : String(set.loadKg),
            bandStrength: set.bandStrength ?? "",
            reps: set.reps === null ? "" : String(set.reps),
          },
        ]),
      ),
    ),
  };
}

export function WorkoutCorrectionForm({
  workout,
  library,
}: {
  workout: HistoryWorkout;
  library: readonly Exercise[];
}) {
  const router = useRouter();
  const detailHref = `/history/workouts/${workout.id}`;
  const initial = useMemo(() => draftOf(workout), [workout]);
  const [draft, setDraft] = useState<Draft>(initial);
  // A structural correction reloads the workout from the server. Adopt the
  // reloaded snapshot as the new baseline; the form is never dirty at that
  // point, because structural actions are disabled while it is.
  const [syncedWorkout, setSyncedWorkout] = useState(workout);
  if (syncedWorkout !== workout) {
    setSyncedWorkout(workout);
    setDraft(initial);
  }
  const [phase, setPhase] = useState<SavePhase>("editing");
  const [validation, setValidation] = useState<string>();
  const [pending, startTransition] = useTransition();
  const { savedSnapshot, acceptAsSaved } = useSavedSnapshot(
    JSON.stringify(initial),
  );
  if (syncedWorkout !== workout) acceptAsSaved(JSON.stringify(initial));
  const { returnToParent, reportFailure } = useSaveOutcome(detailHref);

  const snapshot = JSON.stringify(draft);
  const dirty = snapshot !== savedSnapshot;

  const runCorrections = (
    corrections: readonly HistoryCorrection[],
    onDone: () => void,
  ) => {
    setPhase("saving");
    setValidation(undefined);
    startTransition(async () => {
      for (const correction of corrections) {
        const result = await correctHistoryWorkoutAction(correction);
        if (!result.ok) {
          setPhase("failure");
          setValidation(result.error.message);
          reportFailure(result.error.message);
          return;
        }
      }
      onDone();
    });
  };

  const save = () => {
    const startedAt = fromDateTimeLocalValue(draft.startedAt);
    const finishedAt = fromDateTimeLocalValue(draft.finishedAt);
    if (startedAt === null || finishedAt === null) {
      setPhase("failure");
      setValidation("Enter a valid start and finish time.");
      return;
    }

    const corrections: HistoryCorrection[] = [
      {
        kind: "timing",
        workoutId: workout.id,
        workoutDate: draft.workoutDate,
        startedAt,
        finishedAt,
      },
    ];

    for (const exercise of workout.exercises) {
      const note = draft.notes[exercise.id] ?? "";
      if (note !== exercise.workoutNote)
        corrections.push({
          kind: "exercise_note",
          workoutExerciseId: exercise.id,
          note,
        });
      for (const set of exercise.sets) {
        const entry = draft.sets[set.id];
        if (!entry) continue;
        const loadKg = entry.loadKg === "" ? null : Number(entry.loadKg);
        const reps = entry.reps === "" ? null : Number(entry.reps);
        const bandStrength =
          entry.bandStrength === ""
            ? null
            : (entry.bandStrength as "light" | "medium" | "strong");
        if (
          loadKg === set.loadKg &&
          reps === set.reps &&
          bandStrength === set.bandStrength
        )
          continue;
        corrections.push({
          kind: "update_set",
          workoutSetId: set.id,
          loadMode: set.loadMode,
          loadKg,
          bandDirection: set.bandDirection,
          bandStrength,
          reps,
        });
      }
    }

    runCorrections(corrections, () => {
      acceptAsSaved(snapshot);
      setPhase("editing");
      returnToParent(
        "Workout corrected. Affected statistics were recalculated.",
      );
    });
  };

  // A structural change reloads the workout from the server, so it must not run
  // while the form holds edits that reload would discard.
  const structural = (correction: HistoryCorrection) =>
    runCorrections([correction], () => {
      setPhase("editing");
      router.refresh();
    });

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Edit workout" backHref={detailHref} backLabel="Workout" />
      <PageFrame title={workout.name} className="pt-5">
        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            When
          </h2>
          <TextField
            id="workout-date"
            label="Date"
            type="date"
            value={draft.workoutDate}
            onChange={(event) =>
              setDraft({ ...draft, workoutDate: event.target.value })
            }
          />
          <TextField
            id="workout-started"
            label="Started"
            type="datetime-local"
            value={draft.startedAt}
            onChange={(event) =>
              setDraft({ ...draft, startedAt: event.target.value })
            }
          />
          <TextField
            id="workout-finished"
            label="Finished"
            type="datetime-local"
            value={draft.finishedAt}
            hint="The recorded active duration stays as measured; it is not recalculated from these times."
            onChange={(event) =>
              setDraft({ ...draft, finishedAt: event.target.value })
            }
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Exercises
          </h2>
          {dirty ? (
            <p className="text-[12.5px] text-[var(--pf-text-2)]">
              Save your changes before adding, removing, or reordering.
            </p>
          ) : null}
          <ul className="flex flex-col gap-3">
            {workout.exercises.map((exercise, index) => (
              <li key={exercise.id}>
                <ExerciseCard
                  exercise={exercise}
                  index={index}
                  count={workout.exercises.length}
                  draft={draft}
                  disabled={pending || dirty}
                  onNote={(note) =>
                    setDraft({
                      ...draft,
                      notes: { ...draft.notes, [exercise.id]: note },
                    })
                  }
                  onSet={(setId, value) =>
                    setDraft({
                      ...draft,
                      sets: { ...draft.sets, [setId]: value },
                    })
                  }
                  onStructural={structural}
                  onMove={(direction) => {
                    const ids = workout.exercises.map((item) => item.id);
                    const target = index + direction;
                    if (target < 0 || target >= ids.length) return;
                    const moved = ids[index];
                    const other = ids[target];
                    if (moved === undefined || other === undefined) return;
                    ids[index] = other;
                    ids[target] = moved;
                    structural({
                      kind: "reorder_exercises",
                      workoutId: workout.id,
                      workoutExerciseIds: ids,
                    });
                  }}
                />
              </li>
            ))}
          </ul>
          <Sheet
            trigger={
              <Action variant="secondary" disabled={pending || dirty}>
                Add exercise
              </Action>
            }
            title="Add an exercise"
            description="It joins this workout only, with the definition as it stands now."
          >
            {(close) => (
              <ul className="flex flex-col gap-2">
                {library.length === 0 ? (
                  <li className="text-[var(--pf-text-2)]">
                    Your library has no exercises.
                  </li>
                ) : (
                  library.map((item) => (
                    <li key={item.id}>
                      <Action
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          close();
                          structural({
                            kind: "add_exercise",
                            workoutId: workout.id,
                            exerciseId: item.id,
                          });
                        }}
                      >
                        {item.name}
                      </Action>
                    </li>
                  ))
                )}
              </ul>
            )}
          </Sheet>
        </section>
      </PageFrame>

      <StickyActionBar>
        <SaveStatus
          state={
            phase === "saving"
              ? "saving"
              : phase === "failure"
                ? "failure"
                : dirty
                  ? "unsaved"
                  : "clean"
          }
          validationMessage={phase === "failure" ? validation : undefined}
        />
        <Action onClick={save} disabled={pending}>
          Save corrections
        </Action>
      </StickyActionBar>
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  count,
  draft,
  disabled,
  onNote,
  onSet,
  onStructural,
  onMove,
}: {
  exercise: HistoryWorkoutExercise;
  index: number;
  count: number;
  draft: Draft;
  disabled: boolean;
  onNote: (note: string) => void;
  onSet: (setId: string, value: SetDraft) => void;
  onStructural: (correction: HistoryCorrection) => void;
  onMove: (direction: number) => void;
}) {
  const populated = exercise.sets.some(
    (set) =>
      set.loadKg !== null || set.bandStrength !== null || set.reps !== null,
  );

  return (
    <section
      aria-label={exercise.exerciseName}
      className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4"
    >
      <div className="flex items-start gap-2">
        <Icon
          name="grip-vertical"
          size={18}
          className="mt-1 shrink-0 text-[var(--pf-text-3-deep)]"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
            {exercise.exerciseName}
          </h3>
          {exercise.stillInLibrary ? null : (
            <span className="mt-1 inline-block">
              <Badge>No longer in the library</Badge>
            </span>
          )}
        </div>
      </div>

      <ol className="mt-3 flex flex-col gap-3">
        {exercise.sets.map((set) => {
          const entry = draft.sets[set.id] ?? {
            loadKg: "",
            bandStrength: "",
            reps: "",
          };
          const fields =
            set.loadMode === null ? null : setModeFields[set.loadMode];
          const setPopulated =
            set.loadKg !== null ||
            set.bandStrength !== null ||
            set.reps !== null;

          return (
            <li key={set.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
                  Set {set.position}
                </span>
                <RemoveSetButton
                  set={set.id}
                  label={`Remove set ${set.position} of ${exercise.exerciseName}`}
                  populated={setPopulated}
                  disabled={disabled}
                  onStructural={onStructural}
                />
              </div>
              {fields?.load ? (
                <NumericField
                  id={`set-${set.id}-load`}
                  label={
                    fields.load === "kg"
                      ? "Kilograms"
                      : fields.load === "added_kg"
                        ? "Added kilograms"
                        : "Assistance kilograms"
                  }
                  value={entry.loadKg}
                  onChange={(event) =>
                    onSet(set.id, { ...entry, loadKg: event.target.value })
                  }
                />
              ) : null}
              {fields?.band ? (
                <div className="flex flex-col gap-1.5">
                  <span
                    id={`set-${set.id}-band-label`}
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase"
                  >
                    {fields.band === "resistance"
                      ? "Resistance band"
                      : "Assistance band"}
                  </span>
                  <div
                    role="group"
                    aria-labelledby={`set-${set.id}-band-label`}
                    className="flex gap-2"
                  >
                    {(["light", "medium", "strong"] as const).map(
                      (strength) => (
                        <Chip
                          key={strength}
                          selected={entry.bandStrength === strength}
                          onClick={() =>
                            onSet(set.id, {
                              ...entry,
                              bandStrength:
                                entry.bandStrength === strength ? "" : strength,
                            })
                          }
                        >
                          {strength === "light"
                            ? "Light"
                            : strength === "medium"
                              ? "Medium"
                              : "Strong"}
                        </Chip>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
              <NumericField
                id={`set-${set.id}-reps`}
                label="Reps"
                inputMode="numeric"
                value={entry.reps}
                onChange={(event) =>
                  onSet(set.id, { ...entry, reps: event.target.value })
                }
              />
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Action
          variant="tertiary"
          disabled={disabled}
          onClick={() =>
            onStructural({ kind: "add_set", workoutExerciseId: exercise.id })
          }
        >
          Add set
        </Action>
        <button
          type="button"
          aria-label={`Move ${exercise.exerciseName} up`}
          disabled={disabled || index === 0}
          onClick={() => onMove(-1)}
          className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] disabled:opacity-[var(--pf-opacity-disabled)]"
        >
          <Icon name="arrow-up" size={18} />
        </button>
        <button
          type="button"
          aria-label={`Move ${exercise.exerciseName} down`}
          disabled={disabled || index === count - 1}
          onClick={() => onMove(1)}
          className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] disabled:opacity-[var(--pf-opacity-disabled)]"
        >
          <Icon name="arrow-down" size={18} />
        </button>
        <RemoveExerciseButton
          exercise={exercise}
          populated={populated || exercise.workoutNote.trim() !== ""}
          disabled={disabled}
          onStructural={onStructural}
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          id={`note-${exercise.id}`}
          label="Workout note"
          value={draft.notes[exercise.id] ?? ""}
          onChange={(event) => onNote(event.target.value)}
        />
      </div>
    </section>
  );
}

function RemoveSetButton({
  set,
  label,
  populated,
  disabled,
  onStructural,
}: {
  set: string;
  label: string;
  populated: boolean;
  disabled: boolean;
  onStructural: (correction: HistoryCorrection) => void;
}) {
  const remove = (confirmed: boolean) =>
    onStructural({
      kind: "remove_set",
      workoutSetId: set,
      confirmedPopulatedRemoval: confirmed,
    });

  if (!populated)
    return (
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={() => remove(false)}
        className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] text-[var(--pf-text-2)] disabled:opacity-[var(--pf-opacity-disabled)]"
      >
        <Icon name="x" size={16} />
      </button>
    );

  return (
    <DestructiveDialog
      trigger={
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] text-[var(--pf-text-2)] disabled:opacity-[var(--pf-opacity-disabled)]"
        >
          <Icon name="x" size={16} />
        </button>
      }
      title="Remove this set?"
      description="It holds recorded values. Removing it recalculates every statistic that used them."
      confirmLabel="Remove set"
      onConfirm={() => remove(true)}
    />
  );
}

function RemoveExerciseButton({
  exercise,
  populated,
  disabled,
  onStructural,
}: {
  exercise: HistoryWorkoutExercise;
  populated: boolean;
  disabled: boolean;
  onStructural: (correction: HistoryCorrection) => void;
}) {
  const remove = (confirmed: boolean) =>
    onStructural({
      kind: "remove_exercise",
      workoutExerciseId: exercise.id,
      confirmedPopulatedRemoval: confirmed,
    });
  const label = `Remove ${exercise.exerciseName}`;

  if (!populated)
    return (
      <Action
        variant="danger"
        disabled={disabled}
        onClick={() => remove(false)}
      >
        Remove
      </Action>
    );

  return (
    <DestructiveDialog
      trigger={
        <Action variant="danger" disabled={disabled} aria-label={label}>
          Remove
        </Action>
      }
      title={`Remove ${exercise.exerciseName}?`}
      description="It holds recorded data. Removing it recalculates every statistic that used it."
      confirmLabel="Remove exercise"
      onConfirm={() => remove(true)}
    />
  );
}
