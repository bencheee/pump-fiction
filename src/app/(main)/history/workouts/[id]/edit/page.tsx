import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppSettings } from "@/server/application/app-settings";
import { listExercises } from "@/server/application/exercises";
import { getHistoryWorkout } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { WorkoutCorrection } from "./workout-correction";

export const dynamic = "force-dynamic";

export default async function EditHistoryWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const [workoutResult, libraryResult, settings] = await Promise.all([
    getHistoryWorkout(id),
    listExercises(),
    getAppSettings(),
  ]);
  if (!workoutResult.ok && workoutResult.error.code === "not_found") notFound();

  if (!workoutResult.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // the History list answers an emptiness with, carrying the message and a
    // way back, as the Workout detail does.
    return (
      <div data-correction="">
        <TopBar
          screen="workout-correction"
          title="Correct workout"
          backHref={`/history/workouts/${id}`}
          backLabel="Back"
        />
        <div data-correction-body="">
          <p data-history-note="">
            {workoutResult.error.message}
            <Link href={`/history/workouts/${id}/edit`}>Try again</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <WorkoutCorrection
      workout={workoutResult.value}
      library={libraryResult.ok ? libraryResult.value : []}
      timeZone={settings.ok ? settings.value.timeZone : "UTC"}
    />
  );
}
