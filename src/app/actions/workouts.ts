"use server";

import type { StartWorkoutInput } from "@/features/active-workout/domain/workout";
import {
  getCurrentWorkout,
  startWorkout,
} from "@/server/application/active-workout";

export async function startWorkoutAction(input: StartWorkoutInput) {
  return startWorkout(input);
}

export async function getCurrentWorkoutAction() {
  return getCurrentWorkout();
}
