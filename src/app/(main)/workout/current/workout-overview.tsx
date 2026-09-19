"use client";

import type { ReactNode } from "react";

import { isSetRecorded } from "@/features/active-workout/domain/set-entry";
import type {
  CurrentWorkout,
  WorkoutExercise,
} from "@/features/active-workout/domain/workout";
import { Icon, useReorder } from "@/shared/ui";

/**
 * The workout seen whole: every exercise in order, what each has recorded, and
 * the way back into the set that is waiting. Holding a card reorders it.
 */
export function WorkoutOverview({
  workout,
  clock,
  paused,
  currentExerciseId,
  resumeLabel,
  placeholderNames,
  addExercise,
  onBack,
  onResume,
  onOpenExercise,
  onRemoveExercise,
  onReorder,
}: {
  workout: CurrentWorkout;
  clock: string;
  paused: boolean;
  currentExerciseId: string | null;
  resumeLabel: string;
  placeholderNames: Readonly<Record<string, string>>;
  /** The add-exercise overlay, already bound to its trigger. */
  addExercise: ReactNode;
  onBack: () => void;
  onResume: () => void;
  onOpenExercise: (exerciseId: string) => void;
  onRemoveExercise: (exercise: WorkoutExercise) => void;
  onReorder: (ids: readonly string[]) => void;
}) {
  const reorder = useReorder({
    count: workout.exercises.length,
    onMove: (from, to) => {
      const ids = workout.exercises.map((exercise) => exercise.id);
      const [moved] = ids.splice(from, 1);
      if (!moved) return;
      ids.splice(to, 0, moved);
      onReorder(ids);
    },
  });

  const totalSets = workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
  const recorded = workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.filter((set) => isSetRecorded(set.loadMode, set)).length,
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-[pf-screen-back_300ms_var(--pf-ease)]">
      <div className="flex min-h-[calc(60px+env(safe-area-inset-top))] shrink-0 items-center gap-2.5 pt-[env(safe-area-inset-top)] pr-4 pl-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to the current set"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-2)]"
        >
          <Icon name="arrow-left" size={18} />
        </button>
        <span className="min-w-0 flex-1 truncate text-[16px] font-semibold">
          {workout.name}
        </span>
        <span
          aria-label="Active duration"
          className={
            paused
              ? "pf-numeric shrink-0 rounded-full bg-[var(--pf-bg-surface)] px-3 py-1.5 text-[17px] font-semibold text-[var(--pf-text-3)]"
              : "pf-numeric shrink-0 rounded-full bg-[var(--pf-bg-surface)] px-3 py-1.5 text-[17px] font-semibold"
          }
        >
          {clock}
        </span>
      </div>

      <div className="pf-scroll flex min-h-0 flex-1 flex-col gap-2.5 px-[var(--pf-gutter)] pt-2 pb-4">
        <p className="text-[12px] font-semibold tracking-[0.04em] text-[var(--pf-text-3)]">
          {workout.exercises.length}{" "}
          {workout.exercises.length === 1 ? "exercise" : "exercises"} ·{" "}
          {totalSets} {totalSets === 1 ? "set" : "sets"}
        </p>

        {workout.exercises.map((exercise, index) => {
          const row = reorder.row(index);
          const current = exercise.id === currentExerciseId;
          const done = exercise.sets.filter((set) =>
            isSetRecorded(set.loadMode, set),
          ).length;
          const name =
            exercise.exerciseName ||
            (placeholderNames[exercise.id] ?? "New exercise");

          return (
            <section
              key={exercise.id}
              {...row}
              aria-label={name}
              className={
                current
                  ? "relative flex cursor-grab items-center gap-2 rounded-[var(--pf-r3)] border border-transparent bg-[var(--pf-accent-dim)] py-3 pr-2 pl-[18px]"
                  : "relative flex cursor-grab items-center gap-2 rounded-[var(--pf-r3)] border border-transparent bg-[var(--pf-bg-surface)] py-3 pr-2 pl-[18px]"
              }
            >
              <button
                type="button"
                onClick={() => onOpenExercise(exercise.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block text-[15.5px] font-semibold [text-wrap:pretty]">
                  {name}
                </span>
                <span
                  className={
                    current
                      ? "pf-numeric mt-1 block text-[14px] text-[var(--pf-accent)]"
                      : "pf-numeric mt-1 block text-[14px] text-[var(--pf-text-3)]"
                  }
                >
                  {exercise.plannedSets === null
                    ? "Workout-local"
                    : `${exercise.plannedSets} × ${exercise.minReps ?? "?"}–${exercise.maxReps ?? "?"}`}{" "}
                  · {done} of {exercise.sets.length} recorded
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => onRemoveExercise(exercise)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-4)]"
              >
                <Icon name="trash-2" size={15} />
              </button>
            </section>
          );
        })}

        {addExercise}
      </div>

      <div className="flex shrink-0 flex-col gap-3 px-[var(--pf-gutter)] pt-3 pb-[calc(var(--pf-bottom-buffer)+env(safe-area-inset-bottom))]">
        <span className="pf-numeric text-center text-[15px] text-[var(--pf-text-4)]">
          {recorded} of {totalSets} sets recorded
        </span>
        {workout.exercises.length > 0 ? (
          <button
            type="button"
            onClick={onResume}
            className="flex h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent)] text-[17px] font-semibold text-[var(--pf-on-accent)]"
          >
            <Icon name="play" size={18} />
            <span className="min-w-0 truncate">{resumeLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
