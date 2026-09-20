"use client";

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
import { exerciseOptionalModeLabels } from "@/features/exercises/ui/exercise-presentation";
import {
  Action,
  BlockingProgress,
  DestructiveDialog,
  Icon,
  normalizeDecimalInput,
  Sheet,
  TextAreaField,
} from "@/shared/ui";

import {
  flattenSets,
  nextInQueue,
} from "@/features/active-workout/ui/set-queue-presentation";
import {
  formatLastPerformanceDate,
  formatWorkoutSetLine,
  formatWorkoutClock,
} from "@/features/active-workout/ui/workout-presentation";

import { AddExerciseSheet } from "./add-exercise-sheet";
import { baseModeOf, SetQueue } from "./set-queue";

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
type FinishOutcome = "completed" | "discarded";

export function ActiveWorkoutExperience({
  initial,
  initialView = "queue",
  exercises,
  outbox,
  transport,
}: {
  initial: CurrentWorkout;
  /** Which screen the action that brought us here lands on; see `page.tsx`. */
  initialView?: "queue" | "overview";
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
  // The prototype keeps `screen` and the `ei`/`si` pointer on the same state
  // machine as the workout (line 1791). Starting a workout lands on the
  // overview and resuming one lands on the queue, which is what `initialView`
  // carries; from then on the two buttons move between them.
  const [view, setView] = useState<"queue" | "overview">(initialView);
  const [cursorSetId, setCursorSetId] = useState<string | null>(null);

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

  // Every set of the workout in order, with the queue's pointer resolved
  // against it. The prototype points with two indices and clamps them whenever
  // a set or an exercise goes; the pointer here is the set's own id, so a
  // removal elsewhere cannot silently move it, and it falls back to the first
  // set still without values — which is where `advance()` would have left it.
  const flat = useMemo(
    () => flattenSets(workout.exercises, baseModeOf),
    [workout.exercises],
  );
  const current =
    flat.find((entry) => entry.set.id === cursorSetId) ??
    flat.find((entry) => !entry.recorded) ??
    flat[0];
  // Pin the pointer as soon as it resolves, the way `useScreenAnimation`
  // settles its own during render. Left on the fallback it would follow it, and
  // entering the last value a set needs — which is all the application means by
  // recorded — would move the screen off that set before the press that is
  // meant to.
  const resolvedSetId = current?.set.id ?? null;
  if (resolvedSetId !== cursorSetId) setCursorSetId(resolvedSetId);

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

  function addExercises(selectedExercises: readonly Exercise[]) {
    for (const exercise of selectedExercises) {
      const commandId = send("add_exercise", { exerciseId: exercise.id });
      setPlaceholderNames((names) => ({
        ...names,
        [commandId]: exercise.name,
      }));
    }
  }

  async function finishWorkout(outcome: FinishOutcome) {
    if (finishing) return;
    setFinishing(true);

    const drained = await delivery.controller.flush();
    if (drained.kind === "stopped") {
      setFinishing(false);
      return;
    }

    // The review itself is intentionally local. Before the terminal command,
    // reconcile once with the server under the blocking progress layer: a
    // reload can race the previous page's final acknowledgement after that
    // command has already left the shared IndexedDB outbox.
    const current = await getCurrentWorkoutAction();
    if (current.ok) {
      if (
        current.value === null ||
        current.value.id !== workoutRef.current.id
      ) {
        router.replace("/today");
        return;
      }
      adoptWorkout(current.value);
    }

    requestedFinishRef.current = outcome;
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

  const deliveryCue = (
    <>
      <div data-queue-status="" role="status" aria-live="polite">
        {cue.message}
      </div>
      {cue.kind === "failure" ? (
        <div role="alert">
          <span>{cue.message}</span>
          {cue.recovery === "refresh_and_replay" ? (
            <button type="button" onClick={() => void recoverFromConflict()}>
              Refresh
            </button>
          ) : cue.recovery === "discard_and_replay" ? null : (
            <button
              type="button"
              onClick={() => void delivery.controller.flush()}
            >
              Retry
            </button>
          )}
        </div>
      ) : null}
      {discardedChange !== null ? (
        <div role="alert">
          <span>
            One change could not be saved and was undone: {discardedChange}.
            Everything else is saved and the workout continues.
          </span>
          <button
            type="button"
            aria-label="Dismiss the undone change notice"
            onClick={() => setDiscardedChange(null)}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ) : null}
    </>
  );

  function togglePause() {
    send(paused ? "resume_timer" : "pause_timer", {
      transitionedAt: new Date().toISOString(),
    });
  }

  if (view === "queue")
    return (
      <>
        <SetQueue
          workout={workout}
          flat={flat}
          current={current}
          paused={paused}
          displaySeconds={displaySeconds}
          initialExercises={exercises}
          onTogglePause={togglePause}
          onOpenOverview={() => setView("overview")}
          onJump={(entry) => setCursorSetId(entry.set.id)}
          onAdvance={() => {
            const next = nextInQueue(flat, current);
            if (next !== undefined) setCursorSetId(next.set.id);
          }}
          onUpdateSet={updateSet}
          onChangeMode={changeMode}
          onAddSet={(exercise) =>
            send("add_set", { workoutExerciseId: exercise.id })
          }
          onRemoveSet={(set, confirmed) =>
            send("remove_set", {
              workoutSetId: set.id,
              confirmedPopulatedRemoval: confirmed,
            })
          }
          onRemoveExercise={(exercise, confirmed) =>
            send("remove_exercise", {
              workoutExerciseId: exercise.id,
              confirmedPopulatedRemoval: confirmed,
            })
          }
          onNoteCommit={(exercise, note) =>
            send("set_workout_exercise_note", {
              workoutExerciseId: exercise.id,
              note,
            })
          }
          onAddExercises={addExercises}
        />
        {deliveryCue}
        {finishing ? <BlockingProgress label="Finishing workout…" /> : null}
      </>
    );

  return (
    <div>
      <header>
        <div>
          <button type="button" onClick={() => setView("queue")}>
            Back to set
          </button>
          <h1>{workout.name}</h1>
          <button type="button" onClick={togglePause}>
            {paused ? "Resume" : "Continue Later"}
          </button>
          <span aria-label="Active duration">
            {formatWorkoutClock(displaySeconds)}
          </span>
        </div>
      </header>

      {paused ? (
        <p role="status">
          <Icon name="pause" size={14} /> Paused — active duration is not
          counting.
        </p>
      ) : null}

      <main>
        {discardedChange !== null ? (
          <div role="alert">
            <Icon name="triangle-alert" size={14} />
            <span>
              One change could not be saved and was undone: {discardedChange}.
              Everything else is saved and the workout continues.
            </span>
            <button
              type="button"
              aria-label="Dismiss the undone change notice"
              onClick={() => setDiscardedChange(null)}
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

        <AddExerciseSheet initialExercises={exercises} onAdd={addExercises} />
      </main>

      <div>
        <div role="status" aria-live="polite">
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
          <span>{cue.message}</span>
          {cue.kind === "failure" ? (
            cue.recovery === "refresh_and_replay" ? (
              <button type="button" onClick={() => void recoverFromConflict()}>
                Refresh
              </button>
            ) : cue.recovery === "discard_and_replay" ? null : (
              <button
                type="button"
                onClick={() => void delivery.controller.flush()}
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
        <button type="button" aria-label="Review and finish workout">
          <Icon name="check" size={20} />
        </button>
      }
    >
      {(close) => (
        <div>
          <dl>
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
            <div>
              <p>
                <Icon name="triangle-alert" size={14} />
                {plannedWithoutValues.length} planned set
                {plannedWithoutValues.length === 1 ? "" : "s"} left without
                values
              </p>
              <ul>
                {plannedWithoutValues.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {isOneTime ? (
            <p>
              No planned-set metric: this workout has no prescription, so its
              set rows are workout-local rather than planned.
            </p>
          ) : null}

          <div role="group" aria-label="Finish actions">
            <Action disabled={submitting} onClick={() => onFinish("completed")}>
              Complete Workout
            </Action>
            <button type="button" onClick={close}>
              Continue Workout
            </button>
            <DestructiveDialog
              trigger={
                <Action variant="danger" disabled={submitting}>
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
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function PlaceholderExerciseCard({ name }: { name: string }) {
  return (
    <section>
      <h2>{name}</h2>
      <p role="status">
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
            ? ` × ${exercise.minReps}–${exercise.maxReps} ${exercise.measurementType === "seconds" ? "sec" : "reps"}`
            : ""
        } · ${recordedCount} of ${exercise.sets.length} recorded`
      : `Workout-local, no prescription · ${recordedCount} of ${exercise.sets.length} recorded`;

  const removeTrigger = (
    <button type="button" aria-label={`Remove ${exercise.exerciseName}`}>
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
    >
      <div>
        <button
          type="button"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${exercise.exerciseName}`}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span>
            <span>{exercise.exerciseName}</span>
            <span>{meta}</span>
          </span>
        </button>
        <div>
          <button
            type="button"
            aria-label={`Move ${exercise.exerciseName} up`}
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
          >
            <Icon name="arrow-up" size={14} />
          </button>
          <button
            type="button"
            aria-label={`Move ${exercise.exerciseName} down`}
            disabled={index === count - 1}
            onClick={() => onMove(index, 1)}
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
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      </div>

      <div id={contentId} hidden={!expanded}>
        {exercise.persistentNote ? (
          <div>
            <p>Exercise note</p>
            <p>{exercise.persistentNote}</p>
          </div>
        ) : null}

        {exercise.previousWorkoutNote ? (
          <div>
            <p>
              Note from last workout ·{" "}
              {formatLastPerformanceDate(
                exercise.previousWorkoutNote.workoutDate,
              )}
            </p>
            <p>{exercise.previousWorkoutNote.note}</p>
          </div>
        ) : null}

        <div>
          <p>
            Last time
            {exercise.lastPerformance !== null
              ? ` · ${formatLastPerformanceDate(exercise.lastPerformance.workoutDate)}`
              : ""}
          </p>
          {exercise.lastPerformance !== null ? (
            <ul>
              {exercise.lastPerformance.sets.map((set) => (
                <li key={set.id}>
                  {formatWorkoutSetLine(
                    set,
                    exercise.lastPerformance?.measurementType,
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No completed performance yet.</p>
          )}
        </div>

        <div>
          {exercise.sets.map((set) =>
            placeholderIds.has(set.id) ? (
              <p key={set.id} role="status">
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

        <button type="button" onClick={onAddSet}>
          <Icon name="plus" size={14} /> Add Set
        </button>

        <div>
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
    <div>
      <div>
        <span aria-label={`Set ${set.position}`}>{set.position}</span>
        {loadLabel !== null ? (
          <div>
            <label htmlFor={`set-${set.id}-load`}>{loadLabel}</label>
            <input
              id={`set-${set.id}-load`}
              inputMode="decimal"
              value={loadDraft}
              autoComplete="off"
              onChange={(event) => {
                setLoadDraft(event.target.value);
                if (feedback?.kind === "error") onClearFeedback(set.id);
              }}
              onBlur={commitLoad}
            />
            <span aria-hidden="true">{loadLabel}</span>
          </div>
        ) : null}
        {fields.band !== null ? (
          <div>
            <label htmlFor={`set-${set.id}-band`}>
              {fields.band === "resistance"
                ? "Resistance band"
                : "Assistance band"}
            </label>
            <select
              id={`set-${set.id}-band`}
              value={set.bandStrength ?? ""}
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
            <Icon name="chevron-down" size={12} />
          </div>
        ) : null}
        <div>
          <label htmlFor={`set-${set.id}-reps`}>
            {exercise.measurementType === "seconds" ? "Seconds" : "Reps"}
          </label>
          <input
            id={`set-${set.id}-reps`}
            inputMode="numeric"
            value={repsDraft}
            autoComplete="off"
            onChange={(event) => {
              setRepsDraft(event.target.value);
              if (feedback?.kind === "error") onClearFeedback(set.id);
            }}
            onBlur={commitReps}
          />
          <span aria-hidden="true">
            {exercise.measurementType === "seconds" ? "Sec" : "Reps"}
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
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {feedback?.kind === "error" ? (
        <p role="alert">
          <Icon name="triangle-alert" size={14} /> {feedback.message}
        </p>
      ) : null}
      {feedback?.kind === "notice" ? (
        <p role="status">
          <Icon name="info" size={14} /> {feedback.message}
        </p>
      ) : null}
    </div>
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
