"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCurrentWorkoutAction } from "@/app/actions/workouts";
import { applyCommandToWorkout } from "@/features/active-workout/domain/apply-command-to-workout";
import { describeCommandTarget } from "@/features/active-workout/domain/describe-command-target";
import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import {
  changeSetMode,
  isSetRecorded,
  setLoadFieldLabels,
  setModeFields,
} from "@/features/active-workout/domain/set-entry";
import type {
  CurrentWorkout,
  WorkoutExercise,
  WorkoutSet,
} from "@/features/active-workout/domain/workout";
import { newCommandId } from "@/features/active-workout/client/command-id";
import {
  isStructuralCommand,
  rebasePendingCommands,
} from "@/features/active-workout/client/rebase-pending-commands";
import { restoreActiveWorkout } from "@/features/active-workout/client/restore-active-workout";
import {
  ActiveWorkoutDeliveryController,
  type ActiveWorkoutSaveStatus,
} from "@/features/active-workout/client/active-workout-delivery-controller";
import type { ActiveWorkoutOutbox } from "@/features/active-workout/client/active-workout-outbox";
import { IndexedDbActiveWorkoutOutbox } from "@/features/active-workout/client/active-workout-outbox";
import type { ActiveWorkoutCommandTransport } from "@/features/active-workout/client/active-workout-command-transport";
import { FetchActiveWorkoutCommandTransport } from "@/features/active-workout/client/active-workout-command-transport";
import {
  baseLoadModeByBaseType,
  type Exercise,
  type ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";
import {
  exerciseOptionalModeLabels,
  exerciseTypeLabels,
} from "@/features/exercises/ui/exercise-presentation";
import {
  Action,
  Chip,
  DestructiveDialog,
  Icon,
  NumericField,
  Sheet,
  StickyActionBar,
  TextAreaField,
  TextField,
} from "@/shared/ui";

import { formatLastPerformance, formatWorkoutClock } from "./workout-format";

const optionalModeNoun: Readonly<Record<ExerciseLoadMode, string>> = {
  weight: "weight",
  weight_resistance_band: "resistance band",
  bodyweight: "bodyweight",
  bodyweight_added_weight: "added weight",
  bodyweight_resistance_band: "resistance band",
  assistance_weight: "assistance weight",
  assistance_band: "assistance band",
};

function setBaseMode(exercise: WorkoutExercise): ExerciseLoadMode {
  const implied = baseLoadModeByBaseType[exercise.exerciseBaseType];
  return implied ?? exercise.allowedLoadModes[0]!;
}

type RowFeedback = Readonly<{ kind: "error" | "notice"; message: string }>;

export function ActiveWorkoutExperience({
  initial,
  exercises,
  outbox,
  transport,
}: {
  initial: CurrentWorkout;
  exercises: readonly Exercise[];
  outbox?: ActiveWorkoutOutbox;
  transport?: ActiveWorkoutCommandTransport;
}) {
  const router = useRouter();
  const [delivery] = useState(() => {
    const commandOutbox = outbox ?? new IndexedDbActiveWorkoutOutbox();
    return {
      outbox: commandOutbox,
      controller: new ActiveWorkoutDeliveryController(
        commandOutbox,
        transport ?? new FetchActiveWorkoutCommandTransport(),
      ),
    };
  });
  const [workout, setWorkoutState] = useState(initial);
  const workoutRef = useRef(initial);
  const [status, setStatus] = useState<ActiveWorkoutSaveStatus>(
    delivery.controller.getStatus(),
  );
  const [placeholderIds, setPlaceholderIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [feedback, setFeedback] = useState<
    Readonly<Record<string, RowFeedback>>
  >({});
  const [now, setNow] = useState(() => Date.now());
  const [discardedChange, setDiscardedChange] = useState<string | null>(null);
  const recoveringRef = useRef(false);

  const adoptWorkout = useCallback((next: CurrentWorkout) => {
    workoutRef.current = next;
    setWorkoutState(next);
  }, []);

  const send = useCallback(
    (
      operation: ActiveWorkoutCommand["operation"],
      payload: ActiveWorkoutCommand["payload"],
    ): string => {
      const current = workoutRef.current;
      const command = {
        commandId: newCommandId(),
        workoutId: current.id,
        expectedRevision: current.revision,
        operation,
        payload,
        clientCreatedAt: new Date().toISOString(),
      } as ActiveWorkoutCommand;
      adoptWorkout(applyCommandToWorkout(current, command));
      if (isStructuralCommand(command))
        setPlaceholderIds((ids) => new Set([...ids, command.commandId]));
      void delivery.controller.enqueue(command);
      return command.commandId;
    },
    [adoptWorkout, delivery.controller],
  );

  const refreshAuthoritative = useCallback(async () => {
    if (recoveringRef.current) return;
    recoveringRef.current = true;
    try {
      const result = await getCurrentWorkoutAction();
      if (!result.ok) return;
      if (result.value === null || result.value.id !== initial.id) {
        router.replace("/today");
        return;
      }
      const pending = await delivery.outbox.list(initial.id);
      const optimistic = pending.reduce(
        (state, entry) => applyCommandToWorkout(state, entry.command),
        result.value,
      );
      adoptWorkout(optimistic);
      setPlaceholderIds(
        new Set(
          pending
            .filter((entry) => isStructuralCommand(entry.command))
            .map((entry) => entry.command.commandId),
        ),
      );
    } finally {
      recoveringRef.current = false;
    }
  }, [adoptWorkout, delivery.outbox, initial.id, router]);

  const recoverFromConflict = useCallback(async () => {
    if (recoveringRef.current) return;
    recoveringRef.current = true;
    try {
      const result = await getCurrentWorkoutAction();
      if (!result.ok) return;
      if (result.value === null || result.value.id !== initial.id) {
        router.replace("/today");
        return;
      }
      const rebased = await rebasePendingCommands(
        delivery.outbox,
        result.value,
      );
      adoptWorkout(rebased.workout);
      setPlaceholderIds(rebased.placeholderIds);
    } finally {
      recoveringRef.current = false;
    }
    void delivery.controller.flush();
  }, [adoptWorkout, delivery, initial.id, router]);

  useEffect(() => {
    const unsubscribe = delivery.controller.subscribe(setStatus);
    void restoreActiveWorkout(
      initial.id,
      delivery.outbox,
      () => Promise.resolve(initial),
      applyCommandToWorkout,
    ).then(({ optimistic, pendingCommands }) => {
      if (pendingCommands.length > 0) {
        adoptWorkout(optimistic);
        setPlaceholderIds(
          new Set(
            pendingCommands
              .filter((entry) => isStructuralCommand(entry.command))
              .map((entry) => entry.command.commandId),
          ),
        );
      }
      void delivery.controller.flush();
    });
    return unsubscribe;
  }, [adoptWorkout, delivery, initial]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.state === "saved" && placeholderIds.size > 0)
      void refreshAuthoritative();
  }, [placeholderIds.size, refreshAuthoritative, status]);

  // A refused command is already out of the outbox, so recovery runs without a
  // gesture: the workout must never sit stranded behind a change it cannot save.
  useEffect(() => {
    if (
      status.state !== "save_failed" ||
      status.recovery.kind !== "discard_and_replay"
    )
      return;
    setDiscardedChange(
      describeCommandTarget(workoutRef.current, status.recovery.discarded),
    );
    void recoverFromConflict();
  }, [recoverFromConflict, status]);

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const paused = workout.status === "paused";
  const activeSegmentSeconds =
    !paused && workout.activeSegmentStartedAt !== null
      ? Math.max(0, (now - Date.parse(workout.activeSegmentStartedAt)) / 1000)
      : 0;
  const displaySeconds =
    workout.accumulatedActiveSeconds + activeSegmentSeconds;

  const firstError = useMemo(() => {
    for (const exercise of workout.exercises)
      for (const set of exercise.sets) {
        const entry = feedback[set.id];
        if (entry?.kind === "error") return entry.message;
      }
    return undefined;
  }, [feedback, workout.exercises]);

  function setRowFeedback(setId: string, entry: RowFeedback | undefined) {
    setFeedback((current) => {
      const next = { ...current };
      if (entry === undefined) delete next[setId];
      else next[setId] = entry;
      return next;
    });
  }

  function updateSet(
    set: WorkoutSet,
    mode: ExerciseLoadMode,
    changes: Partial<Pick<WorkoutSet, "loadKg" | "bandStrength" | "reps">>,
  ) {
    send("update_set", {
      workoutSetId: set.id,
      loadMode: mode,
      loadKg: changes.loadKg !== undefined ? changes.loadKg : set.loadKg,
      bandDirection: setModeFields[mode].band,
      bandStrength:
        changes.bandStrength !== undefined
          ? changes.bandStrength
          : set.bandStrength,
      reps: changes.reps !== undefined ? changes.reps : set.reps,
    });
    if (feedback[set.id]?.kind === "error") setRowFeedback(set.id, undefined);
  }

  function changeMode(set: WorkoutSet, mode: ExerciseLoadMode) {
    const change = changeSetMode(set, mode);
    send("update_set", {
      workoutSetId: set.id,
      loadMode: mode,
      loadKg: change.set.loadKg,
      bandDirection: change.set.bandDirection,
      bandStrength: change.set.bandStrength,
      reps: change.set.reps,
    });
    setRowFeedback(
      set.id,
      change.clearedLabels.length > 0
        ? {
            kind: "notice",
            message: `Cleared ${change.clearedLabels.join(" and ")}.`,
          }
        : undefined,
    );
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= workout.exercises.length) return;
    const ids = workout.exercises.map((item) => item.id);
    [ids[index], ids[destination]] = [ids[destination]!, ids[index]!];
    send("reorder_exercises", { workoutExerciseIds: ids });
  }

  const cue = firstError
    ? { kind: "validation" as const, message: firstError }
    : status.state === "saving"
      ? { kind: "saving" as const, message: "Saving…" }
      : status.state === "save_failed"
        ? {
            kind: "failure" as const,
            message: status.message,
            recovery: status.recovery.kind,
          }
        : { kind: "saved" as const, message: "All changes saved" };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-5 border-b border-[var(--pf-border)] bg-[var(--pf-bg-canvas)] px-[var(--pf-gutter)] pt-[calc(env(safe-area-inset-top)+10px)] pb-2.5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 text-[17px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
            {workout.name}
          </h1>
          <span
            aria-label="Active duration"
            className={`pf-numeric text-[21px] leading-[1.2] font-semibold ${paused ? "text-[var(--pf-warn)]" : ""}`}
          >
            {formatWorkoutClock(displaySeconds)}
          </span>
        </div>
        <div className="mt-1.5 flex justify-end">
          <button
            type="button"
            onClick={() =>
              send(paused ? "resume_timer" : "pause_timer", {
                transitionedAt: new Date().toISOString(),
              })
            }
            className="min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-border-control)] px-4 font-semibold"
          >
            {paused ? "Resume" : "Continue Later"}
          </button>
        </div>
      </header>

      {paused ? (
        <p
          role="status"
          className="flex min-h-11 items-center gap-2 border-b border-[var(--pf-border)] px-[var(--pf-gutter)] text-[13px] font-medium text-[var(--pf-warn)]"
        >
          <Icon name="pause" size={14} /> Paused — active duration is not
          counting.
        </p>
      ) : null}

      <main className="flex flex-1 flex-col gap-4 px-[var(--pf-gutter)] pt-4">
        {discardedChange !== null ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[var(--pf-r2)] border border-[var(--pf-warn)] bg-[var(--pf-bg-surface)] p-3 text-[13px] leading-[1.5]"
          >
            <Icon name="triangle-alert" size={14} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              One change could not be saved and was undone: {discardedChange}.
              Everything else is saved and the workout continues.
            </span>
            <button
              type="button"
              aria-label="Dismiss the undone change notice"
              onClick={() => setDiscardedChange(null)}
              className="min-h-11 min-w-11 shrink-0 text-[var(--pf-accent-strong)]"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        ) : null}
        {workout.exercises.map((exercise, index) =>
          placeholderIds.has(exercise.id) ? (
            <PlaceholderExerciseCard
              key={exercise.id}
              name={
                exercisesById.get(exercise.exerciseId)?.name ?? "New exercise"
              }
            />
          ) : (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              count={workout.exercises.length}
              placeholderIds={placeholderIds}
              feedback={feedback}
              onMove={moveExercise}
              onRemoveExercise={(confirmed) =>
                send("remove_exercise", {
                  workoutExerciseId: exercise.id,
                  confirmedPopulatedRemoval: confirmed,
                })
              }
              onAddSet={() =>
                send("add_set", { workoutExerciseId: exercise.id })
              }
              onRemoveSet={(set, confirmed) =>
                send("remove_set", {
                  workoutSetId: set.id,
                  confirmedPopulatedRemoval: confirmed,
                })
              }
              onNoteCommit={(note) =>
                send("set_workout_exercise_note", {
                  workoutExerciseId: exercise.id,
                  note,
                })
              }
              onUpdateSet={updateSet}
              onChangeMode={changeMode}
              onClearFeedback={(setId) => setRowFeedback(setId, undefined)}
            />
          ),
        )}

        <AddExerciseSheet
          exercises={exercises}
          onAdd={(ids) => {
            for (const exerciseId of ids) send("add_exercise", { exerciseId });
          }}
        />
      </main>

      <StickyActionBar className="z-10">
        <div
          role="status"
          aria-live="polite"
          className={`flex min-h-11 items-center gap-2 text-[13px] font-medium ${
            cue.kind === "validation" || cue.kind === "failure"
              ? "text-[var(--pf-danger)]"
              : cue.kind === "saved"
                ? "text-[var(--pf-ok)]"
                : "text-[var(--pf-text-2)]"
          }`}
        >
          <Icon
            name={
              cue.kind === "validation"
                ? "triangle-alert"
                : cue.kind === "failure"
                  ? "circle-x"
                  : cue.kind === "saving"
                    ? "loader-circle"
                    : "circle-check"
            }
            size={14}
          />
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
            {cue.message}
          </span>
          {cue.kind === "failure" ? (
            cue.recovery === "refresh_and_replay" ? (
              <button
                type="button"
                onClick={() => void recoverFromConflict()}
                className="min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-danger)] px-3 font-semibold"
              >
                Refresh
              </button>
            ) : cue.recovery === "discard_and_replay" ? null : (
              <button
                type="button"
                onClick={() => void delivery.controller.flush()}
                className="min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-danger)] px-3 font-semibold"
              >
                Retry
              </button>
            )
          ) : null}
        </div>
        <Link
          href="/workout/current/finish"
          className="flex min-h-[var(--pf-size-primary-action)] w-full items-center justify-center rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 font-semibold text-[var(--pf-on-accent)]"
        >
          Review &amp; Finish
        </Link>
      </StickyActionBar>
    </div>
  );
}

