import { notFound } from "next/navigation";

import {
  getMeasurementEntry,
  getMeasurementProgress,
} from "@/server/application/body";
import { requireLocalDateRouteParam } from "@/shared/routing/local-date-route-param";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { MeasurementEntryForm } from "../../../measurement-entry-form";

export const dynamic = "force-dynamic";

export default async function EditMeasurementEntryPage({
  params,
}: {
  params: Promise<{ typeId: string; date: string }>;
}) {
  const routeParams = await params;
  const typeId = requireUuidRouteParam(routeParams.typeId);
  const date = requireLocalDateRouteParam(routeParams.date);
  // The entry by its own read, and the type and local date beside it, because a
  // correction must not measure its date rule against the browser's clock.
  const [entry, progress] = await Promise.all([
    getMeasurementEntry(typeId, date),
    getMeasurementProgress(typeId),
  ]);

  if (!entry.ok && entry.error.code === "not_found") notFound();
  if (!progress.ok && progress.error.code === "not_found") notFound();
  if (!entry.ok) return <Unavailable message={entry.error.message} />;
  if (!progress.ok) return <Unavailable message={progress.error.message} />;

  return (
    <MeasurementEntryForm
      type={progress.value.detail.type}
      entry={entry.value}
      localDate={progress.value.localDate}
    />
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Edit Entry" backHref="/history/body" backLabel="Body" />
      <PageFrame title="Entry unavailable" className="pt-5">
        <EmptyState title="That entry couldn't be loaded" body={message} />
      </PageFrame>
    </div>
  );
}
