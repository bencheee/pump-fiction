"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCurrentWorkoutAction } from "@/app/actions/workouts";
import { applyCommandToWorkout } from "@/features/active-workout/domain/apply-command-to-workout";
import { describeCommandTarget } from "@/features/active-workout/domain/describe-command-target";
import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import {
  changeSetMode,
  setModeFields,
} from "@/features/active-workout/domain/set-entry";
import type {
  CurrentWorkout,
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
import type {
  Exercise,
  ExerciseLoadMode,
} from "@/features/exercises/domain/exercise";

import { ActiveWorkoutQueue } from "./active-workout-queue";

type RowFeedback = Readonly<{ kind: "error" | "notice"; message: string }>;
type FinishOutcome = "completed" | "discarded";

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

  return (
    <ActiveWorkoutQueue
      workout={workout}
      paused={paused}
      displaySeconds={displaySeconds}
      cue={cue}
      discardedChange={discardedChange}
      finishing={finishing}
      feedback={feedback}
      onDismissDiscarded={() => setDiscardedChange(null)}
      onRetry={() => void delivery.controller.flush()}
      onRefresh={() => void recoverFromConflict()}
      onTogglePause={() =>
        send(paused ? "resume_timer" : "pause_timer", {
          transitionedAt: new Date().toISOString(),
        })
      }
      onUpdateSet={updateSet}
      onChangeMode={changeMode}
      onReorder={(ids) =>
        send("reorder_exercises", { workoutExerciseIds: [...ids] })
      }
      onSetFeedback={setRowFeedback}
      onSend={send}
      onFinish={(outcome) => void finishWorkout(outcome)}
      placeholderNames={placeholderNames}
      onNamePlaceholder={(id, name) =>
        setPlaceholderNames((names) => ({ ...names, [id]: name }))
      }
      eagerExercises={exercises}
    />
  );
}