function PlaceholderExerciseCard({ name }: { name: string }) {
  return (
    <section className="rounded-[var(--pf-r3)] border border-dashed border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4">
      <h2 className="text-[18px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
        {name}
      </h2>
      <p
        role="status"
        className="mt-2 flex items-center gap-2 text-[13px] text-[var(--pf-text-2)]"
      >
        <Icon name="loader-circle" size={14} /> Adding to this workout…
      </p>
    </section>
  );
}

function ExerciseCard({
  exercise,
  index,
  count,
  placeholderIds,
  feedback,
  onMove,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onNoteCommit,
  onUpdateSet,
  onChangeMode,
  onClearFeedback,
}: {
  exercise: WorkoutExercise;
  index: number;
  count: number;
  placeholderIds: ReadonlySet<string>;
  feedback: Readonly<Record<string, RowFeedback>>;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemoveExercise: (confirmedPopulatedRemoval: boolean) => void;
  onAddSet: () => void;
  onRemoveSet: (set: WorkoutSet, confirmedPopulatedRemoval: boolean) => void;
  onNoteCommit: (note: string) => void;
  onUpdateSet: (
    set: WorkoutSet,
    mode: ExerciseLoadMode,
    changes: Partial<Pick<WorkoutSet, "loadKg" | "bandStrength" | "reps">>,
  ) => void;
  onChangeMode: (set: WorkoutSet, mode: ExerciseLoadMode) => void;
  onClearFeedback: (setId: string) => void;
}) {
  const [noteState, setNoteState] = useState(() => ({
    committed: exercise.workoutNote,
    draft: exercise.workoutNote,
  }));
  if (noteState.committed !== exercise.workoutNote)
    setNoteState({
      committed: exercise.workoutNote,
      draft: exercise.workoutNote,
    });
  const noteDraft = noteState.draft;
  const recordedCount = exercise.sets.filter((set) =>
    isSetRecorded(set.loadMode ?? setBaseMode(exercise), set),
  ).length;
  const populated = exercise.sets.some(isPopulatedSet);
  const meta =
    exercise.plannedSets !== null
      ? `${exercise.plannedSets} planned${
          exercise.minReps !== null && exercise.maxReps !== null
            ? ` × ${exercise.minReps}–${exercise.maxReps} reps`
            : ""
        } · ${recordedCount} of ${exercise.sets.length} recorded`
      : `Workout-local, no prescription · ${recordedCount} of ${exercise.sets.length} recorded`;

  const removeTrigger = (
    <button
      type="button"
      aria-label={`Remove ${exercise.exerciseName}`}
      className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] text-[var(--pf-text-2)]"
    >
      <Icon name="x" size={18} />
    </button>
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
          <h2 className="text-[18px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
            {exercise.exerciseName}
          </h2>
          <p className="mt-1 text-[12.5px] text-[var(--pf-text-2)]">{meta}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          aria-label={`Move ${exercise.exerciseName} up`}
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] disabled:opacity-[var(--pf-opacity-disabled)]"
        >
          <Icon name="arrow-up" size={18} />
        </button>
        <button
          type="button"
          aria-label={`Move ${exercise.exerciseName} down`}
          disabled={index === count - 1}
          onClick={() => onMove(index, 1)}
          className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] disabled:opacity-[var(--pf-opacity-disabled)]"
        >
          <Icon name="arrow-down" size={18} />
        </button>
        {populated ? (
          <DestructiveDialog
            trigger={removeTrigger}
            title={`Remove ${exercise.exerciseName} from this workout?`}
            description="Entered sets are discarded. Your library and the source split are unchanged."
            confirmLabel="Remove Exercise"
            onConfirm={() => onRemoveExercise(true)}
          />
        ) : (
          <button
            type="button"
            aria-label={`Remove ${exercise.exerciseName}`}
            onClick={() => onRemoveExercise(false)}
            className="flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] text-[var(--pf-text-2)]"
          >
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {exercise.persistentNote ? (
        <div className="mt-4 border-l-2 border-[var(--pf-border-strong)] pl-3">
          <p className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Exercise note
          </p>
          <p className="mt-1 text-[13px] leading-[1.5] [overflow-wrap:anywhere] text-[var(--pf-text-2)]">
            {exercise.persistentNote}
          </p>
        </div>
      ) : null}

      <div className="mt-4 rounded-[var(--pf-r2)] bg-[var(--pf-bg-surface-2)] p-3">
        <p className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
          Last time
        </p>
        <p className="pf-numeric mt-1 text-[14px] [overflow-wrap:anywhere]">
          {exercise.lastPerformance !== null
            ? formatLastPerformance(exercise.lastPerformance)
            : "No completed performance yet."}
        </p>
      </div>

      <div className="mt-2 divide-y divide-[var(--pf-border)]">
        {exercise.sets.map((set) =>
          placeholderIds.has(set.id) ? (
            <p
              key={set.id}
              role="status"
              className="flex min-h-11 items-center gap-2 py-3 text-[13px] text-[var(--pf-text-2)]"
            >
              <Icon name="loader-circle" size={14} /> Adding set…
            </p>
          ) : (
            <SetRow
              key={set.id}
              exercise={exercise}
              set={set}
              feedback={feedback[set.id]}
              onUpdate={onUpdateSet}
              onChangeMode={onChangeMode}
              onRemove={onRemoveSet}
              onClearFeedback={onClearFeedback}
            />
          ),
        )}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--pf-r2)] border border-dashed border-[var(--pf-border-control)] font-semibold text-[var(--pf-accent-strong)]"
      >
        <Icon name="plus" size={16} /> Add Set
      </button>

      <div className="mt-4">
        <TextAreaField
          id={`workout-note-${exercise.id}`}
          label="Today's note · saved with this workout"
          placeholder="Optional note for this occurrence"
          value={noteDraft}
          onChange={(event) =>
            setNoteState((current) => ({
              ...current,
              draft: event.target.value,
            }))
          }
          onBlur={() => {
            if (noteDraft !== exercise.workoutNote) onNoteCommit(noteDraft);
          }}
        />
      </div>
    </section>
  );
}

