import { notFound } from "next/navigation";

import { getHistoryWorkout } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { WorkoutDetail } from "./workout-detail";

export const dynamic = "force-dynamic";

export default async function HistoryWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const result = await getHistoryWorkout(id);
  if (!result.ok && result.error.code === "not_found") notFound();

  if (!result.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Workout"
          backHref="/history/workouts"
          backLabel="Workouts"
        />
        <PageFrame title="Workout unavailable" className="pt-5">
          <EmptyState
            title="That workout couldn't be loaded"
            body={result.error.message}
          />
        </PageFrame>
      </div>
    );
  }

  return <WorkoutDetail workout={result.value} />;
}
