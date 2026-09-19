"use client";

import { useEffect, useRef, useState } from "react";

import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import {
  isSetRecorded,
  missingSetValues,
  setModeFields,
} from "@/features/active-workout/domain/set-entry";
import type {
  CurrentWorkout,
  WorkoutExercise,
  WorkoutSet,
} from "@/features/active-workout/domain/workout";
import { formatWorkoutClock } from "@/features/active-workout/ui/workout-presentation";
import {
  baseLoadModeByBaseType,
  type Exercise,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import { exerciseOptionalModeLabels } from "@/features/exercises/ui/exercise-presentation";
import {
  ActionOverlay,
  BlockingProgress,
  countOptions,
  DestructiveDialog,
  formatWheelNumber,
  Icon,
  loadOptions,
  optionIndex,
  useTransientOverlay,
  ValueWheel,
  WheelSeparator,
  type OverlayAction,
} from "@/shared/ui";

import {
  AddExerciseOverlay,
  LastTimeOverlay,
  NoteOverlay,
  ReviewFinishOverlay,
  type FinishOutcome,
} from "./workout-overlays";
import { WorkoutOverview } from "./workout-overview";
import {
  ExerciseHandoff,
  SetLoggedFlash,
  WorkoutComplete,
} from "./workout-interstitials";

/** How long the banked-set celebration holds before the next set arrives. */
const flashMs = 2300;

const bandStrengths = ["light", "medium", "strong"] as const;
type BandStrength = (typeof bandStrengths)[number];

type Draft = Readonly<{
  loadKg: number | null;
  reps: number | null;
  bandStrength: BandStrength | null;
}>;

type Cursor = Readonly<{ exerciseId: string; setId: string }>;

type Handoff = Readonly<{
  doneName: string;
  doneMeta: string;
  chips: readonly string[];
  nextName: string;
  nextSet: string;
  nextMeta: string;
  cursor: Cursor;
}>;

type Confirmation =
  | Readonly<{ kind: "set"; setId: string; label: string }>
  | Readonly<{ kind: "exercise"; exerciseId: string; name: string }>
  | Readonly<{ kind: "discard" }>;

function baseModeOf(exercise: WorkoutExercise): ExerciseLoadMode {
  return (
    baseLoadModeByBaseType[exercise.exerciseBaseType] ??
    exercise.allowedLoadModes[0]!
  );
}

function modeOf(exercise: WorkoutExercise, set: WorkoutSet): ExerciseLoadMode {
  return set.loadMode ?? baseModeOf(exercise);
}

function countUnit(exercise: WorkoutExercise): string {
  return exercise.measurementType === "seconds" ? "sec" : "reps";
}

function loadUnit(mode: ExerciseLoadMode): string {
  const field = setModeFields[mode].load;
  return field === "added_kg"
    ? "+kg"
    : field === "assistance_kg"
      ? "−kg"
      : "kg";
}

/** Every set of the workout, in the order they are worked through. */
function flatten(
  workout: CurrentWorkout,
): { exercise: WorkoutExercise; set: WorkoutSet }[] {
  return workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({ exercise, set })),
  );
}

function isRecorded(exercise: WorkoutExercise, set: WorkoutSet): boolean {
  return isSetRecorded(modeOf(exercise, set), set);
}

