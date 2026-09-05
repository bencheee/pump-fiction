import type { ActiveWorkoutCommand } from "./active-workout-command";
import type { CurrentWorkout } from "./workout";

/**
 * Names what a command was about to change, so a refused command can be
 * reported as a concrete loss rather than as an opaque failure. The workout is
 * the optimistic state the command was built against, which still holds the
 * set or exercise the command targets.
 */
export function describeCommandTarget(
  workout: CurrentWorkout,
  command: ActiveWorkoutCommand,
): string {
  switch (command.operation) {
    case "update_set":
    case "remove_set": {
      const found = findSet(workout, command.payload.workoutSetId);
      return found === null
        ? "a set"
        : `set ${found.set.position} of ${found.exercise.exerciseName}`;
    }
    case "add_set":
    case "remove_exercise":
    case "set_workout_exercise_note": {
      const exercise = workout.exercises.find(
        (item) => item.id === command.payload.workoutExerciseId,
      );
      return exercise === undefined ? "an exercise" : exercise.exerciseName;
    }
    case "add_exercise":
      return "an added exercise";
    case "reorder_exercises":
      return "the exercise order";
    case "pause_timer":
    case "resume_timer":
      return "the timer";
    case "finish_workout":
      return "finishing the workout";
  }
}

function findSet(
  workout: CurrentWorkout,
  workoutSetId: string,
): Readonly<{
  exercise: CurrentWorkout["exercises"][number];
  set: CurrentWorkout["exercises"][number]["sets"][number];
}> | null {
  for (const exercise of workout.exercises) {
    const set = exercise.sets.find((item) => item.id === workoutSetId);
    if (set !== undefined) return { exercise, set };
  }
  return null;
}
