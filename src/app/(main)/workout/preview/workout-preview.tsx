"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { startWorkoutAction } from "@/app/actions/workouts";
import type { TodaySplit } from "@/features/active-workout/domain/workout";
import { Action, BlockingProgress, Icon, TopBar } from "@/shared/ui";

import "../current/workout-overview.css";

export function WorkoutPreview({
  split,
  sourceKind,
}: {
  split: TodaySplit;
  sourceKind: "proposed_split" | "alternate_split";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function start() {
    if (pending) return;
    setPending(true);
    setError(undefined);
    const result = await startWorkoutAction({
      sourceKind,
      splitId: split.splitId,
      startedAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(result.error.message);
      setPending(false);
      return;
    }
    router.replace("/workout/current");
  }

  return (
    <div data-overview="">
      <TopBar
        screen="workout-overview"
        title={split.splitName}
        backLabel="Back"
        onBack={() => router.push("/today")}
        trailing={<span data-overview-clock="">00:00</span>}
      />
      <div data-overview-body="">
        <p data-overview-kicker="">
          {split.exercises.length} exercises ·{" "}
          {split.exercises.reduce(
            (count, exercise) => count + exercise.plannedSets,
            0,
          )}{" "}
          sets
        </p>
        {split.exercises.map((exercise) => (
          <section key={exercise.exerciseId} data-overview-row="">
            <span data-overview-row-text="">
              <span data-overview-row-name="">{exercise.exerciseName}</span>
              <span data-overview-row-meta="">
                {exercise.plannedSets} × {exercise.minReps}–{exercise.maxReps}
                {exercise.measurementType === "seconds" ? " sec" : ""}
              </span>
            </span>
          </section>
        ))}
      </div>
      <div data-overview-footer="">
        {error ? <p role="alert">{error}</p> : null}
        <Action
          data-overview-resume=""
          disabled={pending}
          onClick={() => void start()}
        >
          <Icon name="play" size={18} />
          Start workout
        </Action>
      </div>
      {pending ? <BlockingProgress label="Starting workout…" /> : null}
    </div>
  );
}
