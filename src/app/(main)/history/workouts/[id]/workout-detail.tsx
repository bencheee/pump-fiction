"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { correctHistoryWorkoutAction } from "@/app/actions/workout-history";
import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { HistoryWorkout } from "@/features/history/domain/workout-history";
import {
  Action,
  Badge,
  DestructiveDialog,
  PageFrame,
  StatCard,
  StickyActionBar,
  TopBar,
  useToast,
} from "@/shared/ui";

import {
  formatExerciseCount,
  formatHistoryDate,
  formatHistoryDuration,
} from "../../history-presentation";

export function WorkoutDetail({ workout }: { workout: HistoryWorkout }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<string>();

  const performedExercises = workout.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.loadMode !== null && set.reps !== null),
  ).length;

  const apply = (
    input: Parameters<typeof correctHistoryWorkoutAction>[0],
    success: string,
    destination?: string,
  ) => {
    setFailure(undefined);
    startTransition(async () => {
      const result = await correctHistoryWorkoutAction(input);
      if (!result.ok) {
        setFailure(result.error.message);
        showToast(result.error.message);
        return;
      }
      showToast(success);
      if (destination) router.push(destination);
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={workout.name}
        backHref="/history/workouts"
        backLabel="Workouts"
      />
      <PageFrame title={workout.name} className="pt-5">
        <p className="text-[var(--pf-text-2)]">
          {formatHistoryDate(workout.workoutDate)}
          {workout.programName ? ` · ${workout.programName}` : null}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Active duration"
            value={formatHistoryDuration(workout.activeDurationSeconds)}
          />
          <StatCard
            label="Performed"
            value={formatExerciseCount(performedExercises)}
          />
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
          <dt className="text-[var(--pf-text-2)]">Started</dt>
          <dd>{new Date(workout.startedAt).toLocaleString()}</dd>
          <dt className="text-[var(--pf-text-2)]">Finished</dt>
          <dd>{new Date(workout.finishedAt).toLocaleString()}</dd>
          {workout.splitName ? (
            <>
              <dt className="text-[var(--pf-text-2)]">Split</dt>
              <dd>{workout.splitName}</dd>
            </>
          ) : null}
        </dl>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
            Exercises
          </h2>
          {workout.exercises.length === 0 ? (
            <p className="text-[var(--pf-text-2)]">
              This workout has no exercises.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {workout.exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[16.5px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
                      {exercise.exerciseName}
                    </h3>
                    {exercise.stillInLibrary ? null : (
                      <Badge>No longer in the library</Badge>
                    )}
                  </div>
                  {exercise.plannedSets !== null ? (
                    <p className="mt-1 text-[12.5px] text-[var(--pf-text-2)]">
                      Planned {exercise.plannedSets} × {exercise.minReps ?? "?"}
                      –{exercise.maxReps ?? "?"}
                    </p>
                  ) : null}
                  {exercise.persistentNote ? (
                    <p className="mt-2 text-[13px] text-[var(--pf-text-2)]">
                      <span className="font-semibold">Exercise note:</span>{" "}
                      {exercise.persistentNote}
                    </p>
                  ) : null}
                  <ol className="mt-2 flex flex-col gap-1">
                    {exercise.sets.map((set) => (
                      <li
                        key={set.id}
                        className="pf-numeric flex justify-between gap-3 text-[13px]"
                      >
                        <span className="text-[var(--pf-text-2)]">
                          Set {set.position}
                        </span>
                        <span>
                          {formatSetSummary(set, exercise.measurementType)}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {exercise.workoutNote ? (
                    <p className="mt-2 text-[13px]">
                      <span className="font-semibold">Workout note:</span>{" "}
                      {exercise.workoutNote}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {failure ? (
          <p role="alert" className="text-[13px] text-[var(--pf-danger)]">
            {failure}
          </p>
        ) : null}
      </PageFrame>

      <StickyActionBar>
        <Link
          href={`/history/workouts/${workout.id}/edit`}
          className="inline-flex min-h-[var(--pf-size-primary-action)] items-center justify-center rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 font-semibold text-[var(--pf-on-accent)]"
        >
          Edit workout
        </Link>
        <DestructiveDialog
          trigger={
            <Action variant="danger" disabled={pending}>
              Delete workout
            </Action>
          }
          title="Delete this workout?"
          description="It leaves History permanently and every statistic it fed is recalculated. Rotation is not affected."
          confirmLabel="Delete workout"
          onConfirm={() =>
            apply(
              { kind: "delete", workoutId: workout.id },
              "Workout deleted. Affected statistics were recalculated.",
              "/history/workouts",
            )
          }
        />
      </StickyActionBar>
    </div>
  );
}
