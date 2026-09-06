import { notFound } from "next/navigation";

import { defaultMeasurementRange } from "@/features/history/application/body-operations";
import { getMeasurementProgress } from "@/server/application/body";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { MeasurementDetailView } from "./measurement-detail-view";

export const dynamic = "force-dynamic";

export default async function MeasurementDetailPage({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  const typeId = requireUuidRouteParam((await params).typeId);
  const result = await getMeasurementProgress(typeId, {
    range: defaultMeasurementRange,
  });

  if (!result.ok && result.error.code === "not_found") notFound();
  if (!result.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Measurement"
          backHref="/body/measurements"
          backLabel="Body"
        />
        <PageFrame title="Measurement unavailable" className="pt-5">
          <EmptyState
            title="That measurement couldn't be loaded"
            body={result.error.message}
          />
        </PageFrame>
      </div>
    );
  }

  return (
    <MeasurementDetailView
      progress={result.value}
      initialRange={defaultMeasurementRange}
    />
  );
}
