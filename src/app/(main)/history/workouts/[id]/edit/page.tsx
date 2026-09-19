import { notFound } from "next/navigation";

import { listExercises } from "@/server/application/exercises";
import { getHistoryWorkout } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { WorkoutCorrectionForm } from "./workout-correction-form";

export const dynamic = "force-dynamic";

export default async function EditHistoryWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const [workoutResult, libraryResult] = await Promise.all([
    getHistoryWorkout(id),
    listExercises(),
  ]);
  if (!workoutResult.ok && workoutResult.error.code === "not_found") notFound();

  if (!workoutResult.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Edit workout"
          backHref={`/history/workouts/${id}`}
          backLabel="Workout"
        />
        <PageFrame title="Workout unavailable" className="pt-5">
          <EmptyState
            title="That workout couldn't be loaded"
            body={workoutResult.error.message}
          />
        </PageFrame>
      </div>
    );
  }

  return (
    <WorkoutCorrectionForm
      workout={workoutResult.value}
      library={libraryResult.ok ? libraryResult.value : []}
    />
  );
}
