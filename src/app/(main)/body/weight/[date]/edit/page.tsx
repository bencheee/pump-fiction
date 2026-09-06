import { notFound } from "next/navigation";

import { getTodayWeight, getWeightEntry } from "@/server/application/weight";
import { requireLocalDateRouteParam } from "@/shared/routing/local-date-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { WeightForm } from "../../weight-form";

export const dynamic = "force-dynamic";

export default async function EditWeightEntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const date = requireLocalDateRouteParam((await params).date);
  // The local date travels with the form: it is the ceiling every date rule
  // measures against, and a correction must not read the browser's clock.
  const [entry, today] = await Promise.all([
    getWeightEntry(date),
    getTodayWeight(),
  ]);

  if (!entry.ok && entry.error.code === "not_found") notFound();
  if (!entry.ok) return <Unavailable message={entry.error.message} />;
  if (!today.ok) return <Unavailable message={today.error.message} />;

  return <WeightForm entry={entry.value} localDate={today.value.localDate} />;
}

function Unavailable({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Edit Weight" backHref="/body/weight" backLabel="Weight" />
      <PageFrame title="Weigh-in unavailable" className="pt-5">
        <EmptyState title="That weigh-in couldn't be loaded" body={message} />
      </PageFrame>
    </div>
  );
}
