"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { correctHistoryWorkoutAction } from "@/app/actions/workout-history";
import { setModeFields } from "@/features/active-workout/domain/set-entry";
import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import {
  baseLoadModeByBaseType,
  type Exercise,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import type {
  HistoryCorrection,
  HistoryWorkout,
  HistoryWorkoutExercise,
} from "@/features/history/domain/workout-history";
import {
  Action,
  ActionOverlay,
  Badge,
  DestructiveDialog,
  Icon,
  Kicker,
  normalizeDecimalInput,
  Overlay,
  SaveStatus,
  ScreenBody,
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

import { SetCorrectionOverlay, type SetDraft } from "./set-correction-overlay";

function baseModeOf(exercise: HistoryWorkoutExercise): ExerciseLoadMode {
  const implied = baseLoadModeByBaseType[exercise.exerciseBaseType];
  return implied ?? exercise.allowedLoadModes[0] ?? "weight";
}

function optionalModeOf(
  exercise: HistoryWorkoutExercise,
): ExerciseLoadMode | null {
  const base = baseModeOf(exercise);
  return exercise.allowedLoadModes.find((allowed) => allowed !== base) ?? null;
}

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
            loadMode: set.loadMode ?? baseModeOf(exercise),
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
  // One dialog serves every populated removal on the screen.
  const [removal, setRemoval] = useState<{
    kind: "exercise" | "set";
    id: string;
    name: string;
  }>();
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
        const fields = setModeFields[entry.loadMode];
        // Values the chosen mode cannot hold are cleared, because the stored
        // shape rejects them.
        const loadKg =
          fields.load === null || entry.loadKg === ""
            ? null
            : Number(normalizeDecimalInput(entry.loadKg));
        const bandStrength =
          fields.band === null || entry.bandStrength === ""
            ? null
            : (entry.bandStrength as "light" | "medium" | "strong");
        const reps = entry.reps === "" ? null : Number(entry.reps);
        const empty = loadKg === null && bandStrength === null && reps === null;
        // An untouched empty set keeps no mode of its own.
        const loadMode = empty && set.loadMode === null ? null : entry.loadMode;
        if (
          loadMode === set.loadMode &&
          loadKg === set.loadKg &&
          reps === set.reps &&
          bandStrength === set.bandStrength
        )
          continue;
        corrections.push({
          kind: "update_set",
          workoutSetId: set.id,
          loadMode,
          loadKg,
          bandDirection: loadMode === null ? null : fields.band,
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

  const move = (index: number, direction: number) => {
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
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title="Correct workout"
        backHref={detailHref}
        backLabel="Workout"
        trailing={dirty ? <Badge tone="accent">Unsaved</Badge> : undefined}
      />
      <ScreenBody className="gap-3">
        <p className="text-[13.5px] leading-[1.5] text-[var(--pf-text-3)]">
          {workout.name} · corrections recalculate every statistic this workout
          feeds.
        </p>

        <section className="flex flex-col gap-3.5 rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] px-[18px] py-4">
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

        <Kicker className="mt-1.5">Recorded sets</Kicker>
        {dirty ? (
          <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
            Save your changes before adding, removing, or reordering.
          </p>
        ) : null}

        {workout.exercises.map((exercise, index) => {
          const baseMode = baseModeOf(exercise);
          const optionalMode = optionalModeOf(exercise);
          const populated =
            exercise.sets.some(
              (set) =>
                set.loadKg !== null ||
                set.bandStrength !== null ||
                set.reps !== null,
            ) || exercise.workoutNote.trim() !== "";

          return (
            <section
              key={exercise.id}
              aria-label={exercise.exerciseName}
              className="rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] px-[18px] py-4"
            >
              <div className="flex items-start gap-2">
                <h3 className="min-w-0 flex-1 text-[16px] leading-[1.25] font-semibold [text-wrap:pretty]">
                  {exercise.exerciseName}
                </h3>
                <ActionOverlay
                  trigger={
                    <button
                      type="button"
                      aria-label={`${exercise.exerciseName} actions`}
                      disabled={pending || dirty}
                      className="-mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-3)] disabled:opacity-[var(--pf-opacity-disabled)]"
                    >
                      <Icon name="ellipsis-vertical" size={16} />
                    </button>
                  }
                  title={exercise.exerciseName}
                  meta={`${exercise.sets.length} recorded ${exercise.sets.length === 1 ? "set" : "sets"}`}
                  actions={[
                    {
                      key: "add-set",
                      label: "Add a set to this exercise",
                      icon: "plus",
                      onRun: () =>
                        structural({
                          kind: "add_set",
                          workoutExerciseId: exercise.id,
                        }),
                    },
                    {
                      key: "up",
                      label: "Move this exercise up",
                      icon: "arrow-up",
                      disabled: index === 0,
                      onRun: () => move(index, -1),
                    },
                    {
                      key: "down",
                      label: "Move this exercise down",
                      icon: "arrow-down",
                      disabled: index === workout.exercises.length - 1,
                      onRun: () => move(index, 1),
                    },
                    {
                      key: "remove",
                      label: "Remove this exercise",
                      icon: "trash-2",
                      onRun: () => {
                        if (!populated) {
                          structural({
                            kind: "remove_exercise",
                            workoutExerciseId: exercise.id,
                            confirmedPopulatedRemoval: false,
                          });
                          return;
                        }
                        setRemoval({
                          kind: "exercise",
                          id: exercise.id,
                          name: exercise.exerciseName,
                        });
                      },
                    },
                  ]}
                />
              </div>
              {exercise.stillInLibrary ? null : (
                <p className="mt-2">
                  <Badge>No longer in the library</Badge>
                </p>
              )}

              <div className="mt-3 flex flex-col gap-2">
                {exercise.sets.map((set, setIndex) => {
                  const entry = draft.sets[set.id] ?? {
                    loadMode: baseMode,
                    loadKg: "",
                    bandStrength: "",
                    reps: "",
                  };
                  const summary = describeDraft(
                    entry,
                    exercise.measurementType,
                  );
                  const setPopulated =
                    set.loadKg !== null ||
                    set.bandStrength !== null ||
                    set.reps !== null;
                  // An untouched set starts its wheels where the set before it
                  // sits, falling back to the lowest planned repetition count.
                  const previous =
                    setIndex === 0
                      ? undefined
                      : draft.sets[exercise.sets[setIndex - 1]?.id ?? ""];

                  return (
                    <SetCorrectionOverlay
                      key={set.id}
                      trigger={
                        <button
                          type="button"
                          aria-label={`Correct set ${set.position} of ${exercise.exerciseName}`}
                          className="flex min-h-[52px] items-center gap-3 rounded-[var(--pf-r2)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface-2)] px-3.5 text-left transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] active:scale-[0.985]"
                        >
                          <span className="shrink-0 text-[12.5px] text-[var(--pf-text-4)]">
                            Set {set.position}
                          </span>
                          <span className="pf-numeric flex-1 text-right text-[18px] font-semibold">
                            {summary}
                          </span>
                          <Icon
                            name="pencil"
                            size={14}
                            className="shrink-0 text-[var(--pf-glyph-dim)]"
                          />
                        </button>
                      }
                      exerciseName={exercise.exerciseName}
                      measurementType={exercise.measurementType}
                      position={set.position}
                      setCount={exercise.sets.length}
                      entry={entry}
                      baseMode={baseMode}
                      optionalMode={optionalMode}
                      recordedSummary={formatSetSummary(
                        set,
                        exercise.measurementType,
                      )}
                      canRemove={!pending && !dirty}
                      loadFallback={
                        previous?.loadKg ? Number(previous.loadKg) : null
                      }
                      countFallback={
                        previous?.reps
                          ? Number(previous.reps)
                          : (exercise.minReps ?? null)
                      }
                      onApply={(next) =>
                        setDraft((current) => ({
                          ...current,
                          sets: { ...current.sets, [set.id]: next },
                        }))
                      }
                      onRemove={() => {
                        if (!setPopulated) {
                          structural({
                            kind: "remove_set",
                            workoutSetId: set.id,
                            confirmedPopulatedRemoval: false,
                          });
                          return;
                        }
                        setRemoval({
                          kind: "set",
                          id: set.id,
                          name: `set ${set.position} of ${exercise.exerciseName}`,
                        });
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-3.5">
                <TextAreaField
                  id={`note-${exercise.id}`}
                  label="Workout note"
                  value={draft.notes[exercise.id] ?? ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      notes: {
                        ...draft.notes,
                        [exercise.id]: event.target.value,
                      },
                    })
                  }
                />
              </div>
            </section>
          );
        })}

        <Overlay
          title="Add exercise"
          description="It joins this workout only, with the definition as it stands now."
          trigger={
            <Action variant="accent" disabled={pending || dirty}>
              <Icon name="plus" size={17} />
              Add exercise
            </Action>
          }
        >
          {(close) => (
            <div className="flex flex-col gap-2">
              {library.length === 0 ? (
                <p className="text-[14px] text-[var(--pf-text-3)]">
                  Your library has no exercises.
                </p>
              ) : (
                library.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      close();
                      structural({
                        kind: "add_exercise",
                        workoutId: workout.id,
                        exerciseId: item.id,
                      });
                    }}
                    className="flex min-h-[68px] items-center gap-3.5 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[18px] py-3.5 text-left text-[15.5px] font-semibold transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-border-strong)]"
                  >
                    <span className="min-w-0 flex-1 [text-wrap:pretty]">
                      {item.name}
                    </span>
                    <Icon
                      name="plus"
                      size={16}
                      className="shrink-0 text-[var(--pf-accent)]"
                    />
                  </button>
                ))
              )}
            </div>
          )}
        </Overlay>
      </ScreenBody>

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
          <Icon name="check" size={18} />
          Save corrections
        </Action>
        <Action
          variant="secondary"
          disabled={pending}
          onClick={() => router.push(detailHref)}
        >
          Discard changes
        </Action>
      </StickyActionBar>

      <DestructiveDialog
        open={removal !== undefined}
        onOpenChange={(open) => {
          if (!open) setRemoval(undefined);
        }}
        title={
          removal?.kind === "exercise"
            ? `Remove ${removal.name}?`
            : "Remove this set?"
        }
        description={
          removal?.kind === "exercise"
            ? "It holds recorded data. Removing it recalculates every statistic that used it."
            : "It holds recorded values. Removing it recalculates every statistic that used them."
        }
        confirmLabel={
          removal?.kind === "exercise" ? "Remove exercise" : "Remove set"
        }
        onConfirm={() => {
          if (!removal) return;
          const target = removal;
          setRemoval(undefined);
          structural(
            target.kind === "exercise"
              ? {
                  kind: "remove_exercise",
                  workoutExerciseId: target.id,
                  confirmedPopulatedRemoval: true,
                }
              : {
                  kind: "remove_set",
                  workoutSetId: target.id,
                  confirmedPopulatedRemoval: true,
                },
          );
        }}
      />
    </div>
  );
}

/** What a set button shows: the draft's own values, not the saved snapshot. */
function describeDraft(
  entry: SetDraft,
  measurementType: "reps" | "seconds" = "reps",
): string {
  const fields = setModeFields[entry.loadMode];
  const parts: string[] = [];
  if (fields.load && entry.loadKg !== "") {
    const prefix =
      fields.load === "added_kg"
        ? "+"
        : fields.load === "assistance_kg"
          ? "−"
          : "";
    parts.push(`${prefix}${entry.loadKg} kg`);
  } else if (fields.load === null && fields.band === null) {
    parts.push("BW");
  }
  if (fields.band && entry.bandStrength !== "") {
    parts.push(
      entry.bandStrength.charAt(0).toUpperCase() + entry.bandStrength.slice(1),
    );
  }
  if (entry.reps !== "") {
    parts.push(
      measurementType === "seconds" ? `${entry.reps} sec` : `${entry.reps}`,
    );
  }
  return parts.length === 0 ? "No values" : parts.join(" × ");
}
