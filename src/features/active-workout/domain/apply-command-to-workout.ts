import type { ActiveWorkoutCommand } from "./active-workout-command";
import type { CurrentWorkout, WorkoutExercise, WorkoutSet } from "./workout";

/**
 * Pure local mirror of `public.apply_active_workout_command`, used for
 * optimistic application and pending-command replay after restore. Structural
 * additions receive the command ID as a synthetic placeholder identity until
 * the next authoritative refresh replaces them with server-created rows.
 */
export function applyCommandToWorkout(
  workout: CurrentWorkout,
  command: ActiveWorkoutCommand,
): CurrentWorkout {
  if (command.workoutId !== workout.id) return workout;
  const next = applyOperation(workout, command);
  return { ...next, revision: workout.revision + 1 };
}

function applyOperation(
  workout: CurrentWorkout,
  command: ActiveWorkoutCommand,
): CurrentWorkout {
  switch (command.operation) {
    case "set_workout_exercise_note":
      return mapExercise(
        workout,
        command.payload.workoutExerciseId,
        (item) => ({
          ...item,
          workoutNote: command.payload.note,
        }),
      );
    case "pause_timer": {
      if (workout.activeSegmentStartedAt === null)
        return { ...workout, status: "paused" };
      const segmentSeconds =
        (Date.parse(command.payload.transitionedAt) -
          Date.parse(workout.activeSegmentStartedAt)) /
        1000;
      return {
        ...workout,
        status: "paused",
        accumulatedActiveSeconds:
          workout.accumulatedActiveSeconds +
          Math.max(0, Math.round(segmentSeconds)),
        activeSegmentStartedAt: null,
      };
    }
    case "resume_timer":
      return {
        ...workout,
        status: "active",
        activeSegmentStartedAt: command.payload.transitionedAt,
      };
    case "update_set":
      return mapSet(workout, command.payload.workoutSetId, (set) => ({
        ...set,
        loadMode: command.payload.loadMode,
        loadKg: command.payload.loadKg,
        bandDirection: command.payload.bandDirection,
        bandStrength: command.payload.bandStrength,
        reps: command.payload.reps,
      }));
    case "add_set":
      return mapExercise(
        workout,
        command.payload.workoutExerciseId,
        (item) => ({
          ...item,
          sets: [
            ...item.sets,
            {
              id: command.commandId,
              position: item.sets.length + 1,
              loadMode: null,
              loadKg: null,
              bandDirection: null,
              bandStrength: null,
              reps: null,
            },
          ],
        }),
      );
    case "remove_set":
      return {
        ...workout,
        exercises: workout.exercises.map((item) =>
          item.sets.some((set) => set.id === command.payload.workoutSetId)
            ? {
                ...item,
                sets: renumber(
                  item.sets.filter(
                    (set) => set.id !== command.payload.workoutSetId,
                  ),
                ),
              }
            : item,
        ),
      };
    case "add_exercise":
      return {
        ...workout,
        exercises: [
          ...workout.exercises,
          {
            id: command.commandId,
            exerciseId: command.payload.exerciseId,
            position: workout.exercises.length + 1,
            exerciseName: "",
            exerciseBaseType: "weights",
            measurementType: "reps",
            allowedLoadModes: [],
            persistentNote: "",
            plannedSets: null,
            minReps: null,
            maxReps: null,
            workoutNote: "",
            sets: [],
            lastPerformance: null,
            previousWorkoutNote: null,
          },
        ],
      };
    case "remove_exercise":
      return {
        ...workout,
        exercises: renumber(
          workout.exercises.filter(
            (item) => item.id !== command.payload.workoutExerciseId,
          ),
        ),
      };
    case "reorder_exercises": {
      const order = new Map(
        command.payload.workoutExerciseIds.map((id, index) => [id, index]),
      );
      const ordered = [...workout.exercises].sort(
        (left, right) =>
          (order.get(left.id) ?? left.position + order.size) -
          (order.get(right.id) ?? right.position + order.size),
      );
      return { ...workout, exercises: renumber(ordered) };
    }
    case "finish_workout":
      return workout;
  }
}

function mapExercise(
  workout: CurrentWorkout,
  workoutExerciseId: string,
  map: (item: WorkoutExercise) => WorkoutExercise,
): CurrentWorkout {
  return {
    ...workout,
    exercises: workout.exercises.map((item) =>
      item.id === workoutExerciseId ? map(item) : item,
    ),
  };
}

function mapSet(
  workout: CurrentWorkout,
  workoutSetId: string,
  map: (set: WorkoutSet) => WorkoutSet,
): CurrentWorkout {
  return {
    ...workout,
    exercises: workout.exercises.map((item) =>
      item.sets.some((set) => set.id === workoutSetId)
        ? {
            ...item,
            sets: item.sets.map((set) =>
              set.id === workoutSetId ? map(set) : set,
            ),
          }
        : item,
    ),
  };
}

function renumber<T extends Readonly<{ position: number }>>(
  items: readonly T[],
): readonly T[] {
  return items.map((item, index) => ({ ...item, position: index + 1 }));
}
