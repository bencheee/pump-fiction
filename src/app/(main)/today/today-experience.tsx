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

import "./today.css";

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
      screen="today"
      title={<Greeting />}
      trailing={
        <span data-today-date="">{formatLocalDate(today.localDate)}</span>
      }
    >
      {current ? <RestoreCard current={current} /> : null}

      {selectedSplit ? (
        <>
          <section data-today-split="">
            <p data-today-kicker="">
              {selectedSplit.splitId === today.proposedSplit?.splitId
                ? "Next in your program"
                : "Today-only split"}
            </p>
            <h2>{selectedSplit.splitName}</h2>
            <SplitStats split={selectedSplit} />
            {current ? (
              <p data-today-blocked="">
                Finish or discard the restored workout before starting another.
              </p>
            ) : (
              <Action
                variant="on-accent"
                data-today-start=""
                aria-label="Start today's workout"
                disabled={pending}
                onClick={() => startSplit(selectedSplit)}
              >
                <Icon name="play" size={18} />
                {pending ? "Starting…" : "Start today's workout"}
              </Action>
            )}
          </section>

          <section data-today-exercises="">
            <p>Exercises</p>
            <ol>
              {selectedSplit.exercises.map((exercise) => (
                <li key={exercise.exerciseId}>
                  <span data-today-exercise-name="">
                    {exercise.exerciseName}
                  </span>
                  <span data-today-exercise-scheme="">
                    {exercise.plannedSets} × {exercise.minReps}–
                    {exercise.maxReps}
                    {exercise.measurementType === "seconds" ? " sec" : ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : (
        <section data-today-empty="">
          <h2>No proposed workout</h2>
          <p>Create or activate a program to get a proposed workout.</p>
          <Link href="/programs" data-today-text-action="">
            <Icon name="layout-grid" size={15} />
            Go to Programs
          </Link>
        </section>
      )}

      {!current ? (
        <div data-today-choices="">
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
          <Link href="/today/one-time" data-variant="secondary">
            One-time workout
          </Link>
        </div>
      ) : null}

      {error ? (
        <div data-today-error="" role="alert">
          <p>{error}</p>
          {retryDefinition ? (
            <button
              type="button"
              data-today-text-action=""
              disabled={pending}
              onClick={() => void start(retryDefinition)}
            >
              <Icon name="rotate-ccw" size={15} />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <p data-today-rotation="">
        Rotation position: {today.proposedSplit?.splitName ?? "No active split"}
        . One-time workouts and today-only alternates never advance it.
      </p>
      {pending ? <BlockingProgress label="Starting workout…" /> : null}
    </PageFrame>
  );
}

// `componentDidMount` (line 1812) types `Hello Sandro!` into the title one
// character every 85ms and leaves it there; the caret beside it is CSS and
// blinks from the first frame, before and after the typing.
const greeting = "Hello Sandro!";

function Greeting() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (typed.length >= greeting.length) return;
    const timer = window.setTimeout(
      () => setTyped(greeting.slice(0, typed.length + 1)),
      85,
    );
    return () => window.clearTimeout(timer);
  }, [typed]);

  return (
    <>
      {typed}
      <span data-today-caret="" aria-hidden="true" />
    </>
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
    <section data-today-restore="" aria-label="Restored workout">
      <p data-today-eyebrow="">
        <Icon name="rotate-ccw" size={16} />
        Restored workout
      </p>
      <h2>{current.name}</h2>
      <p data-today-restore-meta="">
        {current.status === "active" ? "Running" : "Paused"} ·{" "}
        {formatClock(current.accumulatedActiveSeconds + segmentSeconds)}
      </p>
      <Link
        href="/workout/current"
        data-today-resume=""
        aria-label="Resume workout"
      >
        <Icon name="play" size={18} />
        Resume workout
      </Link>
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
      trigger={<Action variant="secondary">Another split</Action>}
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
                <SplitStats split={split} />
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

// `splitStats` is the split's own line in the prototype (`SPLITS[].meta`,
// line 1727): `Avg 1h 08m · 7 workouts`. A split with no completed workout has
// no average, and then the card carries no line at all.
function SplitStats({ split }: { split: TodaySplit }) {
  if (split.averageDurationSeconds === null) return null;
  return (
    <p data-today-split-meta="">
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
