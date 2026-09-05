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

import { formatWorkoutClock } from "../workout-format";

type FinishOutcome = "completed" | "incomplete" | "discarded";

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
  const confirmedSets = workout.exercises.reduce(
    (total, exercise) =>
      total + exercise.sets.filter((set) => set.isConfirmed).length,
    0,
  );
  const emptyPlanned = workout.exercises.flatMap((exercise) =>
    exercise.plannedSets === null
      ? []
      : exercise.sets
          .filter(
            (set) =>
              set.position <= (exercise.plannedSets ?? 0) && !set.isConfirmed,
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
    <div className="flex min-h-full flex-col">
      <TopBar
        title="Review & Finish"
        backHref="/workout/current"
        backLabel="Back to active workout"
      />
      <main className="flex flex-1 flex-col gap-5 px-[var(--pf-gutter)] pt-5">
        <div>
          <h2 className="text-[24px] leading-[1.15] font-semibold [overflow-wrap:anywhere]">
            {workout.name}
          </h2>
          <p className="mt-2 text-[13px] text-[var(--pf-text-2)]">
            {sourceLine}
          </p>
        </div>

        <dl className="divide-y divide-[var(--pf-border)] rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)]">
          <ReviewRow label="Active duration">
            <span className="pf-numeric text-[21px] font-semibold">
              {formatWorkoutClock(displaySeconds)}
            </span>
          </ReviewRow>
          <ReviewRow label="Exercises">
            <span className="pf-numeric text-[21px] font-semibold">
              {workout.exercises.length}
            </span>
          </ReviewRow>
          <ReviewRow label="Confirmed sets">
            <span className="pf-numeric text-[21px] font-semibold text-[var(--pf-ok)]">
              {confirmedSets}
            </span>
          </ReviewRow>
          {!isOneTime ? (
            <ReviewRow label="Empty planned sets">
              <span
                className={`pf-numeric text-[21px] font-semibold ${emptyPlanned.length > 0 ? "text-[var(--pf-warn)]" : ""}`}
              >
                {emptyPlanned.length}
              </span>
            </ReviewRow>
          ) : null}
        </dl>

        {!isOneTime && emptyPlanned.length > 0 ? (
          <div className="text-[13px] leading-[1.5] text-[var(--pf-warn)]">
            <p className="flex items-start gap-2">
              <Icon name="triangle-alert" size={14} className="mt-0.5" />
              Planned but unconfirmed. These are not saved as performances:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-9">
              {emptyPlanned.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {isOneTime ? (
          <p className="text-[13px] leading-[1.5] text-[var(--pf-text-3-deep)]">
            No planned-set metric: this workout has no prescription, so its set
            rows are workout-local rather than planned.
          </p>
        ) : null}

        <section className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4">
          <h3 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            What completing does
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-[1.5] text-[var(--pf-text-2)]">
            <li>
              Confirmed sets count toward exercise personal records and charts.
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

      <StickyActionBar
        role="group"
        aria-label="Finish actions"
        className="z-10"
      >
        <div
          role="status"
          aria-live="polite"
          className={`flex min-h-11 items-center gap-2 text-[13px] font-medium ${
            failure !== null
              ? "text-[var(--pf-danger)]"
              : status.state === "saving"
                ? "text-[var(--pf-text-2)]"
                : "text-[var(--pf-ok)]"
          }`}
        >
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
          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
            {failure !== null ? (
              <>
                {failure.message}
                <span className="block text-[var(--pf-text-2)]">
                  Nothing was recorded. Your review is unchanged.
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
              <button
                type="button"
                onClick={() => void recoverFromConflict()}
                className="min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-danger)] px-3 font-semibold"
              >
                Refresh
              </button>
            ) : (
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
        <Action
          className="w-full"
          disabled={submitting}
          onClick={() => finish("completed")}
        >
          {submitting ? "Finishing…" : "Complete Workout"}
        </Action>
        <Action
          variant="secondary"
          className="w-full"
          disabled={submitting}
          onClick={() => finish("incomplete")}
        >
          Save as Incomplete
        </Action>
        <Link
          href="/workout/current"
          className="flex min-h-11 w-full items-center justify-center font-semibold text-[var(--pf-accent-strong)]"
        >
          Continue Workout
        </Link>
        <DestructiveDialog
          trigger={
            <Action variant="danger" className="w-full" disabled={submitting}>
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
    <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
      <dt className="text-[14px] text-[var(--pf-text-2)]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
