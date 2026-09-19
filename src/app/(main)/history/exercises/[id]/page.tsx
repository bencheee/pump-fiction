import { notFound } from "next/navigation";

import { getAppSettings } from "@/server/application/app-settings";
import { getExerciseStatistics } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { ExerciseStatisticsView } from "./exercise-statistics-view";

export const dynamic = "force-dynamic";

export default async function ExerciseStatisticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const settings = await getAppSettings();
  const localDate = localDateIn(settings.ok ? settings.value.timeZone : "UTC");
  const result = await getExerciseStatistics(id, { localDate });
  if (!result.ok && result.error.code === "not_found") notFound();

  if (!result.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Exercise"
          backHref="/history/exercises"
          backLabel="Exercises"
        />
        <PageFrame title="Exercise unavailable" className="pt-5">
          <EmptyState
            title="That exercise couldn't be loaded"
            body={result.error.message}
          />
        </PageFrame>
      </div>
    );
  }

  return (
    <ExerciseStatisticsView statistics={result.value} localDate={localDate} />
  );
}

/** Today in the configured zone, which is where every trailing range ends. */
function localDateIn(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
