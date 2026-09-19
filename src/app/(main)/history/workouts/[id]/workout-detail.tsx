"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { correctHistoryWorkoutAction } from "@/app/actions/workout-history";
import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { HistoryWorkout } from "@/features/history/domain/workout-history";
import {
  ActionOverlay,
  ActionsTrigger,
  Badge,
  DestructiveDialog,
  Icon,
  Kicker,
  ScreenBody,
  StatCard,
  StickyActionBar,
  TopBar,
  useToast,
  useTransientOverlay,
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
  const confirmDelete = useTransientOverlay();

  const performedExercises = workout.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.loadMode !== null && set.reps !== null),
  ).length;

  const facts = [
    { label: "Started", value: new Date(workout.startedAt).toLocaleString() },
    { label: "Finished", value: new Date(workout.finishedAt).toLocaleString() },
    // The program already reads in the line under the title.
    ...(workout.splitName
      ? [{ label: "Split", value: workout.splitName }]
      : []),
  ];

  function deleteWorkout() {
    setFailure(undefined);
    startTransition(async () => {
      const result = await correctHistoryWorkoutAction({
        kind: "delete",
        workoutId: workout.id,
      });
      if (!result.ok) {
        setFailure(result.error.message);
        showToast(result.error.message);
        return;
      }
      showToast("Workout deleted. Affected statistics were recalculated.");
      router.push("/history/workouts");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={workout.name}
        backHref="/history/workouts"
        backLabel="Workouts"
      />
      <ScreenBody>
        <div>
          <h2 className="text-[length:var(--pf-type-title-size)] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
            {workout.name}
          </h2>
          <p className="pf-numeric mt-2 text-[16px] text-[var(--pf-text-3)]">
            {formatHistoryDate(workout.workoutDate)}
            {workout.programName ? ` · ${workout.programName}` : null}
          </p>
        </div>

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

        <dl className="rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface)] px-[18px] py-1.5">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={
                index === 0
                  ? "flex min-h-11 items-baseline justify-between gap-3.5 py-2"
                  : "flex min-h-11 items-baseline justify-between gap-3.5 border-t border-[var(--pf-border)] py-2"
              }
            >
              <dt className="shrink-0 text-[13px] text-[var(--pf-text-4)]">
                {fact.label}
              </dt>
              <dd className="pf-numeric min-w-0 flex-1 text-right text-[15px] [text-wrap:pretty]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <Kicker className="mt-1.5">Exercises</Kicker>
        {workout.exercises.length === 0 ? (
          <p className="text-[13.5px] text-[var(--pf-text-3)]">
            This workout has no exercises.
          </p>
        ) : (
          <ul className="flex flex-col gap-3.5">
            {workout.exercises.map((exercise) => (
              <li
                key={exercise.id}
                className="rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] px-[18px] py-4"
              >
                <h3 className="text-[length:var(--pf-type-card-title-size)] leading-[1.25] font-semibold [text-wrap:pretty]">
                  {exercise.exerciseName}
                </h3>
                {exercise.plannedSets !== null ? (
                  <p className="pf-numeric mt-1.5 text-[14px] text-[var(--pf-text-3)]">
                    Planned {exercise.plannedSets} × {exercise.minReps ?? "?"}–
                    {exercise.maxReps ?? "?"}
                  </p>
                ) : null}
                {exercise.stillInLibrary ? null : (
                  <p className="mt-2.5">
                    <Badge>No longer in the library</Badge>
                  </p>
                )}
                <ol className="mt-3.5 flex flex-col">
                  {exercise.sets.map((set, index) => (
                    <li
                      key={set.id}
                      className={
                        index === 0
                          ? "flex min-h-[34px] items-center justify-between gap-3"
                          : "flex min-h-[34px] items-center justify-between gap-3 border-t border-[var(--pf-border)]"
                      }
                    >
                      <span className="text-[13px] text-[var(--pf-text-4)]">
                        Set {set.position}
                      </span>
                      <span className="pf-numeric text-[17px] font-semibold">
                        {formatSetSummary(set, exercise.measurementType)}
                      </span>
                    </li>
                  ))}
                </ol>
                {exercise.persistentNote ? (
                  <p className="mt-3.5 rounded-[var(--pf-r2)] bg-[var(--pf-bg-surface-2)] px-3.5 py-3 text-[13.5px] leading-[1.5] text-[var(--pf-text-2)]">
                    {exercise.persistentNote}
                  </p>
                ) : null}
                {exercise.workoutNote ? (
                  <p className="mt-2 rounded-[var(--pf-r2)] bg-[var(--pf-bg-surface-2)] px-3.5 py-3 text-[13.5px] leading-[1.5] text-[var(--pf-text-2)]">
                    <span className="font-semibold">Workout note:</span>{" "}
                    {exercise.workoutNote}
                  </p>
                ) : null}
                <a
                  href={`/history/exercises/${exercise.exerciseIdentityId}`}
                  className="mt-3.5 flex min-h-11 items-center gap-2 text-[13.5px] font-semibold text-[var(--pf-accent)]"
                >
                  <Icon name="trending-up" size={15} />
                  Exercise statistics
                </a>
              </li>
            ))}
          </ul>
        )}

        {failure ? (
          <p role="alert" className="text-[13px] text-[var(--pf-danger)]">
            {failure}
          </p>
        ) : null}
      </ScreenBody>

      <StickyActionBar>
        <ActionOverlay
          trigger={<ActionsTrigger label="Workout actions" />}
          title={workout.name}
          meta={`${formatHistoryDate(workout.workoutDate)} · ${formatHistoryDuration(workout.activeDurationSeconds)}`}
          actions={[
            {
              key: "edit",
              label: "Correct this workout",
              icon: "pencil",
              onRun: () => router.push(`/history/workouts/${workout.id}/edit`),
            },
            {
              key: "delete",
              label: "Delete this workout",
              icon: "trash-2",
              disabled: pending,
              onRun: () => confirmDelete.requestOpenChange(true),
            },
          ]}
        />
      </StickyActionBar>

      <DestructiveDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.requestOpenChange}
        title="Delete this workout?"
        description="It leaves History permanently and every statistic it fed is recalculated. Rotation is not affected."
        confirmLabel="Delete workout"
        onConfirm={deleteWorkout}
      />
    </div>
  );
}
