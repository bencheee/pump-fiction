import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppSettings } from "@/server/application/app-settings";
import { getSplitStatistics } from "@/server/application/workout-history";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { SplitStatisticsView } from "./split-statistics-view";
import "./split-statistics-view.css";

export const dynamic = "force-dynamic";

export default async function SplitStatisticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const settings = await getAppSettings();
  const localDate = localDateIn(settings.ok ? settings.value.timeZone : "UTC");
  const result = await getSplitStatistics(id, { localDate });
  if (!result.ok && result.error.code === "not_found") notFound();

  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // the History list answers an emptiness with, carrying the message and a
    // way back, as the exercise statistics screen does.
    return (
      <div data-split-statistics="">
        <TopBar
          screen="split-statistics"
          title="Split"
          backHref="/history/splits"
          backLabel="Back"
        />
        <div data-split-statistics-body="">
          <p data-history-note="">
            {result.error.message}
            <Link href={`/history/splits/${id}`}>Try again</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <SplitStatisticsView statistics={result.value} localDate={localDate} />
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
