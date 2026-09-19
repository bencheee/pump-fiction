"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createMeasurementEntryAction,
  getMeasurementProgressAction,
} from "@/app/actions/body";
import type { MeasurementProgress } from "@/features/history/application/body-operations";
import type { ChartRange } from "@/features/history/domain/chart";
import {
  formatChangeCm,
  formatCm,
  noPreviousMeasurement,
  noTotalChange,
} from "@/features/history/ui/body-presentation";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import {
  Chip,
  EmptyState,
  Icon,
  Kicker,
  rowStagger,
  ScreenBody,
  StatCard,
  StickyActionBar,
  TopBar,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

import { BodyEntryOverlay } from "../../body-entry-overlay";

/** Body offers no `week` range; `weight-and-body.md` names these four. */
const bodyRanges: readonly ChartRange[] = ["month", "quarter", "year", "all"];

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function MeasurementDetailView({
  progress,
  initialRange,
}: {
  progress: MeasurementProgress;
  initialRange: ChartRange;
}) {
  const [view, setView] = useState(progress);
  const [range, setRange] = useState<ChartRange>(initialRange);
  const [pending, startTransition] = useTransition();
  const { detail, series } = view;
  const { type } = detail;

  const reload = (next: ChartRange = range) => {
    setRange(next);
    startTransition(async () => {
      const result = await getMeasurementProgressAction(type.id, {
        range: next,
      });
      if (result.ok) setView(result.value);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={type.name}
        backHref="/body/measurements"
        backLabel="Body"
        trailing={
          <Link
            href={`/body/measurements/types/${type.id}/edit`}
            aria-label={`Edit ${type.name}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-3)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:bg-[var(--pf-bg-surface)]"
          >
            <Icon name="pencil" size={16} />
          </Link>
        }
      />
      <ScreenBody>
        <div>
          <h2 className="text-[length:var(--pf-type-title-size)] leading-[1.16] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
            {type.name}
          </h2>
          {/* The unit is a label under the name rather than a section of its
              own, which ADR-0030 decided. */}
          <p className="mt-2 text-[13px] text-[var(--pf-text-4)]">
            Measured in centimetres
          </p>
        </div>

        {detail.latest === null ? (
          <EmptyState
            icon="scale"
            title="Nothing recorded yet"
            body="Record this measurement and this screen starts tracking how it changes."
          />
        ) : (
          <>
            <section className="rounded-[var(--pf-r4)] bg-[var(--pf-accent-dim)] p-[18px]">
              <h3 className="text-[11.5px] font-semibold tracking-[0.08em] text-[var(--pf-accent)] uppercase">
                Latest
              </h3>
              <p className="pf-numeric mt-3 text-[26px] font-bold text-[var(--pf-accent-soft)]">
                {formatCm(detail.latest.valueCm)}
              </p>
              <p className="mt-1.5 text-[13.5px] text-[var(--pf-text-2)]">
                {formatHistoryDate(detail.latest.entryDate)}
                {detail.latest.changeCm === null
                  ? ` · ${noPreviousMeasurement}`
                  : ` · ${formatChangeCm(detail.latest.changeCm)} since the one before it`}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Latest change"
                value={
                  detail.latest.changeCm === null
                    ? "—"
                    : formatChangeCm(detail.latest.changeCm)
                }
                detail={
                  detail.latest.changeCm === null
                    ? noPreviousMeasurement
                    : "since the one before it"
                }
              />
              <StatCard
                label="Total change"
                value={
                  detail.totalChangeCm === null
                    ? "—"
                    : formatChangeCm(detail.totalChangeCm)
                }
                detail={
                  detail.totalChangeCm === null
                    ? noTotalChange
                    : "since the first entry"
                }
              />
            </div>

            <Kicker className="mt-1">Trend</Kicker>
            <div
              role="group"
              aria-label="Time range"
              className="flex flex-wrap gap-2"
            >
              {bodyRanges.map((option) => (
                <Chip
                  key={option}
                  selected={range === option}
                  disabled={pending}
                  onClick={() => reload(option)}
                >
                  {rangeLabels[option]}
                </Chip>
              ))}
            </div>

            <section className="rounded-[var(--pf-r4)] bg-[var(--pf-bg-surface)] p-[18px]">
              <ProgressChart
                series={series}
                noun="entry"
                nounPlural="entries"
                emptyMessage="No entry falls inside this range."
                formatValue={formatCm}
              />
            </section>

            <Kicker className="mt-1">Entries</Kicker>
            <ul className="flex flex-col gap-2" aria-label="Entries">
              {detail.entries.map((entry, index) => (
                <li key={entry.id}>
                  <Link
                    href={`/body/measurements/${type.id}/${entry.entryDate}/edit`}
                    style={rowStagger(index)}
                    className="flex min-h-[62px] items-center gap-3 rounded-[var(--pf-r2)] border border-[var(--pf-bg-surface)] bg-[var(--pf-bg-surface)] pr-3 pl-[18px] transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] hover:border-[var(--pf-border-strong)] active:scale-[0.99] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both]"
                  >
                    <span className="pf-numeric shrink-0 text-[19px] font-semibold">
                      {formatCm(entry.valueCm)}
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] text-[var(--pf-text-3)]">
                      {formatHistoryDate(entry.entryDate)}
                      {entry.changeCm === null
                        ? ` · ${noPreviousMeasurement}`
                        : ` · ${formatChangeCm(entry.changeCm)}`}
                    </span>
                    <Icon
                      name="pencil"
                      size={15}
                      className="shrink-0 text-[var(--pf-glyph-dim)]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </ScreenBody>

      <StickyActionBar>
        <BodyEntryOverlay
          trigger={
            <button
              type="button"
              className="flex h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent)] text-[16.5px] font-semibold text-[var(--pf-on-accent)] transition-transform duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] active:scale-[0.99]"
            >
              <Icon name="plus" size={18} />
              Record measurement
            </button>
          }
          title={`Record ${type.name}`}
          valueLabel="Measurement (cm)"
          placeholder="38.5"
          hint="Up to two decimals."
          localDate={view.localDate}
          saveLabel="Save entry"
          onSave={async ({ entryDate, value }) => {
            const result = await createMeasurementEntryAction({
              measurementTypeId: type.id,
              entryDate,
              valueCm: value,
            });
            if (!result.ok) return { ok: false, message: result.error.message };
            return { ok: true, toast: "Measurement saved." };
          }}
          onSaved={() => reload()}
        />
      </StickyActionBar>
    </div>
  );
}
