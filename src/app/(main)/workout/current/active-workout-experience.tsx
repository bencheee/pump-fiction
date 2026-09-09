"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCurrentWorkoutAction } from "@/app/actions/workouts";
import { listExercisesAction } from "@/app/actions/exercises";
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
  BlockingProgress,
  DestructiveDialog,
  Icon,
  normalizeDecimalInput,
  Sheet,
  TextAreaField,
  TextField,
} from "@/shared/ui";

import {
  formatLastPerformanceDate,
  formatWorkoutSetLine,
  formatWorkoutClock,
} from "@/features/active-workout/ui/workout-presentation";

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
type FinishOutcome = "completed" | "incomplete" | "discarded";

export function ActiveWorkoutExperience({
  initial,
  exercises,
  outbox,
  transport,
}: {
  initial: CurrentWorkout;
  /** Optional eager data for isolated consumers; the routed screen loads lazily. */
  exercises?: readonly Exercise[];
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
  const [placeholderNames, setPlaceholderNames] = useState<
    Readonly<Record<string, string>>
  >({});
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null,
  );
  const requestedFinishRef = useRef<FinishOutcome | null>(null);
  const [finishing, setFinishing] = useState(false);
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
      // A command can be applied optimistically while this refresh is between
      // its server read and outbox read. Do not let that stale snapshot erase
      // the newer local revision; the next saved transition will refresh again.
      if (workoutRef.current.revision > optimistic.revision) return;
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
    const unsubscribe = delivery.controller.subscribe((nextStatus) => {
      setStatus(nextStatus);
      if (
        nextStatus.state === "save_failed" &&
        requestedFinishRef.current !== null
      ) {
        requestedFinishRef.current = null;
        setFinishing(false);
      }
    });
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

  useEffect(() => {
    if (requestedFinishRef.current === null) return;
    if (status.state === "saved") {
      router.replace("/today");
    }
  }, [router, status]);

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

  function finishWorkout(outcome: FinishOutcome) {
    if (finishing) return;
    requestedFinishRef.current = outcome;
    setFinishing(true);
    send("finish_workout", {
      outcome,
      finishedAt: new Date().toISOString(),
    });
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
      <header className="sticky top-0 z-5 flex h-[calc(40px+env(safe-area-inset-top))] items-end border-b border-[var(--pf-border)] bg-[var(--pf-bg-canvas)] px-[var(--pf-gutter)] pt-[env(safe-area-inset-top)]">
        <div className="flex h-10 w-full min-w-0 items-center gap-2">
          <h1 className="min-w-0 flex-1 truncate text-[14px] leading-none font-semibold">
            {workout.name}
          </h1>
          <button
            type="button"
            onClick={() =>
              send(paused ? "resume_timer" : "pause_timer", {
                transitionedAt: new Date().toISOString(),
              })
            }
            className="relative h-10 shrink-0 text-[11px] leading-none font-semibold text-[var(--pf-accent-strong)] after:absolute after:inset-x-0 after:-inset-y-0.5"
          >
            {paused ? "Resume" : "Continue Later"}
          </button>
          <span
            aria-label="Active duration"
            className={`pf-numeric shrink-0 text-[16px] leading-none font-semibold ${paused ? "text-[var(--pf-warn)]" : ""}`}
          >
            {formatWorkoutClock(displaySeconds)}
          </span>
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
              name={placeholderNames[exercise.id] ?? "New exercise"}
            />
          ) : (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              count={workout.exercises.length}
              placeholderIds={placeholderIds}
              feedback={feedback}
              expanded={expandedExerciseId === exercise.id}
              onToggle={() =>
                setExpandedExerciseId((current) =>
                  current === exercise.id ? null : exercise.id,
                )
              }
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
          initialExercises={exercises}
          onAdd={(selectedExercises) => {
            for (const exercise of selectedExercises) {
              const commandId = send("add_exercise", {
                exerciseId: exercise.id,
              });
              setPlaceholderNames((current) => ({
                ...current,
                [commandId]: exercise.name,
              }));
            }
          }}
        />
      </main>

      <div className="sticky bottom-0 z-10 mt-auto flex items-center justify-end gap-2 bg-[linear-gradient(to_bottom,transparent_0,var(--pf-bg-canvas)_18px)] px-[var(--pf-gutter)] pt-7 pb-3">
        <div
          role="status"
          aria-live="polite"
          className={`mr-auto flex min-h-10 min-w-0 items-center gap-2 rounded-[var(--pf-r-pill)] bg-[var(--pf-bg-canvas)] px-3 text-[12px] font-medium ${
            cue.kind === "validation" || cue.kind === "failure"
              ? "text-[var(--pf-danger)]"
              : cue.kind === "saved"
                ? "sr-only"
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
            className={cue.kind === "saving" ? "animate-spin" : undefined}
          />
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {cue.message}
          </span>
          {cue.kind === "failure" ? (
            cue.recovery === "refresh_and_replay" ? (
              <button
                type="button"
                onClick={() => void recoverFromConflict()}
                className="min-h-10 font-semibold underline underline-offset-4"
              >
                Refresh
              </button>
            ) : cue.recovery === "discard_and_replay" ? null : (
              <button
                type="button"
                onClick={() => void delivery.controller.flush()}
                className="min-h-10 font-semibold underline underline-offset-4"
              >
                Retry
              </button>
            )
          ) : null}
        </div>
        <FinishWorkoutSheet
          workout={workout}
          displaySeconds={displaySeconds}
          submitting={finishing}
          onFinish={finishWorkout}
        />
      </div>
      {finishing ? <BlockingProgress label="Finishing workout…" /> : null}
    </div>
  );
}

function FinishWorkoutSheet({
  workout,
  displaySeconds,
  submitting,
  onFinish,
}: {
  workout: CurrentWorkout;
  displaySeconds: number;
  submitting: boolean;
  onFinish: (outcome: FinishOutcome) => void;
}) {
  const isOneTime = workout.sourceKind === "one_time";
  const recordedSets = workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.filter((set) => isSetRecorded(set.loadMode, set)).length,
    0,
  );
  const plannedWithoutValues = workout.exercises.flatMap((exercise) =>
    exercise.plannedSets === null
      ? []
      : exercise.sets
          .filter(
            (set) =>
              set.position <= (exercise.plannedSets ?? 0) &&
              !isSetRecorded(set.loadMode, set),
          )
          .map((set) => `${exercise.exerciseName} set ${set.position}`),
  );

  return (
    <Sheet
      title="Review & Finish"
      description={workout.name}
      trigger={
        <button
          type="button"
          aria-label="Review and finish workout"
          className="flex size-13 shrink-0 items-center justify-center rounded-full bg-[var(--pf-accent)] text-[var(--pf-on-accent)] shadow-[var(--pf-shadow-toast)]"
        >
          <Icon name="check" size={20} />
        </button>
      }
    >
      {(close) => (
        <div className="space-y-4">
          <dl className="grid grid-cols-3 gap-2 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-3 text-center">
            <FinishMetric
              label="Duration"
              value={formatWorkoutClock(displaySeconds)}
            />
            <FinishMetric
              label="Exercises"
              value={String(workout.exercises.length)}
            />
            <FinishMetric label="Recorded sets" value={String(recordedSets)} />
          </dl>

          {!isOneTime && plannedWithoutValues.length > 0 ? (
            <div className="text-[13px] leading-[1.45] text-[var(--pf-warn)]">
              <p className="flex items-start gap-2 font-medium">
                <Icon name="triangle-alert" size={14} className="mt-0.5" />
                {plannedWithoutValues.length} planned set
                {plannedWithoutValues.length === 1 ? "" : "s"} left without
                values
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-8">
                {plannedWithoutValues.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {isOneTime ? (
            <p className="text-[13px] leading-[1.45] text-[var(--pf-text-3-deep)]">
              No planned-set metric: this workout has no prescription, so its
              set rows are workout-local rather than planned.
            </p>
          ) : null}

          <div role="group" aria-label="Finish actions" className="space-y-2">
            <Action
              className="w-full"
              disabled={submitting}
              onClick={() => onFinish("completed")}
            >
              Complete Workout
            </Action>
            <Action
              variant="secondary"
              className="w-full"
              disabled={submitting}
              onClick={() => onFinish("incomplete")}
            >
              Save as Incomplete
            </Action>
            <button
              type="button"
              onClick={close}
              className="flex min-h-11 w-full items-center justify-center font-semibold text-[var(--pf-accent-strong)]"
            >
              Continue Workout
            </button>
            <DestructiveDialog
              trigger={
                <Action
                  variant="danger"
                  className="w-full"
                  disabled={submitting}
                >
                  Discard Workout
                </Action>
              }
              title="Discard this workout?"
              description="Its entered sets and notes are lost, no History record is created, and rotation is unchanged."
              confirmLabel="Discard Workout"
              onConfirm={() => onFinish("discarded")}
            />
          </div>
        </div>
      )}
    </Sheet>
  );
}

function FinishMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-[0.05em] text-[var(--pf-text-2)] uppercase">
        {label}
      </dt>
      <dd className="pf-numeric mt-1 truncate text-[16px] font-semibold">
        {value}
      </dd>
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
  expanded,
  onToggle,
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
  expanded: boolean;
  onToggle: () => void;
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
  const cardRef = useRef<HTMLElement>(null);
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
      className="flex size-11 items-center justify-center text-[var(--pf-text-2)]"
    >
      <Icon name="x" size={14} />
    </button>
  );
  const contentId = `exercise-${exercise.id}-content`;

  useEffect(() => {
    if (!expanded) return;
    const frame = window.requestAnimationFrame(() => {
      const card = cardRef.current;
      if (typeof card?.scrollIntoView !== "function") return;
      card.scrollIntoView({
        block: "start",
        behavior:
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ===
          true
            ? "auto"
            : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded]);

  return (
    <section
      ref={cardRef}
      aria-label={exercise.exerciseName}
      onClick={(event) => {
        if (expanded) return;
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest("button, a, input, select, textarea")
        )
          return;
        onToggle();
      }}
      className="scroll-mt-[calc(40px+env(safe-area-inset-top))] rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4"
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${exercise.exerciseName}`}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
          className="flex min-h-11 min-w-0 flex-1 items-start text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
              {exercise.exerciseName}
            </span>
            <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
              {meta}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-start">
          <button
            type="button"
            aria-label={`Move ${exercise.exerciseName} up`}
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
          >
            <Icon name="arrow-up" size={14} />
          </button>
          <button
            type="button"
            aria-label={`Move ${exercise.exerciseName} down`}
            disabled={index === count - 1}
            onClick={() => onMove(index, 1)}
            className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
          >
            <Icon name="arrow-down" size={14} />
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
              className="flex size-11 items-center justify-center text-[var(--pf-text-2)]"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      </div>

      <div id={contentId} hidden={!expanded}>
        {exercise.persistentNote ? (
          <div className="mt-3 border-l-2 border-[var(--pf-warn)] pl-3 text-[var(--pf-warn)]">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase">
              Exercise note
            </p>
            <p className="mt-1 text-[13px] leading-[1.4] [overflow-wrap:anywhere]">
              {exercise.persistentNote}
            </p>
          </div>
        ) : null}

        <div className="mt-3 border-t border-[var(--pf-border)] pt-3">
          <p className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Last time
            {exercise.lastPerformance !== null
              ? ` · ${formatLastPerformanceDate(exercise.lastPerformance.workoutDate)}`
              : ""}
          </p>
          {exercise.lastPerformance !== null ? (
            <ul className="pf-numeric mt-1 space-y-0.5 text-[13px] [overflow-wrap:anywhere]">
              {exercise.lastPerformance.sets.map((set) => (
                <li key={set.id}>{formatWorkoutSetLine(set)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[13px]">No completed performance yet.</p>
          )}
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
          className="ml-auto flex min-h-11 items-center justify-end gap-1.5 font-semibold text-[var(--pf-ok)]"
        >
          <Icon name="plus" size={14} /> Add Set
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
  const modeLabel =
    optionalMode === null
      ? null
      : mode === optionalMode
        ? `Remove ${optionalModeNoun[optionalMode]}`
        : exerciseOptionalModeLabels[optionalMode];

  return (
    <div className="py-2 first:pt-1 last:pb-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          aria-label={`Set ${set.position}`}
          className="pf-numeric w-4 shrink-0 text-center text-[13px] font-semibold text-[var(--pf-text-2)]"
        >
          {set.position}
        </span>
        {loadLabel !== null ? (
          <div className="relative min-w-0 flex-1">
            <label className="sr-only" htmlFor={`set-${set.id}-load`}>
              {loadLabel}
            </label>
            <input
              id={`set-${set.id}-load`}
              inputMode="decimal"
              value={loadDraft}
              autoComplete="off"
              className="pf-numeric h-8 w-full min-w-0 rounded-[var(--pf-r1)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface-2)] px-2 pr-8 text-[16px]"
              onChange={(event) => {
                setLoadDraft(event.target.value);
                if (feedback?.kind === "error") onClearFeedback(set.id);
              }}
              onBlur={commitLoad}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] font-semibold text-[var(--pf-text-3-deep)] uppercase"
            >
              {loadLabel}
            </span>
          </div>
        ) : null}
        {fields.band !== null ? (
          <div className="relative min-w-0 flex-1">
            <label className="sr-only" htmlFor={`set-${set.id}-band`}>
              {fields.band === "resistance"
                ? "Resistance band"
                : "Assistance band"}
            </label>
            <select
              id={`set-${set.id}-band`}
              value={set.bandStrength ?? ""}
              className="h-8 w-full min-w-0 appearance-none rounded-[var(--pf-r1)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface-2)] px-2 pr-5 text-[13px] capitalize"
              onChange={(event) => {
                if (event.target.value === "") return;
                onUpdate(set, mode, {
                  bandStrength: event.target.value as NonNullable<
                    WorkoutSet["bandStrength"]
                  >,
                });
                if (feedback?.kind === "error") onClearFeedback(set.id);
              }}
            >
              <option value="" disabled>
                Band
              </option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="strong">Strong</option>
            </select>
            <Icon
              name="chevron-down"
              size={12}
              className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-[var(--pf-text-3-deep)]"
            />
          </div>
        ) : null}
        <div className="relative min-w-0 flex-1">
          <label className="sr-only" htmlFor={`set-${set.id}-reps`}>
            Reps
          </label>
          <input
            id={`set-${set.id}-reps`}
            inputMode="numeric"
            value={repsDraft}
            autoComplete="off"
            className="pf-numeric h-8 w-full min-w-0 rounded-[var(--pf-r1)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface-2)] px-2 pr-9 text-[16px]"
            onChange={(event) => {
              setRepsDraft(event.target.value);
              if (feedback?.kind === "error") onClearFeedback(set.id);
            }}
            onBlur={commitReps}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] font-semibold text-[var(--pf-text-3-deep)] uppercase"
          >
            Reps
          </span>
        </div>
        {optionalMode !== null && modeLabel !== null ? (
          <button
            type="button"
            aria-label={modeLabel}
            title={modeLabel}
            onClick={() =>
              onChangeMode(set, mode === optionalMode ? baseMode : optionalMode)
            }
            className="flex size-8 shrink-0 items-center justify-center text-[var(--pf-accent-strong)]"
          >
            <Icon name={mode === optionalMode ? "minus" : "plus"} size={13} />
          </button>
        ) : null}
        {isPopulatedSet(set) ? (
          <DestructiveDialog
            trigger={
              <button
                type="button"
                aria-label={`Remove set ${set.position} of ${exercise.exerciseName}`}
                className="flex size-8 shrink-0 items-center justify-center text-[var(--pf-text-2)]"
              >
                <Icon name="x" size={14} />
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
            aria-label={`Remove set ${set.position} of ${exercise.exerciseName}`}
            onClick={() => onRemove(set, false)}
            className="flex size-8 shrink-0 items-center justify-center text-[var(--pf-text-2)]"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

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
    </div>
  );
}

function AddExerciseSheet({
  initialExercises,
  onAdd,
}: {
  initialExercises?: readonly Exercise[];
  onAdd: (exercises: readonly Exercise[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [exercises, setExercises] = useState<readonly Exercise[] | null>(
    initialExercises ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  async function loadExercises() {
    if (exercises !== null || loading) return;
    setLoading(true);
    setError(undefined);
    const result = await listExercisesAction();
    if (result.ok) setExercises(result.value);
    else setError(result.error.message);
    setLoading(false);
  }
  const filtered = (exercises ?? []).filter((exercise) =>
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
      onOpenChange={(open) => {
        if (open) void loadExercises();
      }}
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
          {loading ? (
            <p
              role="status"
              className="flex min-h-20 items-center justify-center gap-2 text-[var(--pf-text-2)]"
            >
              <Icon name="loader-circle" size={16} /> Loading exercises…
            </p>
          ) : error ? (
            <div className="py-3 text-center">
              <p role="alert" className="text-[var(--pf-danger)]">
                {error}
              </p>
              <button
                type="button"
                className="mt-2 min-h-11 font-semibold text-[var(--pf-accent-strong)]"
                onClick={() => void loadExercises()}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
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
            disabled={selected.length === 0 || exercises === null}
            onClick={() => {
              onAdd(
                (exercises ?? []).filter((exercise) =>
                  selected.includes(exercise.id),
                ),
              );
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
  const value = Number(normalizeDecimalInput(text));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parsePositiveInteger(text: string): number | null {
  const value = Number(text.trim());
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
