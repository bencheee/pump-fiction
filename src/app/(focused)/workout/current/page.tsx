import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentWorkout } from "@/server/application/active-workout";
import { listExercises } from "@/server/application/exercises";
import { EmptyState, PageFrame } from "@/shared/ui";

import { ActiveWorkoutExperience } from "./active-workout-experience";

export const dynamic = "force-dynamic";

export default async function CurrentWorkoutPage() {
  const [workout, exercises] = await Promise.all([
    getCurrentWorkout(),
    listExercises(),
  ]);

  if (!workout.ok || !exercises.ok) {
    const message = !workout.ok
      ? workout.error.message
      : !exercises.ok
        ? exercises.error.message
        : "";
    return (
      <PageFrame title="Active workout">
        <EmptyState
          title="The workout couldn't be loaded"
          body={message}
          action={
            <Link
              href="/workout/current"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  if (workout.value === null) redirect("/today");

  return (
    <ActiveWorkoutExperience
      initial={workout.value}
      exercises={exercises.value}
    />
  );
}
