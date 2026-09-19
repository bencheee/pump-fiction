"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { startWorkoutAction } from "@/app/actions/workouts";
import type {
  StartWorkoutDefinition,
  TodaySplit,
  TodayView,
} from "@/features/active-workout/domain/workout";
import {
  BlockingProgress,
  Icon,
  Kicker,
  Overlay,
  PageFrame,
} from "@/shared/ui";

export function TodayExperience({ today }: { today: TodayView }) {
  const router = useRouter();
  const [selectedSplit, setSelectedSplit] = useState(today.proposedSplit);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [retryDefinition, setRetryDefinition] =
    useState<StartWorkoutDefinition>();
  const current = today.currentWorkout;
  const allSplits = useMemo(
    () =>
      today.proposedSplit
        ? [today.proposedSplit, ...today.alternateSplits]
        : today.alternateSplits,
    [today.alternateSplits, today.proposedSplit],
  );

  async function start(definition: StartWorkoutDefinition) {
    setPending(true);
    setError(undefined);
    const result = await startWorkoutAction(definition);
    if (!result.ok) {
      setError(result.error.message);
      setRetryDefinition(result.error.retryable ? definition : undefined);
      setPending(false);
      return;
    }
    router.push("/workout/current");
  }

  function startSplit(split: TodaySplit) {
    const sourceKind =
      split.splitId === today.proposedSplit?.splitId
        ? "proposed_split"
        : "alternate_split";
    void start({
      sourceKind,
      splitId: split.splitId,
      startedAt: new Date().toISOString(),
    });
  }

  return (
    <PageFrame
      title="Today"
      titleSuffix={
        <span
          aria-hidden="true"
          className="ml-[3px] inline-block h-6 w-0.5 -translate-y-[3px] bg-[var(--pf-accent)] align-baseline motion-safe:animate-[pf-caret_900ms_steps(1,end)_infinite]"
        />
      }
      action={
        <span className="shrink-0 rounded-full bg-[var(--pf-bg-surface)] px-3 py-[7px] text-[13px] font-medium text-[var(--pf-text-3)]">
          {formatLocalDate(today.localDate)}
        </span>
      }
    >
      {current ? <RestoreCard current={current} /> : null}

      {selectedSplit ? (
        <section className="rounded-[var(--pf-r5)] bg-[var(--pf-accent)] p-[22px] text-[var(--pf-on-accent)]">
          <p className="text-[11.5px] font-bold tracking-[0.14em] uppercase opacity-[0.72]">
            {selectedSplit.splitId === today.proposedSplit?.splitId
              ? "Next in your program"
              : "Today-only split"}
          </p>
          <h2 className="mt-3.5 text-[25px] leading-[1.14] font-bold tracking-[-0.01em] [text-wrap:pretty]">
            {selectedSplit.splitName}
          </h2>
          <SplitStats split={selectedSplit} inverted />
          {current ? (
            <p className="mt-4 text-[13.5px] leading-[1.45] font-semibold opacity-[0.78]">
              Finish or discard the restored workout before starting another.
            </p>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => startSplit(selectedSplit)}
              className="mt-5 flex h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-[var(--pf-on-accent)] text-[17px] font-semibold text-[var(--pf-accent)] disabled:opacity-[var(--pf-opacity-disabled)]"
            >
              <Icon name="play" size={18} />
              {pending ? "Starting…" : "Start today's workout"}
            </button>
          )}
        </section>
      ) : (
        <section className="rounded-[var(--pf-r5)] bg-[var(--pf-bg-surface)] px-5 py-[22px]">
          <h2 className="text-[18px] font-semibold">No proposed workout</h2>
          <p className="mt-2 text-[13.5px] leading-[1.5] text-[var(--pf-text-3)]">
            Create or activate a program to get a proposed workout.
          </p>
          <Link
            href="/programs"
            className="mt-5 flex min-h-[54px] w-full items-center justify-center rounded-full bg-[var(--pf-accent-dim)] text-[15px] font-semibold text-[var(--pf-accent)]"
          >
            Go to Programs
          </Link>
        </section>
      )}

      {selectedSplit ? (
        <section className="rounded-[var(--pf-r5)] bg-[var(--pf-bg-surface)] px-5 py-4.5">
          <p className="text-[12px] font-semibold tracking-[0.04em] text-[var(--pf-text-3)]">
            Exercises
          </p>
          <ol className="mt-3 flex flex-col gap-2.5">
            {selectedSplit.exercises.map((exercise) => (
              <li
                key={exercise.exerciseId}
                className="flex items-baseline gap-3"
              >
                <span className="min-w-0 flex-1 text-[14.5px] [text-wrap:pretty]">
                  {exercise.exerciseName}
                </span>
                <span className="pf-numeric shrink-0 text-[14px] text-[var(--pf-text-3)]">
                  {exercise.plannedSets} × {exercise.minReps}–{exercise.maxReps}
                  {exercise.measurementType === "seconds" ? " sec" : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {!current ? (
        <div className="flex gap-2.5">
          {allSplits.length > 1 ? (
            <AlternateSplitOverlay
              splits={allSplits}
              selectedSplitId={selectedSplit?.splitId}
              pending={pending}
              onStart={startSplit}
              onSelect={setSelectedSplit}
            />
          ) : null}
          <Link
            href="/today/one-time"
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--pf-border)] text-[14.5px] font-medium text-[var(--pf-text-2)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-border-strong)]"
          >
            One-time workout
          </Link>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--pf-r3)] border border-[var(--pf-danger)] p-3.5 text-[13px] text-[var(--pf-danger)]"
        >
          <p>{error}</p>
          {retryDefinition ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void start(retryDefinition)}
              className="mt-2 min-h-11 rounded-full border border-[var(--pf-danger)] px-3.5 font-semibold"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="mt-1 text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
        Rotation position: {today.proposedSplit?.splitName ?? "No active split"}
        . One-time workouts and today-only alternates never advance it.
      </p>
      {pending ? <BlockingProgress label="Starting workout…" /> : null}
    </PageFrame>
  );
}

function RestoreCard({
  current,
}: {
  current: NonNullable<TodayView["currentWorkout"]>;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (current.status !== "active") return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [current.status]);
  const segmentSeconds =
    current.status === "active" && current.activeSegmentStartedAt
      ? Math.max(
          0,
          Math.floor((now - Date.parse(current.activeSegmentStartedAt)) / 1000),
        )
      : 0;

  return (
    <section
      aria-label="Restored workout"
      className="rounded-[var(--pf-r5)] bg-[var(--pf-accent-dim)] p-5 motion-safe:animate-[pf-rise_220ms_var(--pf-ease)]"
    >
      <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.04em] text-[var(--pf-accent)]">
        <Icon name="rotate-ccw" size={16} /> Restored workout
      </p>
      <h2 className="mt-3.5 text-[22px] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
        {current.name}
      </h2>
      <p className="pf-numeric mt-2.5 text-[16px] text-[var(--pf-accent-soft)]">
        {current.status === "active" ? "Running" : "Paused"} ·{" "}
        {formatClock(current.accumulatedActiveSeconds + segmentSeconds)}
      </p>
      <Link
        href="/workout/current"
        className="mt-4.5 flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent)] text-[16.5px] font-semibold text-[var(--pf-on-accent)]"
      >
        <Icon name="play" size={18} />
        Resume workout
      </Link>
    </section>
  );
}

function AlternateSplitOverlay({
  splits,
  selectedSplitId,
  pending,
  onStart,
  onSelect,
}: {
  splits: readonly TodaySplit[];
  selectedSplitId?: string;
  pending: boolean;
  onStart: (split: TodaySplit) => void;
  onSelect: (split: TodaySplit) => void;
}) {
  return (
    <Overlay
      title="Choose another split"
      description="Pick a split to train today. This does not change your rotation."
      trigger={
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--pf-border)] text-[14.5px] font-medium text-[var(--pf-text-2)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-border-strong)]"
        >
          Another split
        </button>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-2.5">
          {splits.map((split) => (
            <div
              key={split.splitId}
              className={
                split.splitId === selectedSplitId
                  ? "rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-accent-dim)] p-[18px]"
                  : "rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-[18px]"
              }
            >
              <p className="text-[17px] leading-[1.22] font-semibold [text-wrap:pretty]">
                {split.splitName}
              </p>
              <SplitStats split={split} />
              <div className="mt-3.5 flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onStart(split)}
                  className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--pf-accent)] text-[15.5px] font-semibold text-[var(--pf-on-accent)] disabled:opacity-[var(--pf-opacity-disabled)]"
                >
                  <Icon name="play" size={17} />
                  Train today
                </button>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Put ${split.splitName} on Today without starting it`}
                  onClick={() => {
                    onSelect(split);
                    close();
                  }}
                  className="flex h-13 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--pf-border)] text-[var(--pf-text-2)] disabled:opacity-[var(--pf-opacity-disabled)]"
                >
                  <Icon name="calendar-check" size={17} />
                </button>
              </div>
            </div>
          ))}
          <Kicker className="mt-1.5 normal-case">
            Set as Next lives in Programs; it is the only action that moves the
            rotation pointer.
          </Kicker>
        </div>
      )}
    </Overlay>
  );
}

function SplitStats({
  split,
  inverted,
}: {
  split: TodaySplit;
  inverted?: boolean;
}) {
  if (split.averageDurationSeconds === null) return null;
  return (
    <p
      className={
        inverted
          ? "pf-numeric mt-3 text-[16px] font-semibold opacity-[0.82]"
          : "pf-numeric mt-2 text-[14.5px] text-[var(--pf-text-3)]"
      }
    >
      Avg {formatDuration(split.averageDurationSeconds)} ·{" "}
      {split.completedWorkoutCount}{" "}
      {split.completedWorkoutCount === 1 ? "workout" : "workouts"}
    </p>
  );
}

function formatLocalDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T00:00:00Z`))
    .replace(",", "");
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0
    ? `${hours}h ${String(remainder).padStart(2, "0")}m`
    : `${minutes}m`;
}

function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainder = whole % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}
