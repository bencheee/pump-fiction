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
import { Action, BlockingProgress, Icon, PageFrame } from "@/shared/ui";

import { ChooseSplitPanel } from "./choose-split";
import { splitStatsText } from "./split-stats";
import "./today.css";

export function TodayExperience({ today }: { today: TodayView }) {
  const router = useRouter();
  const [selectedSplit, setSelectedSplit] = useState(today.proposedSplit);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [retryDefinition, setRetryDefinition] =
    useState<StartWorkoutDefinition>();
  const current = today.currentWorkout;
  // The prototype's `splitOptions` is `SPLITS` itself — the program's splits in
  // the program's own order, with the one on Today tinted rather than moved to
  // the front. `position` is that order here.
  const allSplits = useMemo(
    () =>
      (today.proposedSplit
        ? [today.proposedSplit, ...today.alternateSplits]
        : today.alternateSplits
      )
        .slice()
        .sort((a, b) => a.position - b.position),
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
    // `startSplit` (line 3301) and `startOneTime` (3326) both land on the
    // prototype's overview; only the restored-workout card below goes straight
    // to the set queue.
    router.push("/workout/current?view=overview");
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
            <ChooseSplitPanel
              splits={allSplits}
              selectedSplitId={selectedSplit?.splitId}
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

// `splitStats`, the line the Choose split panel writes on every card and Today
// writes on the one it is showing. The text is the same on both; only its type
// differs, so the two share the sentence and not the element.
function SplitStats({ split }: { split: TodaySplit }) {
  const stats = splitStatsText(split);
  if (stats === null) return null;
  return <p data-today-split-meta="">{stats}</p>;
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

function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainder = whole % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}