function SetRow({
  exercise,
  set,
  feedback,
  onUpdate,
  onChangeMode,
  onRemove,
  onClearFeedback,
}: {
  exercise: WorkoutExercise;
  set: WorkoutSet;
  feedback: RowFeedback | undefined;
  onUpdate: (
    set: WorkoutSet,
    mode: ExerciseLoadMode,
    changes: Partial<Pick<WorkoutSet, "loadKg" | "bandStrength" | "reps">>,
  ) => void;
  onChangeMode: (set: WorkoutSet, mode: ExerciseLoadMode) => void;
  onRemove: (set: WorkoutSet, confirmedPopulatedRemoval: boolean) => void;
  onClearFeedback: (setId: string) => void;
}) {
  const baseMode = setBaseMode(exercise);
  const optionalMode =
    exercise.allowedLoadModes.find((allowed) => allowed !== baseMode) ?? null;
  const mode = set.loadMode ?? baseMode;
  const committedKey = `${set.loadMode ?? ""}|${set.loadKg ?? ""}|${set.reps ?? ""}`;
  const [draftState, setDraftState] = useState(() => ({
    key: committedKey,
    load: set.loadKg !== null ? String(set.loadKg) : "",
    reps: set.reps !== null ? String(set.reps) : "",
  }));
  if (draftState.key !== committedKey)
    setDraftState({
      key: committedKey,
      load: set.loadKg !== null ? String(set.loadKg) : "",
      reps: set.reps !== null ? String(set.reps) : "",
    });
  const loadDraft = draftState.load;
  const repsDraft = draftState.reps;
  const setLoadDraft = (value: string) =>
    setDraftState((current) => ({ ...current, load: value }));
  const setRepsDraft = (value: string) =>
    setDraftState((current) => ({ ...current, reps: value }));

  const fields = setModeFields[mode];
  const loadLabel =
    fields.load !== null ? setLoadFieldLabels[fields.load] : null;

  function commitLoad() {
    const parsed = parsePositiveDecimal(loadDraft);
    if (parsed !== set.loadKg) onUpdate(set, mode, { loadKg: parsed });
  }
  function commitReps() {
    const parsed = parsePositiveInteger(repsDraft);
    if (parsed !== set.reps) onUpdate(set, mode, { reps: parsed });
  }
  return (
    <div className="py-4 first:pt-2 last:pb-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">Set {set.position}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        {loadLabel !== null ? (
          <div className="min-w-[104px] flex-1">
            <NumericField
              id={`set-${set.id}-load`}
              label={loadLabel}
              value={loadDraft}
              autoComplete="off"
              onChange={(event) => {
                setLoadDraft(event.target.value);
                if (feedback?.kind === "error") onClearFeedback(set.id);
              }}
              onBlur={commitLoad}
            />
          </div>
        ) : null}
        {fields.band !== null ? (
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
              {(["light", "medium", "strong"] as const).map((strength) => (
                <Chip
                  key={strength}
                  selected={set.bandStrength === strength}
                  onClick={() => {
                    onUpdate(set, mode, { bandStrength: strength });
                    if (feedback?.kind === "error") onClearFeedback(set.id);
                  }}
                >
                  {strength === "light"
                    ? "Light"
                    : strength === "medium"
                      ? "Medium"
                      : "Strong"}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}
        <div className="min-w-[88px] flex-1">
          <NumericField
            id={`set-${set.id}-reps`}
            label="Reps"
            inputMode="numeric"
            value={repsDraft}
            autoComplete="off"
            onChange={(event) => {
              setRepsDraft(event.target.value);
              if (feedback?.kind === "error") onClearFeedback(set.id);
            }}
            onBlur={commitReps}
          />
        </div>
      </div>

      {optionalMode !== null ? (
        <button
          type="button"
          onClick={() =>
            onChangeMode(set, mode === optionalMode ? baseMode : optionalMode)
          }
          className="mt-3 flex min-h-11 items-center gap-1.5 rounded-[var(--pf-r-pill)] border border-dashed border-[var(--pf-border-control)] px-3 text-[13px] font-medium text-[var(--pf-accent-strong)]"
        >
          <Icon name={mode === optionalMode ? "x" : "plus"} size={14} />
          {mode === optionalMode
            ? `Remove ${optionalModeNoun[optionalMode]}`
            : exerciseOptionalModeLabels[optionalMode]}
        </button>
      ) : null}

      {feedback?.kind === "error" ? (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1 text-[12.5px] font-medium text-[var(--pf-danger)]"
        >
          <Icon name="triangle-alert" size={14} /> {feedback.message}
        </p>
      ) : null}
      {feedback?.kind === "notice" ? (
        <p
          role="status"
          className="mt-2 flex items-center gap-1 text-[12.5px] font-medium text-[var(--pf-text-2)]"
        >
          <Icon name="info" size={14} /> {feedback.message}
        </p>
      ) : null}

      {isPopulatedSet(set) ? (
        <DestructiveDialog
          trigger={
            <button
              type="button"
              className="mt-2 min-h-11 text-[13px] font-medium text-[var(--pf-text-2)]"
            >
              Remove set
            </button>
          }
          title={`Remove set ${set.position} of ${exercise.exerciseName}?`}
          description="Its entered values are discarded. The source split is unchanged."
          confirmLabel="Remove Set"
          onConfirm={() => onRemove(set, true)}
        />
      ) : (
        <button
          type="button"
          onClick={() => onRemove(set, false)}
          className="mt-2 min-h-11 text-[13px] font-medium text-[var(--pf-text-2)]"
        >
          Remove set
        </button>
      )}
    </div>
  );
}

function AddExerciseSheet({
  exercises,
  onAdd,
}: {
  exercises: readonly Exercise[];
  onAdd: (exerciseIds: readonly string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const filtered = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <Sheet
      title="Add Exercise"
      description="Choose from your active library. This workout only."
      trigger={
        <button
          type="button"
          className="mb-2 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[var(--pf-r2)] border border-dashed border-[var(--pf-border-control)] font-semibold text-[var(--pf-accent-strong)]"
        >
          <Icon name="plus" size={18} /> Add Exercise
        </button>
      }
    >
      {(close) => (
        <div className="space-y-3">
          <TextField
            id="add-exercise-search"
            label="Search active library"
            placeholder="Search active library"
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          <p className="text-[12.5px] text-[var(--pf-text-3-deep)]">
            Archived exercises are not listed.
          </p>
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-[var(--pf-text-2)]">
              No active exercise matches this search.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((exercise) => {
                const isSelected = selected.includes(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={exercise.name}
                    onClick={() => toggle(exercise.id)}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-[var(--pf-r2)] border px-3 py-2.5 text-left ${
                      isSelected
                        ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent-dim)]"
                        : "border-[var(--pf-border-control)] bg-[var(--pf-bg-surface)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-6 shrink-0 items-center justify-center rounded-[var(--pf-r1)] border ${
                        isSelected
                          ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent-strong)] text-[var(--pf-on-accent)]"
                          : "border-[var(--pf-border-control)] text-transparent"
                      }`}
                    >
                      <Icon name="check" size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold [overflow-wrap:anywhere]">
                        {exercise.name}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-[var(--pf-text-2)]">
                        {exerciseTypeLabels[exercise.baseType]} ·{" "}
                        {exercise.allowedLoadModes.length}{" "}
                        {exercise.allowedLoadModes.length === 1
                          ? "mode"
                          : "modes"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <Action
            className="w-full"
            disabled={selected.length === 0}
            onClick={() => {
              onAdd(selected);
              setSelected([]);
              close();
            }}
          >
            Add Selected
          </Action>
        </div>
      )}
    </Sheet>
  );
}

function isPopulatedSet(set: WorkoutSet): boolean {
  return set.loadKg !== null || set.bandStrength !== null || set.reps !== null;
}

function parsePositiveDecimal(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parsePositiveInteger(text: string): number | null {
  const value = Number(text.trim());
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
