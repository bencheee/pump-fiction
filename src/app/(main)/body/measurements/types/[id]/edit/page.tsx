import { notFound } from "next/navigation";

import { listBodyMeasurements } from "@/server/application/body";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { MeasurementTypeForm } from "../../../measurement-type-form";

export const dynamic = "force-dynamic";

export default async function EditMeasurementTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  // One read carries the name and whether anything is recorded, which is what
  // decides between offering deletion and explaining why it is unavailable.
  const result = await listBodyMeasurements();

  if (!result.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Edit Measurement"
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

  const measurement = result.value.measurements.find(
    (entry) => entry.id === id,
  );
  if (!measurement) notFound();

  return <MeasurementTypeForm measurement={measurement} />;
}
