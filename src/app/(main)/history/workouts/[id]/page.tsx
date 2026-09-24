import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppSettings } from "@/server/application/app-settings";
import { getHistoryWorkout } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { WorkoutDetail } from "./workout-detail";

export const dynamic = "force-dynamic";

export default async function HistoryWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const [result, settings] = await Promise.all([
    getHistoryWorkout(id),
    getAppSettings(),
  ]);
  if (!result.ok && result.error.code === "not_found") notFound();

  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // the History list answers an emptiness with, carrying the message and a
    // way back, as step 8's three tabs do.
    return (
      <div data-workout-detail="">
        <TopBar
          screen="workout-detail"
          title="Workout"
          backHref="/history/workouts"
          backLabel="Back"
        />
        <div data-workout-detail-body="">
          <p data-note-card="">
            {result.error.message}
            <Link href={`/history/workouts/${id}`}>Try again</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <WorkoutDetail
      workout={result.value}
      timeZone={settings.ok ? settings.value.timeZone : "UTC"}
    />
  );
}
