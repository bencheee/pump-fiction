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
import { Icon, useStageAnimation, useToast } from "@/shared/ui";

import {
  flattenSets,
  nextInQueue,
} from "@/features/active-workout/ui/set-queue-presentation";

import "./delivery-cue.css";
import { baseModeOf, SetQueue } from "./set-queue";
import { WorkoutOverview } from "./workout-overview";

type RowFeedback = Readonly<{ kind: "error" | "notice"; message: string }>;

export function ActiveWorkoutExperience({
  initial,
  serverNow,
  initialView = "queue",
  initialPanel,
  exercises,
  outbox,
  transport,
}: {
  initial: CurrentWorkout;
  /** The server's clock at the moment it rendered; see the `now` state. */
  serverNow: number;
  /** Which screen the action that brought us here lands on; see `page.tsx`. */
  initialView?: "queue" | "overview";
  /** `?panel=finish`, which `/workout/current/finish` redirects to: the review
      is a panel over the queue since step 6, not a screen of its own. */
  initialPanel?: "finish";
  /** Optional eager data for isolated consumers; the routed screen loads lazily. */
  exercises?: readonly Exercise[];
  outbox?: ActiveWorkoutOutbox;
  transport?: ActiveWorkoutCommandTransport;
}) {
  const router = useRouter();
  const { showToast } = useToast();
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
  // The clock's baseline, and the one value on this screen that may not be
  // read from the device. `Date.now()` here runs twice — once in the server
  // render, once at hydration — and the two are apart by however long the HTML
  // took to arrive, so the second turns between them often enough that React
  // reports a text mismatch and pays for it by regenerating this whole tree on
  // the client. The server's own reading comes down as a prop instead, so both
  // renders format the same second, and the interval below moves to the
  // device's clock on its first tick, within a second of hydration.
  const [now, setNow] = useState(serverNow);
  const [discardedChange, setDiscardedChange] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const finishedRef = useRef<null | (() => void)>(null);
  const [placeholderNames, setPlaceholderNames] = useState<
    Readonly<Record<string, string>>
  >({});
  const recoveringRef = useRef(false);
  // The prototype keeps `screen` and the `ei`/`si` pointer on the same state
  // machine as the workout (line 1791). Starting a workout lands on the
  // overview and resuming one lands on the queue, which is what `initialView`
  // carries; from then on the two buttons move between them.
  const [view, setView] = useState<"queue" | "overview">(initialView);
  const [cursorSetId, setCursorSetId] = useState<string | null>(null);
  // `goBack` (line 3345) returns to `prevScreenName`: the queue when the
  // overview was opened from it, and Today when a start landed here.
  const [cameFromQueue, setCameFromQueue] = useState(initialView === "queue");
  // `screenAnim` (3317) for the two screens this route holds, at the depths the
  // prototype gives them on its Today page. They are the caller that knows its
  // own depth: whichever of the two the route opens on, the overview is the
  // shallower, so reaching it from the queue is a move back even on the first.
  const screenAnim = useStageAnimation(view, "today", view === "queue" ? 2 : 1);

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
    // The first tick replaces the server's baseline with the device's clock.
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.state === "saved" && placeholderIds.size > 0)
      void refreshAuthoritative();
  }, [placeholderIds.size, refreshAuthoritative, status]);

  // The terminal command has drained: the workout is over and Today is where
  // `finish()` (line 1958) leaves the prototype too.
  useEffect(() => {
    if (status.state !== "saved" || finishedRef.current === null) return;
    const announce = finishedRef.current;
    finishedRef.current = null;
    announce();
    router.replace("/today");
  }, [router, status]);

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

  /* `rowDragEnd` (line 3574): the row leaves its place and is put back in at
     the target, which is not the same as swapping the two when they are not
     neighbours. The command carries the whole order either way. */
  function moveExerciseTo(from: number, to: number) {
    if (to < 0 || to >= workout.exercises.length || to === from) return;
    const ids = workout.exercises.map((item) => item.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved!);
    send("reorder_exercises", { workoutExerciseIds: ids });
  }

  function addExercises(selectedExercises: readonly Exercise[]) {
    if (selectedExercises.length === 0) return;
    // `addPicked` (line 3480): a workout that had nothing in it lands on the
    // overview, where the new exercises are, rather than on a queue that still
    // has no set to show — `add_exercise` gives an exercise none.
    const wasEmpty = workoutRef.current.exercises.length === 0;
    for (const exercise of selectedExercises) {
      const commandId = send("add_exercise", { exerciseId: exercise.id });
      setPlaceholderNames((names) => ({
        ...names,
        [commandId]: exercise.name,
      }));
    }
    if (wasEmpty) {
      setCameFromQueue(view === "queue");
      setView("overview");
    }
    showToast(
      `${selectedExercises.length} exercise${
        selectedExercises.length === 1 ? "" : "s"
      } added to this workout.`,
    );
  }

  /*
   * `finish()` (line 1940). The prototype's is done the moment it is called;
   * here it is the workout's terminal command and Today is reached once the
   * outbox has drained, which is what `finishing` holds the screen for. The
   * toast is raised with the press, as `notify` (1957) does.
   */
  function finishWorkout(outcome: "completed" | "discarded") {
    if (finishing) return;
    const current = workoutRef.current;
    const command: ActiveWorkoutCommand = {
      commandId: newCommandId(),
      workoutId: current.id,
      expectedRevision: current.revision,
      operation: "finish_workout",
      payload: { outcome, finishedAt: new Date().toISOString() },
      clientCreatedAt: new Date().toISOString(),
    };
    const message =
      outcome === "discarded"
        ? "Workout discarded. No History record created."
        : current.sourceKind === "proposed_split"
          ? "Workout saved to History. Rotation advanced."
          : "Workout saved to History. Rotation unchanged.";
    setFinishing(true);
    adoptWorkout(applyCommandToWorkout(current, command));
    // Armed only once the controller has moved off "saved", so the effect
    // above cannot read the status it already had and leave at once. The
    // prototype notifies with the press, `finish()` being done the moment it
    // is called; here the sentence is only true once the command has drained,
    // and a toast raised earlier would cover the failure notice if it did not.
    void delivery.controller.enqueue(command).then(() => {
      finishedRef.current = () => showToast(message);
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

  /*
   * The prototype has no notion of a command that has not reached the server,
   * so neither of the two signals below has a screen of its own. The saved cue
   * stays where step 4 left it — in the accessibility tree and out of the
   * picture — and both alerts take the card the Review & finish panel draws
   * its outstanding-sets line in (line 1495): a `circle-alert` against the
   * 13.5px secondary text, on the surface fill at the card radius.
   */
  const deliveryCue = (
    <>
      <div data-queue-status="" role="status" aria-live="polite">
        {cue.message}
      </div>
      {cue.kind === "failure" || discardedChange !== null ? (
        <div data-workout-alerts="">
          {cue.kind === "failure" ? (
            <div data-workout-alert="" role="alert">
              <Icon name="circle-alert" size={15} />
              <span data-workout-alert-text="">{cue.message}</span>
              {cue.recovery === "refresh_and_replay" ? (
                <button
                  type="button"
                  data-workout-alert-action=""
                  onClick={() => void recoverFromConflict()}
                >
                  Refresh
                </button>
              ) : cue.recovery === "discard_and_replay" ? null : (
                <button
                  type="button"
                  data-workout-alert-action=""
                  onClick={() => void delivery.controller.flush()}
                >
                  Retry
                </button>
              )}
            </div>
          ) : null}
          {discardedChange !== null ? (
            <div data-workout-alert="" role="alert">
              <Icon name="circle-alert" size={15} />
              <span data-workout-alert-text="">
                One change could not be saved and was undone: {discardedChange}.
                Everything else is saved and the workout continues.
              </span>
              <button
                type="button"
                data-workout-alert-dismiss=""
                aria-label="Dismiss the undone change notice"
                onClick={() => setDiscardedChange(null)}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ) : null}
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
          screenAnim={screenAnim}
          initialExercises={exercises}
          onTogglePause={togglePause}
          onOpenOverview={() => {
            setCameFromQueue(true);
            setView("overview");
          }}
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
          initialReviewOpen={initialPanel === "finish"}
          finishing={finishing}
          onCompleteWorkout={() => finishWorkout("completed")}
          onDiscardWorkout={() => finishWorkout("discarded")}
        />
        {deliveryCue}
      </>
    );

  /*
   * Screen 3, ported in step 5. The prototype holds the overview and the set
   * queue on one page (`s.screen`) and takes the same transition between them
   * as between two routes; `useStageAnimation` is `navAll()` itself, with the
   * two depths the prototype gives them (overview 1, workout 2).
   */
  return (
    <>
      <WorkoutOverview
        workout={workout}
        flat={flat}
        current={current}
        paused={paused}
        displaySeconds={displaySeconds}
        screenAnim={screenAnim}
        placeholderIds={placeholderIds}
        placeholderNames={placeholderNames}
        initialExercises={exercises}
        onBack={() =>
          cameFromQueue ? setView("queue") : router.push("/today")
        }
        onResume={() => setView("queue")}
        onAddExercises={addExercises}
        onAddSet={(exercise) =>
          send("add_set", { workoutExerciseId: exercise.id })
        }
        onRemoveExercise={(exercise, confirmed) =>
          send("remove_exercise", {
            workoutExerciseId: exercise.id,
            confirmedPopulatedRemoval: confirmed,
          })
        }
        onMoveExercise={moveExerciseTo}
      />
      {deliveryCue}
    </>
  );
}
