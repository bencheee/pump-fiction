"use server";

import {
  correctHistoryWorkout,
  getHistoryWorkout,
  listWorkoutHistory,
} from "@/server/application/workout-history";

export async function listWorkoutHistoryAction() {
  return listWorkoutHistory();
}

export async function getHistoryWorkoutAction(workoutId: string) {
  return getHistoryWorkout(workoutId);
}

export async function correctHistoryWorkoutAction(input: unknown) {
  return correctHistoryWorkout(input);
}
