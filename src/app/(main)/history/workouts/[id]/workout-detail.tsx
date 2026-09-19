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
    <div>
      <TopBar
        title={workout.name}
        backHref="/history/workouts"
        backLabel="Workouts"
      />
      <PageFrame title={workout.name}>
        <p>
          {formatHistoryDate(workout.workoutDate)}
          {workout.programName ? ` · ${workout.programName}` : null}
        </p>

        <div>
          <StatCard
            label="Active duration"
            value={formatHistoryDuration(workout.activeDurationSeconds)}
          />
          <StatCard
            label="Performed"
            value={formatExerciseCount(performedExercises)}
          />
        </div>

        <dl>
          <dt>Started</dt>
          <dd>{new Date(workout.startedAt).toLocaleString()}</dd>
          <dt>Finished</dt>
          <dd>{new Date(workout.finishedAt).toLocaleString()}</dd>
          {workout.splitName ? (
            <>
              <dt>Split</dt>
              <dd>{workout.splitName}</dd>
            </>
          ) : null}
        </dl>

        <section>
          <h2>Exercises</h2>
          {workout.exercises.length === 0 ? (
            <p>This workout has no exercises.</p>
          ) : (
            <ul>
              {workout.exercises.map((exercise) => (
                <li key={exercise.id}>
                  <div>
                    <h3>{exercise.exerciseName}</h3>
                    {exercise.stillInLibrary ? null : (
                      <Badge>No longer in the library</Badge>
                    )}
                  </div>
                  {exercise.plannedSets !== null ? (
                    <p>
                      Planned {exercise.plannedSets} × {exercise.minReps ?? "?"}
                      –{exercise.maxReps ?? "?"}
                    </p>
                  ) : null}
                  {exercise.persistentNote ? (
                    <p>
                      <span>Exercise note:</span> {exercise.persistentNote}
                    </p>
                  ) : null}
                  <ol>
                    {exercise.sets.map((set) => (
                      <li key={set.id}>
                        <span>Set {set.position}</span>
                        <span>
                          {formatSetSummary(set, exercise.measurementType)}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {exercise.workoutNote ? (
                    <p>
                      <span>Workout note:</span> {exercise.workoutNote}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {failure ? <p role="alert">{failure}</p> : null}
      </PageFrame>

      <StickyActionBar>
        <Link href={`/history/workouts/${workout.id}/edit`}>Edit workout</Link>
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
