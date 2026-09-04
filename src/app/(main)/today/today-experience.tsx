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
import { Action, Badge, Icon, PageFrame, Sheet } from "@/shared/ui";

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
    <PageFrame title="Today" className="gap-5">
      <div className="absolute top-[calc(env(safe-area-inset-top)+13px)] right-[var(--pf-gutter)] text-[13px] font-medium text-[var(--pf-text-3-deep)]">
        {formatLocalDate(today.localDate)}
      </div>

      {current ? <RestoreCard current={current} /> : null}

      {selectedSplit ? (
        <section className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
              {selectedSplit.splitId === today.proposedSplit?.splitId
                ? "Next in your program"
                : "Today-only split"}
            </p>
            {selectedSplit.splitId !== today.proposedSplit?.splitId ? (
              <Badge tone="accent">Rotation unchanged</Badge>
            ) : null}
          </div>
          <h2 className="mt-3 text-[21px] leading-[1.18] font-semibold [overflow-wrap:anywhere]">
            {selectedSplit.splitName}
          </h2>
          <SplitHistory split={selectedSplit} />
          {current ? (
            <p className="mt-4 text-[13px] leading-[1.45] text-[var(--pf-text-3-deep)]">
              Finish or discard the restored workout before starting another.
            </p>
          ) : (
            <Action
              className="mt-5 w-full"
              disabled={pending}
              onClick={() => startSplit(selectedSplit)}
            >
              {pending ? "Starting…" : "Start Workout"}
            </Action>
          )}
        </section>
      ) : (
        <section className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-5">
          <h2 className="text-[18px] font-semibold">No proposed workout</h2>
          <p className="mt-2 text-[var(--pf-text-2)]">
            Create or activate a program to get a proposed workout.
          </p>
          <Link
            href="/programs"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 font-semibold"
          >
            Go to Programs
          </Link>
        </section>
      )}

      {!current ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
          {allSplits.length > 1 ? (
            <span aria-hidden="true" className="text-[var(--pf-text-3-deep)]">
              ·
            </span>
          ) : null}
          <Link
            href="/today/one-time"
            className="flex min-h-11 items-center border-b border-[var(--pf-border-control)] font-medium text-[var(--pf-text-2)]"
          >
            One-time workout
          </Link>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--pf-r2)] border border-[var(--pf-danger)] p-3 text-[13px] text-[var(--pf-danger)]"
        >
          <p>{error}</p>
          {retryDefinition ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void start(retryDefinition)}
              className="mt-2 min-h-11 rounded-[var(--pf-r-pill)] border border-[var(--pf-danger)] px-3 font-semibold"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 border-t border-[var(--pf-border)] pt-4 text-[12.5px] leading-[1.5] text-[var(--pf-text-3-deep)]">
        Rotation position: {today.proposedSplit?.splitName ?? "No active split"}
        . One-time workouts and today-only alternates never advance it.
      </p>
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
      className="rounded-[var(--pf-r3)] border-l-[3px] border-[var(--pf-accent)] bg-[var(--pf-accent-dim)] p-4"
    >
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-accent-strong)] uppercase">
        <Icon name="rotate-ccw" size={18} /> Restored workout
      </p>
      <h2 className="mt-4 text-[21px] leading-[1.18] font-semibold [overflow-wrap:anywhere]">
        {current.name}
      </h2>
      <p className="pf-numeric mt-2 flex items-center gap-2 text-[var(--pf-text-2)]">
        <Icon name={current.status === "active" ? "play" : "pause"} size={16} />
        {current.status === "active" ? "Running" : "Paused"} ·{" "}
        {formatClock(current.accumulatedActiveSeconds + segmentSeconds)}
      </p>
      <Link
        href="/workout/current"
        className="mt-5 flex min-h-[var(--pf-size-primary-action)] w-full items-center justify-center rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 font-semibold text-[var(--pf-on-accent)]"
      >
        Return to Workout
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
      trigger={
        <button
          type="button"
          className="flex min-h-11 items-center border-b border-[var(--pf-border-control)] font-medium text-[var(--pf-text-2)]"
        >
          Choose another split
        </button>
      }
    >
      {(close) => (
        <div className="space-y-3">
          {setNextError ? (
            <p role="alert" className="text-[13px] text-[var(--pf-danger)]">
              {setNextError}
            </p>
          ) : null}
          {splits.map((split) => {
            const proposed = split.splitId === proposedSplitId;
            return (
              <section
                key={split.splitId}
                className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[16.5px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
                    {split.splitName}
                  </h3>
                  {proposed ? <Badge tone="accent">Proposed</Badge> : null}
                </div>
                <SplitHistory split={split} />
                <Action
                  className="mt-4 w-full"
                  disabled={pending || Boolean(settingNext)}
                  onClick={() => onStart(split)}
                >
                  {proposed ? "Start Proposed Split" : "Train This Today"}
                </Action>
                <Action
                  variant="secondary"
                  className="mt-2 w-full"
                  disabled={pending || Boolean(settingNext)}
                  onClick={() => {
                    onSelect(split);
                    close();
                  }}
                >
                  Put on Today, don&apos;t start yet
                </Action>
                {proposed ? (
                  <Action variant="tertiary" className="mt-2 w-full" disabled>
                    Already next in rotation
                  </Action>
                ) : (
                  <Action
                    variant="tertiary"
                    className="mt-2 w-full"
                    disabled={pending || Boolean(settingNext)}
                    onClick={() => void setNext(split, close)}
                  >
                    {settingNext === split.splitId ? "Setting…" : "Set as Next"}
                  </Action>
                )}
              </section>
            );
          })}
          <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-3-deep)]">
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
    <p className="pf-numeric mt-3 text-[13px] text-[var(--pf-text-2)]">
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
