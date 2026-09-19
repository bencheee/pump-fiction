import Link from "next/link";

import { listBodyMeasurements } from "@/server/application/body";
import {
  formatChangeCm,
  formatCm,
  noPreviousMeasurement,
} from "@/features/history/ui/body-presentation";
import { EmptyState, Icon, ListRow, PageFrame } from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

import { BodyCount } from "../body-count";
import { BodyNavigation } from "../body-navigation";

export const dynamic = "force-dynamic";

export default async function BodyHistoryPage() {
  const result = await listBodyMeasurements();

  if (!result.ok) {
    return (
      <PageFrame title="Body" pinned={<BodyNavigation />}>
        <EmptyState
          icon="circle-alert"
          title="Measurements couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/body/measurements"
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
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
    <PageFrame
      title="Body"
      action={<BodyCount count={measurements.length} noun="measurement" />}
      pinned={<BodyNavigation />}
      className="gap-3.5 pt-4.5"
    >
      <div className="flex justify-end">
        <Link
          href="/body/measurements/types/new"
          className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--pf-border)] px-4 text-[14px] font-semibold text-[var(--pf-accent)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-accent)]"
        >
          <Icon name="plus" size={16} />
          Add measurement
        </Link>
      </div>

      {measurements.length === 0 ? (
        <EmptyState
          icon="scale"
          title="No measurements yet"
          body="Add a measurement such as waist or upper arm, then record it whenever you like."
        />
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Measurements">
          {measurements.map((measurement, index) => (
            <li key={measurement.id}>
              <ListRow
                index={index}
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

      <p className="mt-1 text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
        A rise or a fall is neither good nor bad on its own. What it means
        depends on the measurement and on what you are training for.
      </p>
    </PageFrame>
  );
}
