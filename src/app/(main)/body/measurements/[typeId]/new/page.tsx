import { notFound, redirect } from "next/navigation";

import { getMeasurementProgress } from "@/server/application/body";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { MeasurementEntryForm } from "../../measurement-entry-form";

export const dynamic = "force-dynamic";

/*
 * `bdRecord` (prototype line 3094): the measurement's `Record measurement`
 * opens a new entry for today. The prototype opens its Body entry panel,
 * which step 20 of docs/design/redesign-v2/PLAN.md ports; until then it is
 * the application's entry form on a route of its own.
 */
export default async function NewMeasurementEntryPage({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  const typeId = requireUuidRouteParam((await params).typeId);
  const progress = await getMeasurementProgress(typeId);
  if (!progress.ok && progress.error.code === "not_found") notFound();
  if (!progress.ok) {
    return (
      <div>
        <TopBar
          title="Record measurement"
          backHref={`/body/measurements/${typeId}`}
          backLabel="Back"
        />
        <PageFrame title="Measurement unavailable">
          <EmptyState
            title="That measurement couldn't be loaded"
            body={progress.error.message}
          />
        </PageFrame>
      </div>
    );
  }
  const { detail, localDate } = progress.value;
  // At most one entry a day: once today's exists, this opens that one.
  if (detail.latest?.entryDate === localDate)
    redirect(`/body/measurements/${typeId}/${localDate}/edit`);
  return <MeasurementEntryForm type={detail.type} localDate={localDate} />;
}