export function ActiveWorkoutQueue({
  workout,
  paused,
  displaySeconds,
  cue,
  discardedChange,
  finishing,
  feedback,
  onDismissDiscarded,
  onRetry,
  onRefresh,
  onTogglePause,
  onUpdateSet,
  onChangeMode,
  onReorder,
  onSetFeedback,
  onSend,
  onFinish,
  placeholderNames,
  onNamePlaceholder,
  eagerExercises,
}: {
  workout: CurrentWorkout;
  paused: boolean;
  displaySeconds: number;
  cue:
    | Readonly<{ kind: "validation" | "saving" | "saved"; message: string }>
    | Readonly<{ kind: "failure"; message: string; recovery: string }>;
  discardedChange: string | null;
  finishing: boolean;
  feedback: Readonly<Record<string, { kind: string; message: string }>>;
  onDismissDiscarded: () => void;
  onRetry: () => void;
  onRefresh: () => void;
  onTogglePause: () => void;
  onUpdateSet: (
    set: WorkoutSet,
    mode: ExerciseLoadMode,
    changes: Partial<Pick<WorkoutSet, "loadKg" | "bandStrength" | "reps">>,
  ) => void;
  onChangeMode: (set: WorkoutSet, mode: ExerciseLoadMode) => void;
  onReorder: (ids: readonly string[]) => void;
  onSetFeedback: (
    setId: string,
    entry: { kind: "error" | "notice"; message: string } | undefined,
  ) => void;
  onSend: (
    operation: ActiveWorkoutCommand["operation"],
    payload: ActiveWorkoutCommand["payload"],
  ) => string;
  onFinish: (outcome: FinishOutcome) => void;
  placeholderNames: Readonly<Record<string, string>>;
  onNamePlaceholder: (commandId: string, name: string) => void;
  eagerExercises?: readonly Exercise[];
}) {
  const [screen, setScreen] = useState<"queue" | "overview">("queue");
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [flash, setFlash] = useState(false);
  const [press, setPress] = useState(0);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [complete, setComplete] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const confirmOverlay = useTransientOverlay();
  const finishOverlay = useTransientOverlay();
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((id) => window.clearTimeout(id)),
    [],
  );

  const sets = flatten(workout);
  const firstOutstanding = sets.find(
    (entry) => !isRecorded(entry.exercise, entry.set),
  );
  const resolved =
    sets.find(
      (entry) =>
        entry.exercise.id === cursor?.exerciseId &&
        entry.set.id === cursor.setId,
    ) ??
    firstOutstanding ??
    sets[0];
  const exercise = resolved?.exercise;
  const set = resolved?.set;
  const mode = exercise && set ? modeOf(exercise, set) : "weight";
  const fields = setModeFields[mode];
  const allRecorded =
    sets.length > 0 &&
    sets.every((entry) => isRecorded(entry.exercise, entry.set));

  // The wheels hold a draft until the set is logged, so turning one costs no
  // command. It reseeds whenever the set, or what the set holds, changes.
  const committedKey = `${set?.id ?? ""}|${set?.loadMode ?? ""}|${set?.loadKg ?? ""}|${set?.reps ?? ""}|${set?.bandStrength ?? ""}`;
  const [draftState, setDraftState] = useState(() => ({
    key: committedKey,
    draft: seedDraft(workout, exercise, set),
  }));
  if (draftState.key !== committedKey) {
    setDraftState({
      key: committedKey,
      draft: seedDraft(workout, exercise, set),
    });
  }
  const draft = draftState.draft;
  const setDraft = (next: Draft) =>
    setDraftState({ key: committedKey, draft: next });

  const loadColumn = loadOptions(draft.loadKg);
  const countColumn = countOptions(
    draft.reps,
    exercise?.measurementType === "seconds" ? "seconds" : "reps",
  );

  function jumpTo(exerciseId: string, setId: string) {
    setCursor({ exerciseId, setId });
    setScreen("queue");
  }

  function advanceFrom(current: Cursor) {
    const after = flatten(workout);
    const index = after.findIndex(
      (entry) =>
        entry.exercise.id === current.exerciseId &&
        entry.set.id === current.setId,
    );
    const next =
      after
        .slice(index + 1)
        .find((entry) => !isRecorded(entry.exercise, entry.set)) ??
      after.find((entry) => !isRecorded(entry.exercise, entry.set));

    if (!next) {
      setComplete(true);
      return;
    }
    if (next.exercise.id !== current.exerciseId) {
      const done = after.find(
        (entry) => entry.exercise.id === current.exerciseId,
      )?.exercise;
      setHandoff({
        doneName: done?.exerciseName ?? "",
        doneMeta: `Next up in ${workout.name}`,
        chips: (done?.sets ?? [])
          .filter((item) => isRecorded(done!, item))
          .map((item) => describeSet(done!, item)),
        nextName: next.exercise.exerciseName,
        nextSet: `Set ${next.set.position} of ${next.exercise.sets.length}`,
        nextMeta:
          next.exercise.plannedSets === null
            ? "Workout-local"
            : `${next.exercise.plannedSets} × ${next.exercise.minReps ?? "?"}–${next.exercise.maxReps ?? "?"}`,
        cursor: { exerciseId: next.exercise.id, setId: next.set.id },
      });
      return;
    }
    setCursor({ exerciseId: next.exercise.id, setId: next.set.id });
  }

  function logSet() {
    if (!exercise || !set) return;
    const missing = missingSetValues(mode, {
      loadKg: draft.loadKg,
      bandStrength: draft.bandStrength,
      reps: draft.reps,
    });
    if (missing.length > 0) {
      onSetFeedback(set.id, {
        kind: "error",
        message: `Enter ${missing.join(" and ")} before logging this set.`,
      });
      return;
    }

    const here: Cursor = { exerciseId: exercise.id, setId: set.id };
    onUpdateSet(set, mode, {
      loadKg: draft.loadKg,
      bandStrength: draft.bandStrength,
      reps: draft.reps,
    });
    setFlash(true);
    timers.current.push(
      window.setTimeout(() => {
        setFlash(false);
        advanceFrom(here);
      }, flashMs),
    );
  }

  function primaryAction() {
    if (!exercise || !set) return;
    if (allRecorded) {
      setPress((tick) => tick + 1);
      timers.current.push(
        window.setTimeout(() => finishOverlay.requestOpenChange(true), 160),
      );
      return;
    }
    logSet();
  }

  // What waits after the set on screen, which is not the same as the first
  // outstanding set: standing on that set, the next one is the one after it.
  const here = sets.findIndex(
    (entry) => entry.exercise.id === exercise?.id && entry.set.id === set?.id,
  );
  const upNext =
    here === -1
      ? firstOutstanding
      : sets
          .slice(here + 1)
          .find((entry) => !isRecorded(entry.exercise, entry.set));

  const clock = formatWorkoutClock(displaySeconds);
  const optionalMode =
    exercise?.allowedLoadModes.find(
      (allowed) => allowed !== baseModeOf(exercise),
    ) ?? null;
  const rowError = set ? feedback[set.id] : undefined;

  const addExerciseOverlay = (
    <AddExerciseOverlay
      initialExercises={eagerExercises}
      trigger={
        <button
          type="button"
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--pf-accent-dim)] text-[15px] font-semibold text-[var(--pf-accent)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:bg-[var(--pf-accent-dim-hover)]"
        >
          <Icon name="plus" size={17} />
          Add exercise
        </button>
      }
      onAdd={(chosen) => {
        for (const item of chosen) {
          const commandId = onSend("add_exercise", { exerciseId: item.id });
          onNamePlaceholder(commandId, item.name);
        }
      }}
    />
  );

  if (screen === "overview") {
    return (
      <>
        <WorkoutOverview
          workout={workout}
          clock={clock}
          paused={paused}
          currentExerciseId={exercise?.id ?? null}
          resumeLabel={
            resolved
              ? `Resume · set ${resolved.set.position} of ${resolved.exercise.sets.length}`
              : "Review & finish"
          }
          placeholderNames={placeholderNames}
          addExercise={addExerciseOverlay}
          onBack={() => setScreen("queue")}
          onResume={() => {
            if (resolved) {
              jumpTo(resolved.exercise.id, resolved.set.id);
              return;
            }
            setScreen("queue");
            finishOverlay.requestOpenChange(true);
          }}
          onOpenExercise={(exerciseId) => {
            const target = workout.exercises.find(
              (item) => item.id === exerciseId,
            );
            const first =
              target?.sets.find((item) => !isRecorded(target, item)) ??
              target?.sets[0];
            if (target && first) jumpTo(target.id, first.id);
          }}
          onRemoveExercise={(target) => {
            if (target.sets.some((item) => isRecorded(target, item))) {
              setConfirmation({
                kind: "exercise",
                exerciseId: target.id,
                name: target.exerciseName,
              });
              confirmOverlay.requestOpenChange(true);
              return;
            }
            onSend("remove_exercise", {
              workoutExerciseId: target.id,
              confirmedPopulatedRemoval: false,
            });
          }}
          onReorder={onReorder}
        />
        {confirmationDialog()}
      </>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-[58px] shrink-0 items-center gap-2.5 px-3.5 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={paused ? "Resume timer" : "Pause — continue later"}
          className={
            paused
              ? "flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-bg-surface)] text-[var(--pf-accent)]"
              : "flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-bg-surface)] text-[var(--pf-text-2)]"
          }
        >
          <Icon name={paused ? "play" : "pause"} size={17} />
        </button>
        <span
          aria-label="Active duration"
          className={
            paused
              ? "pf-numeric flex-1 text-center text-[21px] font-semibold text-[var(--pf-text-3)]"
              : "pf-numeric flex-1 text-center text-[21px] font-semibold"
          }
        >
          {clock}
        </span>
        <button
          type="button"
          onClick={() => setScreen("overview")}
          aria-label="Workout overview"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-bg-surface)] text-[var(--pf-text-2)]"
        >
          <Icon name="layout-grid" size={18} />
        </button>
      </div>

      <div className="flex shrink-0 gap-1 px-[var(--pf-gutter)]">
        {sets.map((entry) => {
          const here =
            entry.exercise.id === exercise?.id && entry.set.id === set?.id;
          const done = isRecorded(entry.exercise, entry.set);
          return (
            <button
              key={`${entry.exercise.id}-${entry.set.id}`}
              type="button"
              onClick={() => jumpTo(entry.exercise.id, entry.set.id)}
              aria-label={`${entry.exercise.exerciseName} set ${entry.set.position}`}
              aria-current={here ? "step" : undefined}
              className="flex h-3.5 flex-1 items-center"
            >
              <span
                className="h-[5px] w-full rounded-full transition-colors duration-200 ease-linear"
                style={{
                  backgroundColor: done
                    ? "var(--pf-accent)"
                    : here
                      ? "var(--pf-text)"
                      : "var(--pf-bg-surface-3)",
                }}
              />
            </button>
          );
        })}
      </div>

      {paused ? (
        <p
          role="status"
          className="mx-[var(--pf-gutter)] mt-1 flex min-h-8 shrink-0 items-center gap-2 text-[13px] font-medium text-[var(--pf-text-3)]"
        >
          <Icon name="pause" size={14} />
          Paused — active duration is not counting.
        </p>
      ) : null}

      <StatusCue
        cue={cue}
        rowError={rowError}
        discardedChange={discardedChange}
        onDismissDiscarded={onDismissDiscarded}
        onRetry={onRetry}
        onRefresh={onRefresh}
      />

      <div className="pf-scroll flex min-h-0 flex-1 flex-col items-center px-[var(--pf-gutter)] pt-3.5">
        {!exercise || !set ? (
          <div className="mt-16 flex flex-col items-center gap-4">
            <Icon
              name="dumbbell"
              size={40}
              className="text-[var(--pf-border-strong)]"
            />
            <p className="text-center text-[14px] text-[var(--pf-text-3)]">
              This workout has no exercises yet.
            </p>
            <div className="mt-1.5 flex w-full flex-col">
              {addExerciseOverlay}
            </div>
          </div>
        ) : (
          <>
            <span className="shrink-0 rounded-full bg-[var(--pf-accent-dim)] px-3.5 py-1.5 text-center text-[12px] font-semibold tracking-[0.04em] text-[var(--pf-accent)]">
              Set {set.position} of {exercise.sets.length}
              {exercise.plannedSets === null
                ? ""
                : ` · ${exercise.plannedSets} × ${exercise.minReps ?? "?"}–${exercise.maxReps ?? "?"} planned`}
            </span>
            <h1 className="mt-3 shrink-0 text-center text-[length:var(--pf-type-stage-size)] leading-[1.14] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
              {exercise.exerciseName ||
                (placeholderNames[exercise.id] ?? "New exercise")}
            </h1>

            <div
              key={`${exercise.id}-${set.id}`}
              className={
                flash
                  ? "flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-5 motion-safe:animate-[pf-picker-fade_3000ms_ease_both]"
                  : "flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-5 motion-safe:animate-[pf-stage-in-a_300ms_var(--pf-ease)]"
              }
            >
              {fields.band ? (
                <div className="flex w-full shrink-0 flex-col gap-2">
                  <span className="text-[11.5px] font-semibold tracking-[0.08em] text-[var(--pf-text-4)] uppercase">
                    {fields.band === "resistance"
                      ? "Resistance band"
                      : "Assistance band"}
                  </span>
                  <div className="flex gap-2">
                    {bandStrengths.map((strength) => {
                      const on = draft.bandStrength === strength;
                      return (
                        <button
                          key={strength}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setDraft({ ...draft, bandStrength: strength })
                          }
                          className={
                            on
                              ? "h-[54px] flex-1 rounded-full border border-[var(--pf-accent)] bg-[var(--pf-accent)] text-[15px] font-semibold text-[var(--pf-on-accent)]"
                              : "h-[54px] flex-1 rounded-full border border-[var(--pf-border)] text-[15px] font-semibold text-[var(--pf-text-2)]"
                          }
                        >
                          {strength.charAt(0).toUpperCase() + strength.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

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
                      index={optionIndex(loadColumn, draft.loadKg)}
                      onIndexChange={(next) =>
                        setDraft({ ...draft, loadKg: loadColumn[next] ?? 0 })
                      }
                      unit={loadUnit(mode)}
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
                  label={
                    exercise.measurementType === "seconds" ? "Seconds" : "Reps"
                  }
                  options={countColumn}
                  index={optionIndex(countColumn, draft.reps)}
                  onIndexChange={(next) =>
                    setDraft({ ...draft, reps: countColumn[next] ?? 0 })
                  }
                  unit={countUnit(exercise)}
                />
              </div>

              <button
                type="button"
                disabled={flash || finishing}
                onClick={primaryAction}
                aria-label={
                  allRecorded ? "Review and finish workout" : "Log this set"
                }
                style={
                  press === 0
                    ? undefined
                    : {
                        animation: `pf-press-${press % 2 ? "a" : "b"} 300ms var(--pf-ease-pop)`,
                      }
                }
                className={
                  allRecorded
                    ? "flex h-[var(--pf-size-hero-action)] w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent)] text-[18px] font-semibold text-[var(--pf-on-accent)]"
                    : "flex h-[var(--pf-size-hero-action)] w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent-dim)] text-[18px] font-semibold text-[var(--pf-accent)]"
                }
              >
                <Icon name={allRecorded ? "check-check" : "check"} size={22} />
                {allRecorded ? "Review & finish" : "Log set"}
              </button>
            </div>

            <div className="flex w-full shrink-0 gap-2 pt-1.5">
              <LastTimeOverlay
                exercise={exercise}
                currentSetPosition={set.position}
                trigger={
                  <button
                    type="button"
                    className={
                      exercise.lastPerformance
                        ? "flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--pf-bg-surface)] text-[13.5px] font-semibold text-[var(--pf-text-2)]"
                        : "flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--pf-bg-surface)] text-[13.5px] font-semibold text-[var(--pf-text-4)]"
                    }
                  >
                    <Icon name="history" size={16} />
                    Last
                  </button>
                }
              />
              <NoteOverlay
                exercise={exercise}
                onSave={(note) =>
                  onSend("set_workout_exercise_note", {
                    workoutExerciseId: exercise.id,
                    note,
                  })
                }
                trigger={
                  <button
                    type="button"
                    className={
                      exercise.persistentNote || exercise.workoutNote
                        ? "flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--pf-bg-surface)] text-[13.5px] font-semibold text-[var(--pf-accent)]"
                        : "flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--pf-bg-surface)] text-[13.5px] font-semibold text-[var(--pf-text-4)]"
                    }
                  >
                    <Icon name="info" size={16} />
                    Note
                  </button>
                }
              />
              <ActionOverlay
                trigger={
                  <button
                    type="button"
                    aria-label="More actions"
                    className="flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--pf-bg-surface)] text-[13.5px] font-semibold text-[var(--pf-text-2)]"
                  >
                    <Icon name="ellipsis-vertical" size={16} />
                    More
                  </button>
                }
                title={exercise.exerciseName}
                meta={`Set ${set.position} of ${exercise.sets.length}`}
                actions={moreActions(
                  exercise,
                  set,
                  mode,
                  optionalMode,
                  onChangeMode,
                  onSend,
                  setConfirmation,
                  confirmOverlay.requestOpenChange,
                  () => finishOverlay.requestOpenChange(true),
                )}
              />
              <button
                type="button"
                onClick={() => finishOverlay.requestOpenChange(true)}
                aria-label="Review and finish workout"
                className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[var(--pf-accent)] text-[var(--pf-on-accent)]"
              >
                <Icon name="check-check" size={17} />
              </button>
            </div>

            <div className="flex h-[46px] w-full shrink-0 items-center gap-2.5">
              <span className="shrink-0 text-[11.5px] font-semibold tracking-[0.06em] text-[var(--pf-text-4)]">
                {upNext ? "Up next" : "Nothing left"}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--pf-text-2)]">
                {upNext
                  ? `${upNext.exercise.exerciseName} · set ${upNext.set.position} of ${upNext.exercise.sets.length}`
                  : "Review and finish"}
              </span>
            </div>
          </>
        )}
      </div>

      {flash ? <SetLoggedFlash /> : null}

      {handoff ? (
        <ExerciseHandoff
          doneName={handoff.doneName}
          doneMeta={handoff.doneMeta}
          chips={handoff.chips}
          nextName={handoff.nextName}
          nextSet={handoff.nextSet}
          nextMeta={handoff.nextMeta}
          onContinue={() => {
            setCursor(handoff.cursor);
            setHandoff(null);
          }}
        />
      ) : null}

      {complete ? (
        <WorkoutComplete
          workoutName={workout.name}
          chips={[
            clock,
            `${workout.exercises.length} ${workout.exercises.length === 1 ? "exercise" : "exercises"}`,
            `${sets.length} ${sets.length === 1 ? "set" : "sets"}`,
          ]}
          meta={`Every planned set of ${workout.name} is recorded`}
          rotationLine={
            workout.sourceKind === "one_time"
              ? "One-time workouts never advance the rotation."
              : "Rotation advances to the next split."
          }
          onDone={() => {
            setComplete(false);
            onFinish("completed");
          }}
        />
      ) : null}

      <ReviewFinishOverlay
        open={finishOverlay.open}
        onOpenChange={finishOverlay.requestOpenChange}
        workout={workout}
        clock={clock}
        submitting={finishing}
        onFinish={onFinish}
        onAskDiscard={() => {
          finishOverlay.requestOpenChange(false);
          setConfirmation({ kind: "discard" });
          confirmOverlay.requestOpenChange(true);
        }}
      />

      {confirmationDialog()}
      {finishing ? <BlockingProgress label="Saving your workout…" /> : null}
    </div>
  );

  function confirmationDialog() {
    return (
      <DestructiveDialog
        open={confirmOverlay.open}
        onOpenChange={(next) => {
          confirmOverlay.requestOpenChange(next);
          if (!next) setConfirmation(null);
        }}
        title={
          confirmation?.kind === "discard"
            ? "Discard this workout?"
            : confirmation?.kind === "exercise"
              ? `Remove ${confirmation.name} from this workout?`
              : "Remove this set?"
        }
        description={
          confirmation?.kind === "discard"
            ? "Its entered sets and notes are lost, no History record is created, and rotation is unchanged."
            : confirmation?.kind === "exercise"
              ? "Entered sets are discarded. Your library and the source split are unchanged."
              : "Its entered values are discarded. The source split is unchanged."
        }
        confirmLabel={confirmation?.kind === "discard" ? "Discard" : "Remove"}
        onConfirm={() => {
          const target = confirmation;
          setConfirmation(null);
          if (!target) return;
          if (target.kind === "discard") {
            onFinish("discarded");
            return;
          }
          if (target.kind === "exercise") {
            onSend("remove_exercise", {
              workoutExerciseId: target.exerciseId,
              confirmedPopulatedRemoval: true,
            });
            return;
          }
          onSend("remove_set", {
            workoutSetId: target.setId,
            confirmedPopulatedRemoval: true,
          });
        }}
      />
    );
  }
}

/** What a set shows before it is logged: its own values, or a sensible start. */
function seedDraft(
  workout: CurrentWorkout,
  exercise: WorkoutExercise | undefined,
  set: WorkoutSet | undefined,
): Draft {
  if (!exercise || !set)
    return { loadKg: null, reps: null, bandStrength: null };

  const index = exercise.sets.findIndex((item) => item.id === set.id);
  const previous = index > 0 ? exercise.sets[index - 1] : undefined;
  const lastTime = exercise.lastPerformance?.sets[index];

  return {
    loadKg: set.loadKg ?? previous?.loadKg ?? lastTime?.loadKg ?? null,
    reps:
      set.reps ?? previous?.reps ?? lastTime?.reps ?? exercise.minReps ?? null,
    bandStrength:
      (set.bandStrength as BandStrength | null) ??
      (previous?.bandStrength as BandStrength | null) ??
      null,
  };
}

function describeSet(exercise: WorkoutExercise, set: WorkoutSet): string {
  const unit = countUnit(exercise);
  const load =
    set.loadKg === null ? "BW" : `${formatWheelNumber(set.loadKg)} kg`;
  return `${load} × ${set.reps ?? 0} ${unit}`;
}

function moreActions(
  exercise: WorkoutExercise,
  set: WorkoutSet,
  mode: ExerciseLoadMode,
  optionalMode: ExerciseLoadMode | null,
  onChangeMode: (set: WorkoutSet, mode: ExerciseLoadMode) => void,
  onSend: (
    operation: ActiveWorkoutCommand["operation"],
    payload: ActiveWorkoutCommand["payload"],
  ) => string,
  setConfirmation: (value: Confirmation) => void,
  openConfirm: (open: boolean) => void,
  openFinish: () => void,
): OverlayAction[] {
  const base = baseModeOf(exercise);
  const onOptional = optionalMode !== null && mode === optionalMode;
  const lastSet = set.position === exercise.sets.length;
  const populated = exercise.sets.some((item) => isRecorded(exercise, item));

  return [
    ...(optionalMode === null
      ? []
      : [
          {
            key: "mode",
            label: onOptional
              ? `Remove ${exerciseOptionalModeLabels[optionalMode].toLowerCase()}`
              : exerciseOptionalModeLabels[optionalMode],
            icon: onOptional ? ("minus" as const) : ("plus" as const),
            onRun: () => onChangeMode(set, onOptional ? base : optionalMode),
          },
        ]),
    ...(lastSet
      ? [
          {
            key: "add-set",
            label: "Add a set to this exercise",
            icon: "plus" as const,
            onRun: () => onSend("add_set", { workoutExerciseId: exercise.id }),
          },
        ]
      : []),
    {
      key: "remove-set",
      label: "Remove this set",
      icon: "x",
      disabled: exercise.sets.length <= 1,
      onRun: () => {
        if (isRecorded(exercise, set)) {
          setConfirmation({
            kind: "set",
            setId: set.id,
            label: `set ${set.position}`,
          });
          openConfirm(true);
          return;
        }
        onSend("remove_set", {
          workoutSetId: set.id,
          confirmedPopulatedRemoval: false,
        });
      },
    },
    {
      key: "remove-exercise",
      label: "Remove this exercise",
      icon: "trash-2",
      onRun: () => {
        if (populated) {
          setConfirmation({
            kind: "exercise",
            exerciseId: exercise.id,
            name: exercise.exerciseName,
          });
          openConfirm(true);
          return;
        }
        onSend("remove_exercise", {
          workoutExerciseId: exercise.id,
          confirmedPopulatedRemoval: false,
        });
      },
    },
    {
      key: "finish",
      label: "Review & finish workout",
      icon: "check-check",
      onRun: openFinish,
    },
  ];
}

/** The single cue beside the stage: validation, save state, or a refusal. */
function StatusCue({
  cue,
  rowError,
  discardedChange,
  onDismissDiscarded,
  onRetry,
  onRefresh,
}: {
  cue:
    | Readonly<{ kind: "validation" | "saving" | "saved"; message: string }>
    | Readonly<{ kind: "failure"; message: string; recovery: string }>;
  rowError?: { kind: string; message: string };
  discardedChange: string | null;
  onDismissDiscarded: () => void;
  onRetry: () => void;
  onRefresh: () => void;
}) {
  const message =
    rowError?.kind === "error"
      ? rowError.message
      : cue.kind === "saved"
        ? undefined
        : cue.message;
  if (message === undefined && discardedChange === null) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-[var(--pf-gutter)] mt-1 flex min-h-11 shrink-0 flex-wrap items-center gap-2 text-[13px] font-medium"
    >
      {message !== undefined ? (
        <span
          className={
            cue.kind === "failure" || rowError?.kind === "error"
              ? "min-w-0 flex-1 text-[var(--pf-danger)]"
              : "min-w-0 flex-1 text-[var(--pf-text-3)]"
          }
        >
          {message}
        </span>
      ) : null}
      {cue.kind === "failure" ? (
        <button
          type="button"
          onClick={cue.recovery === "retry" ? onRetry : onRefresh}
          className="min-h-11 shrink-0 rounded-full border border-[var(--pf-danger)] px-3.5 font-semibold text-[var(--pf-danger)]"
        >
          {cue.recovery === "retry" ? "Retry" : "Refresh"}
        </button>
      ) : null}
      {discardedChange !== null ? (
        <span className="flex min-w-0 flex-1 items-center gap-2 text-[var(--pf-warn)]">
          {discardedChange} was refused and dropped.
          <button
            type="button"
            onClick={onDismissDiscarded}
            aria-label="Dismiss"
            className="flex size-8 shrink-0 items-center justify-center rounded-full"
          >
            <Icon name="x" size={14} />
          </button>
        </span>
      ) : null}
    </div>
  );
}
