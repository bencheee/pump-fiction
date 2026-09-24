import Link from "next/link";
import { notFound } from "next/navigation";

import { getMeasurementProgress } from "@/server/application/body";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { MeasurementDetailView } from "./measurement-detail-view";

export const dynamic = "force-dynamic";

export default async function MeasurementDetailPage({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  const typeId = requireUuidRouteParam((await params).typeId);
  const result = await getMeasurementProgress(typeId);

  if (!result.ok && result.error.code === "not_found") notFound();
  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // inside the screen's own frame, as every ported screen answers it.
    return (
      <div data-measurement="">
        <TopBar
          screen="measurement"
          title="Measurement"
          backHref="/body/measurements"
          backLabel="Back"
        />
        <div data-measurement-body="">
          <p data-note-card="">
            {result.error.message}
            <Link href={`/body/measurements/${typeId}`}>Try again</Link>
          </p>
        </div>
      </div>
    );
  }

  return <MeasurementDetailView progress={result.value} />;
}
