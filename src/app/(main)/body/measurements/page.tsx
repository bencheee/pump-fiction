import Link from "next/link";
import type { CSSProperties } from "react";

import { listBodyMeasurements } from "@/server/application/body";
import {
  formatChangeCm,
  formatCm,
  noPreviousMeasurement,
} from "@/features/history/ui/body-presentation";
import { EmptyCard, ListRow, TabbedCount, TabbedPanel } from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

import { AddMeasurementSheet } from "../body-entry-sheet";

export const dynamic = "force-dynamic";

/*
 * Body's Measurements tab — the prototype's screen 15, second tab — ported
 * for step 18 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy:
 *   markup        lines 1100-1121, `data-screen-label="Body"`
 *   bound values  lines 3053 (`bodyCount`), 3069-3081 (`bmRows`, `bmEmpty`,
 *                 `bmAddType`)
 */
export default async function BodyMeasurementsPage() {
  const result = await listBodyMeasurements();

  if (!result.ok) {
    // A read that failed, which the prototype has no notion of.
    return (
      <>
        <TabbedCount>—</TabbedCount>
        <TabbedPanel>
          <p data-note-card="">
            {result.error.message}
            <Link href="/body/measurements">Try again</Link>
          </p>
        </TabbedPanel>
      </>
    );
  }

  const { measurements } = result.value;
  const count = measurements.length;

  return (
    <>
      <TabbedCount>
        {count} {count === 1 ? "measurement" : "measurements"}
      </TabbedCount>
      <TabbedPanel>
        {/* `bmAddType` (line 1102, value at 3081): a new measurement type,
            in the Body entry panel. */}
        <div data-body-add-row="">
          <AddMeasurementSheet localDate={result.value.localDate} />
        </div>

        {count === 0 ? (
          /* `bmEmpty` (lines 1112-1116). */
          <EmptyCard icon="scale" title="No measurements yet">
            Add a measurement such as waist or upper arm, then record it
            whenever you like.
          </EmptyCard>
        ) : (
          <ul data-body-rows="">
            {measurements.map((measurement, index) => (
              <li
                key={measurement.id}
                style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
              >
                {/* `bmRows` (lines 1104-1110, values at 3069-3078). */}
                <ListRow
                  href={`/body/measurements/${measurement.id}`}
                  variant="measurement"
                  title={measurement.name}
                  detail={
                    measurement.latest === null
                      ? "No measurement recorded yet"
                      : `${formatCm(measurement.latest.valueCm)} · ${formatHistoryDate(measurement.latest.entryDate)} · ${measurement.latest.changeCm === null ? noPreviousMeasurement : formatChangeCm(measurement.latest.changeCm)}`
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <p data-body-footnote="">
          A rise or a fall is neither good nor bad on its own. What it means
          depends on the measurement and on what you are training for.
        </p>
      </TabbedPanel>
    </>
  );
}
