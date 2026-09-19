import Link from "next/link";

import { listBodyMeasurements } from "@/server/application/body";
import {
  formatChangeCm,
  formatCm,
  noPreviousMeasurement,
} from "@/features/history/ui/body-presentation";
import { EmptyState, Icon, ListRow, PageFrame } from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

export const dynamic = "force-dynamic";

export default async function BodyHistoryPage() {
  const result = await listBodyMeasurements();

  if (!result.ok) {
    return (
      <PageFrame title="Body">
        <EmptyState
          title="Measurements couldn't be loaded"
          body={result.error.message}
          action={<Link href="/body/measurements">Retry</Link>}
        />
      </PageFrame>
    );
  }

  const { measurements } = result.value;

  return (
    <PageFrame title="Body">
      {/* The History subsection bar owns the top of the screen, so the add
          action sits in the flow rather than floating over it. */}
      <div>
        <Link href="/body/measurements/types/new">
          <Icon name="plus" size={18} />
          Add measurement
        </Link>
      </div>

      {measurements.length === 0 ? (
        <EmptyState
          title="No measurements yet"
          body="Add a measurement such as waist or upper arm, then record it whenever you like."
        />
      ) : (
        <ul aria-label="Measurements">
          {measurements.map((measurement) => (
            <li key={measurement.id}>
              <ListRow
                href={`/body/measurements/${measurement.id}`}
                title={measurement.name}
                detail={
                  measurement.latest === null ? (
                    "No measurement recorded yet"
                  ) : (
                    <>
                      {formatCm(measurement.latest.valueCm)} ·{" "}
                      {formatHistoryDate(measurement.latest.entryDate)} ·{" "}
                      {measurement.latest.changeCm === null
                        ? noPreviousMeasurement
                        : formatChangeCm(measurement.latest.changeCm)}
                    </>
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}

      <p>
        A rise or a fall is neither good nor bad on its own. What it means
        depends on the measurement and on what you are training for.
      </p>
    </PageFrame>
  );
}
