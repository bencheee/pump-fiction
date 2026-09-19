"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { setNextSplitAction } from "@/app/actions/programs";
import { startWorkoutAction } from "@/app/actions/workouts";
import type {
  StartWorkoutDefinition,
  TodaySplit,
  TodayView,
} from "@/features/active-workout/domain/workout";
import {
  Action,
  Badge,
  BlockingProgress,
  Icon,
  PageFrame,
  Sheet,
} from "@/shared/ui";

import type { TodayMeasurements } from "@/features/history/domain/body";

import { TodayMeasurementsCard } from "./today-measurements";
import { TodayWeightCard, type TodayWeight } from "./today-weight";

export function TodayExperience({
  today,
  weight,
  measurements,
}: {
  today: TodayView;
  /** Null only when the weigh-in could not be read; Today still works. */
  weight: TodayWeight | null;
  measurements: TodayMeasurements | null;
}) {
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
    <PageFrame title="Today">
      <div>{formatLocalDate(today.localDate)}</div>

      {current ? <RestoreCard current={current} /> : null}

      {selectedSplit ? (
        <section>
          <div>
            <p>
              {selectedSplit.splitId === today.proposedSplit?.splitId
                ? "Next in your program"
                : "Today-only split"}
            </p>
            {selectedSplit.splitId !== today.proposedSplit?.splitId ? (
              <Badge tone="accent">Rotation unchanged</Badge>
            ) : null}
          </div>
          <h2>{selectedSplit.splitName}</h2>
          <SplitHistory split={selectedSplit} />
          {current ? (
            <p>
              Finish or discard the restored workout before starting another.
            </p>
          ) : (
            <Action
              disabled={pending}
              onClick={() => startSplit(selectedSplit)}
            >
              {pending ? "Starting…" : "Start Workout"}
            </Action>
          )}
          <SplitExercisePreview exercises={selectedSplit.exercises} />
        </section>
      ) : (
        <section>
          <h2>No proposed workout</h2>
          <p>Create or activate a program to get a proposed workout.</p>
          <Link href="/programs">Go to Programs</Link>
        </section>
      )}

      {!current ? (
        <div>
          {allSplits.length > 1 ? (
            <AlternateSplitSheet
              splits={allSplits}
              proposedSplitId={today.proposedSplit?.splitId}
              rotationNextName={today.proposedSplit?.splitName}
              pending={pending}
              onStart={startSplit}
              onSelect={setSelectedSplit}
            />
          ) : null}
          {allSplits.length > 1 ? <span aria-hidden="true">·</span> : null}
          <Link href="/today/one-time">One-time workout</Link>
        </div>
      ) : null}

      {weight ? <TodayWeightCard weight={weight} /> : null}
      {measurements ? (
        <TodayMeasurementsCard measurements={measurements} />
      ) : null}

      {error ? (
        <div role="alert">
          <p>{error}</p>
          {retryDefinition ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void start(retryDefinition)}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <p>
        Rotation position: {today.proposedSplit?.splitName ?? "No active split"}
        . One-time workouts and today-only alternates never advance it.
      </p>
      {pending ? <BlockingProgress label="Starting workout…" /> : null}
    </PageFrame>
  );
}

function SplitExercisePreview({
  exercises,
}: {
  exercises: TodaySplit["exercises"];
}) {
  return (
    <div>
      <p>Exercises</p>
      <ol>
        {exercises.map((exercise) => (
          <li key={exercise.exerciseId}>
            <span>{exercise.exerciseName}</span>
            <span>
              {exercise.plannedSets} × {exercise.minReps}–{exercise.maxReps}
              {exercise.measurementType === "seconds" ? " sec" : " reps"}
            </span>
          </li>
        ))}
      </ol>
    </div>
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
    <section aria-label="Restored workout">
      <p>
        <Icon name="rotate-ccw" size={18} /> Restored workout
      </p>
      <h2>{current.name}</h2>
      <p>
        <Icon name={current.status === "active" ? "play" : "pause"} size={16} />
        {current.status === "active" ? "Running" : "Paused"} ·{" "}
        {formatClock(current.accumulatedActiveSeconds + segmentSeconds)}
      </p>
      <Link href="/workout/current">Resume Workout</Link>
    </section>
  );
}

function AlternateSplitSheet({
  splits,
  proposedSplitId,
  rotationNextName,
  pending,
  onStart,
  onSelect,
}: {
  splits: readonly TodaySplit[];
  proposedSplitId?: string;
  rotationNextName?: string;
  pending: boolean;
  onStart: (split: TodaySplit) => void;
  onSelect: (split: TodaySplit) => void;
}) {
  const router = useRouter();
  const [setNextError, setSetNextError] = useState<string>();
  const [settingNext, setSettingNext] = useState<string>();

  async function setNext(split: TodaySplit, close: () => void) {
    setSettingNext(split.splitId);
    setSetNextError(undefined);
    const result = await setNextSplitAction(split.programId, split.splitId);
    if (!result.ok) {
      setSetNextError(result.error.message);
      setSettingNext(undefined);
      return;
    }
    onSelect(split);
    close();
    router.refresh();
  }

  return (
    <Sheet
      title="Choose Another Split"
      description={`Pick a split to train today. This does not change your rotation${rotationNextName ? ` — ${rotationNextName} stays next.` : "."}`}
      trigger={<button type="button">Choose another split</button>}
    >
      {(close) => (
        <div>
          {setNextError ? <p role="alert">{setNextError}</p> : null}
          {splits.map((split) => {
            const proposed = split.splitId === proposedSplitId;
            return (
              <section key={split.splitId}>
                <div>
                  <h3>{split.splitName}</h3>
                  {proposed ? <Badge tone="accent">Proposed</Badge> : null}
                </div>
                <SplitHistory split={split} />
                <Action
                  disabled={pending || Boolean(settingNext)}
                  onClick={() => onStart(split)}
                >
                  {proposed ? "Start Proposed Split" : "Train This Today"}
                </Action>
                <Action
                  variant="secondary"
                  disabled={pending || Boolean(settingNext)}
                  onClick={() => {
                    onSelect(split);
                    close();
                  }}
                >
                  Put on Today, don&apos;t start yet
                </Action>
                {proposed ? (
                  <Action variant="tertiary" disabled>
                    Already next in rotation
                  </Action>
                ) : (
                  <Action
                    variant="tertiary"
                    disabled={pending || Boolean(settingNext)}
                    onClick={() => void setNext(split, close)}
                  >
                    {settingNext === split.splitId ? "Setting…" : "Set as Next"}
                  </Action>
                )}
              </section>
            );
          })}
          <p>
            Two different actions: Train this today affects one workout and
            leaves rotation alone. Set as next persistently moves the rotation
            pointer.
          </p>
        </div>
      )}
    </Sheet>
  );
}

function SplitHistory({ split }: { split: TodaySplit }) {
  if (split.averageDurationSeconds === null) return null;
  return (
    <p>
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
