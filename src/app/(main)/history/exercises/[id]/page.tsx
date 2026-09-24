import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppSettings } from "@/server/application/app-settings";
import { getExerciseStatistics } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { ExerciseStatisticsView } from "./exercise-statistics-view";
import "./exercise-statistics-view.css";

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
    // A read that failed, which the prototype has no notion of: the note card
    // the History list answers an emptiness with, carrying the message and a
    // way back, as the Workout detail does in step 9.
    return (
      <div data-exercise-statistics="">
        <TopBar
          screen="exercise-statistics"
          title="Exercise"
          backHref="/history/exercises"
          backLabel="Back"
        />
        <div data-exercise-statistics-body="">
          <p data-note-card="">
            {result.error.message}
            <Link href={`/history/exercises/${id}`}>Try again</Link>
          </p>
        </div>
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
