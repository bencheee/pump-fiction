"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCurrentWorkoutAction } from "@/app/actions/workouts";
import { applyCommandToWorkout } from "@/features/active-workout/domain/apply-command-to-workout";
import type { ActiveWorkoutCommand } from "@/features/active-workout/domain/active-workout-command";
import type { CurrentWorkout } from "@/features/active-workout/domain/workout";
import { newCommandId } from "@/features/active-workout/client/command-id";
import { rebasePendingCommands } from "@/features/active-workout/client/rebase-pending-commands";
import { restoreActiveWorkout } from "@/features/active-workout/client/restore-active-workout";
import { isSetRecorded } from "@/features/active-workout/domain/set-entry";
import {
  ActiveWorkoutDeliveryController,
  type ActiveWorkoutSaveStatus,
} from "@/features/active-workout/client/active-workout-delivery-controller";
import type { ActiveWorkoutOutbox } from "@/features/active-workout/client/active-workout-outbox";
import { IndexedDbActiveWorkoutOutbox } from "@/features/active-workout/client/active-workout-outbox";
import type { ActiveWorkoutCommandTransport } from "@/features/active-workout/client/active-workout-command-transport";
import { FetchActiveWorkoutCommandTransport } from "@/features/active-workout/client/active-workout-command-transport";
import {
  Action,
  DestructiveDialog,
  Icon,
  StickyActionBar,
  TopBar,
} from "@/shared/ui";

import { formatWorkoutClock } from "@/features/active-workout/ui/workout-presentation";

type FinishOutcome = "completed" | "discarded";

export function FinishReview({
  initial,
  outbox,
  transport,
}: {
  initial: CurrentWorkout;
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
  const [now, setNow] = useState(() => Date.now());
  const requestedOutcomeRef = useRef<FinishOutcome | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const recoveringRef = useRef(false);

  const adoptWorkout = useCallback((next: CurrentWorkout) => {
    workoutRef.current = next;
    setWorkoutState(next);
  }, []);

  useEffect(() => {
    const unsubscribe = delivery.controller.subscribe(setStatus);
    void restoreActiveWorkout(
      initial.id,
      delivery.outbox,
      () => Promise.resolve(initial),
      applyCommandToWorkout,
    ).then(({ optimistic, pendingCommands }) => {
      if (pendingCommands.length > 0) adoptWorkout(optimistic);
      void delivery.controller.flush();
    });
    return unsubscribe;
  }, [adoptWorkout, delivery, initial]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.state === "saved" && requestedOutcomeRef.current !== null)
      router.replace("/today");
  }, [router, status]);

  function finish(outcome: FinishOutcome) {
    const current = workoutRef.current;
    const command: ActiveWorkoutCommand = {
      commandId: newCommandId(),
      workoutId: current.id,
      expectedRevision: current.revision,
      operation: "finish_workout",
      payload: { outcome, finishedAt: new Date().toISOString() },
      clientCreatedAt: new Date().toISOString(),
    };
    requestedOutcomeRef.current = outcome;
    setSubmitting(true);
    adoptWorkout(applyCommandToWorkout(current, command));
    void delivery.controller.enqueue(command);
  }

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
    } finally {
      recoveringRef.current = false;
    }
    void delivery.controller.flush();
  }, [adoptWorkout, delivery, initial.id, router]);

  const paused = workout.status === "paused";
  const activeSegmentSeconds =
    !paused && workout.activeSegmentStartedAt !== null
      ? Math.max(0, (now - Date.parse(workout.activeSegmentStartedAt)) / 1000)
      : 0;
  const displaySeconds =
    workout.accumulatedActiveSeconds + activeSegmentSeconds;

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

  const sourceLine = isOneTime
    ? "One-time workout · no split"
    : workout.sourceKind === "proposed_split"
      ? "Proposed split · active rotation"
      : "Alternate split · rotation unchanged";

  const failure = status.state === "save_failed" ? status : null;

  return (
    <div>
      <TopBar
        title="Review & Finish"
        backHref="/workout/current"
        backLabel="Back to active workout"
      />
      <main>
        <div>
          <h2>{workout.name}</h2>
          <p>{sourceLine}</p>
        </div>

        <dl>
          <ReviewRow label="Active duration">
            <span>{formatWorkoutClock(displaySeconds)}</span>
          </ReviewRow>
          <ReviewRow label="Exercises">
            <span>{workout.exercises.length}</span>
          </ReviewRow>
          <ReviewRow label="Recorded sets">
            <span>{recordedSets}</span>
          </ReviewRow>
          {!isOneTime ? (
            <ReviewRow label="Sets left without values">
              <span>{plannedWithoutValues.length}</span>
            </ReviewRow>
          ) : null}
        </dl>

        {!isOneTime && plannedWithoutValues.length > 0 ? (
          <div>
            <p>
              <Icon name="triangle-alert" size={14} />
              Planned but left without values. These are not saved as
              performances:
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
            No planned-set metric: this workout has no prescription, so its set
            rows are workout-local rather than planned.
          </p>
        ) : null}

        <section>
          <h3>What completing does</h3>
          <ul>
            <li>
              Recorded sets count toward exercise personal records and charts.
            </li>
            {isOneTime ? (
              <li>
                This workout has no split, so split statistics and rotation are
                unchanged.
              </li>
            ) : (
              <li>
                This workout counts toward {workout.name} duration statistics.
              </li>
            )}
            {workout.sourceKind === "proposed_split" ? (
              <li>
                Rotation advances to the next split, because this was the
                proposed split.
              </li>
            ) : null}
            {workout.sourceKind === "alternate_split" ? (
              <li>
                Rotation does not advance, because this was a today-only
                alternate split.
              </li>
            ) : null}
          </ul>
        </section>
      </main>

      <StickyActionBar role="group" aria-label="Finish actions">
        <div role="status" aria-live="polite">
          <Icon
            name={
              failure !== null
                ? "circle-x"
                : status.state === "saving"
                  ? "loader-circle"
                  : "circle-check"
            }
            size={14}
          />
          <span>
            {failure !== null ? (
              <>
                {failure.message}
                <span>
                  {failure.recovery.kind === "discard_and_replay"
                    ? "That attempt was discarded. Your review is unchanged, so you can finish again."
                    : "Nothing was recorded. Your review is unchanged."}
                </span>
              </>
            ) : status.state === "saving" ? (
              "Saving…"
            ) : (
              "All changes saved"
            )}
          </span>
          {failure !== null ? (
            failure.recovery.kind === "refresh_and_replay" ? (
              <button type="button" onClick={() => void recoverFromConflict()}>
                Refresh
              </button>
            ) : failure.recovery.kind === "discard_and_replay" ? null : (
              <button
                type="button"
                onClick={() => void delivery.controller.flush()}
              >
                Retry
              </button>
            )
          ) : null}
        </div>
        <Action disabled={submitting} onClick={() => finish("completed")}>
          {submitting ? "Finishing…" : "Complete Workout"}
        </Action>
        <Link href="/workout/current">Continue Workout</Link>
        <DestructiveDialog
          trigger={
            <Action variant="danger" disabled={submitting}>
              Discard Workout
            </Action>
          }
          title="Discard this workout?"
          description="Its entered sets and notes are lost, no History record is created, and rotation is unchanged."
          confirmLabel="Discard Workout"
          onConfirm={() => finish("discarded")}
        />
      </StickyActionBar>
    </div>
  );
}

function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
