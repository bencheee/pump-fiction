import Link from "next/link";

import { listBodyMeasurements } from "@/server/application/body";
import {
  formatChangeCm,
  formatCm,
  noPreviousMeasurement,
} from "@/features/history/ui/body-presentation";
import { EmptyState, Icon, ListRow, PageFrame } from "@/shared/ui";

import { formatHistoryDate } from "../history-presentation";

export const dynamic = "force-dynamic";

export default async function BodyHistoryPage() {
  const result = await listBodyMeasurements();

  if (!result.ok) {
    return (
      <PageFrame title="Body" className="pt-6">
        <EmptyState
          title="Measurements couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/body"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  const { measurements } = result.value;

  return (
    <PageFrame title="Body" className="pt-6">
      {/* The History subsection bar owns the top of the screen, so the add
          action sits in the flow rather than floating over it. */}
      <div className="-mt-2 flex justify-end">
        <Link
          href="/history/body/types/new"
          className="flex min-h-11 items-center gap-2 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 font-semibold text-[var(--pf-accent-strong)]"
        >
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
        <ul className="flex flex-col gap-2" aria-label="Measurements">
          {measurements.map((measurement) => (
            <li key={measurement.id}>
              <ListRow
                href={`/history/body/${measurement.id}`}
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

      <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-3-deep)]">
        A rise or a fall is neither good nor bad on its own. What it means
        depends on the measurement and on what you are training for.
      </p>
    </PageFrame>
  );
}
