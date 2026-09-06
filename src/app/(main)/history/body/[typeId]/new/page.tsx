import { notFound } from "next/navigation";

import { getMeasurementProgress } from "@/server/application/body";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { MeasurementEntryForm } from "../../measurement-entry-form";

export const dynamic = "force-dynamic";

export default async function NewMeasurementEntryPage({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  const typeId = requireUuidRouteParam((await params).typeId);
  // One read carries the type and the local date: the default the form opens
  // on and the ceiling every date rule measures against.
  const result = await getMeasurementProgress(typeId);

  if (!result.ok && result.error.code === "not_found") notFound();
  if (!result.ok) return <Unavailable message={result.error.message} />;

  return (
    <MeasurementEntryForm
      type={result.value.detail.type}
      localDate={result.value.localDate}
    />
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Add Entry" backHref="/history/body" backLabel="Body" />
      <PageFrame title="Measurement unavailable" className="pt-5">
        <EmptyState title="The form couldn't be opened" body={message} />
      </PageFrame>
    </div>
  );
}
