"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createWeightEntryAction,
  getWeightProgressAction,
} from "@/app/actions/weight";
import type { WeightProgress } from "@/features/history/application/weight-operations";
import type { ChartRange, ChartSeries } from "@/features/history/domain/chart";
import { ProgressChart } from "@/features/history/ui/progress-chart";
import {
  Chip,
  Collapsible,
  DataRow,
  EmptyState,
  Icon,
  Kicker,
  PageFrame,
  rowStagger,
  StatCard,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";
import {
  formatAverageKg,
  formatChangeKg,
  formatKg,
  formatRecordedDays,
  noPreviousWeek,
  weekStatusLabel,
} from "@/features/history/ui/weight-presentation";

import { BodyEntryOverlay } from "../body-entry-overlay";
import { BodyCount } from "../body-count";
import { BodyNavigation } from "../body-navigation";

/** Weight offers no `all` range; `weight-and-body.md` names these four. */
const weightRanges: readonly ChartRange[] = [
  "week",
  "month",
  "quarter",
  "year",
];

const rangeLabels: Readonly<Record<ChartRange, string>> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

export function WeightView({
  progress,
  initialRange,
}: {
  progress: WeightProgress;
  initialRange: ChartRange;
}) {
  const router = useRouter();
  const [view, setView] = useState(progress);
  const [range, setRange] = useState<ChartRange>(initialRange);
  const [pending, startTransition] = useTransition();
  const { overview, series } = view;
  const weekly = series.companion?.points ?? [];

  const reload = (next: ChartRange) => {
    setRange(next);
    startTransition(async () => {
      const result = await getWeightProgressAction({ range: next });
      if (result.ok) setView(result.value);
    });
  };

  const addTrigger = (
    <button
      type="button"
      aria-label="Add weigh-in"
      className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-[var(--pf-border)] px-3.5 text-[13.5px] font-semibold text-[var(--pf-accent)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-accent)]"
    >
      <Icon name="plus" size={14} />
      Add
    </button>
  );

  const addOverlay = (
    <BodyEntryOverlay
      trigger={addTrigger}
      title="Add weigh-in"
      valueLabel="Weight (kg)"
      placeholder="81.0"
      hint="Up to two decimals."
      localDate={overview.localDate}
      saveLabel="Save weigh-in"
      onSave={async ({ entryDate, value }) => {
        const result = await createWeightEntryAction({
          entryDate,
          weightKg: value,
        });
        if (!result.ok) return { ok: false, message: result.error.message };
        router.refresh();
        return { ok: true, toast: "Weigh-in saved." };
      }}
    />
  );

  return (
    <PageFrame
      title="Body"
      action={<BodyCount count={overview.entries.length} noun="weigh-in" />}
      pinned={<BodyNavigation />}
      className="gap-3.5 pt-4.5"
    >
      {overview.latest === null ? (
        <>
          <EmptyState
            icon="scale"
            title="No weigh-in yet"
            body="Record a weigh-in and this screen starts tracking your weekly average."
          />
          <div className="flex justify-center">{addOverlay}</div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Latest"
              value={formatKg(overview.latest.weightKg)}
              detail={
                <>
                  {formatHistoryDate(overview.latest.entryDate)}
                  {overview.latest.changeKg === null
                    ? null
                    : ` · ${formatChangeKg(overview.latest.changeKg)} since the previous weigh-in`}
                </>
              }
            />
            {overview.currentWeek ? (
              <StatCard
                label="This week"
                value={formatAverageKg(overview.currentWeek.averageKg)}
                detail={
                  <>
                    {overview.currentWeek.changeKg === null
                      ? noPreviousWeek
                      : `${formatChangeKg(overview.currentWeek.changeKg)} vs last week`}
                    {" · "}
                    {formatRecordedDays(overview.currentWeek.recordedDays)}
                    {" · "}
                    {weekStatusLabel(overview.currentWeek)}
                  </>
                }
              />
            ) : (
              <StatCard
                label="This week"
                value="—"
                detail="No weigh-in this week yet"
              />
            )}
          </div>

          <Kicker className="mt-1">Trend</Kicker>
          <div
            role="group"
            aria-label="Time range"
            className="flex flex-wrap gap-2"
          >
            {weightRanges.map((option) => (
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
              noun="weigh-in"
              emptyMessage="No weigh-in falls inside this range."
              formatValue={formatKg}
            />
            {weekly.length > 0 ? (
              <div className="mt-1.5">
                <Collapsible label="Weekly averages">
                  <ul aria-label="Weekly averages" className="flex flex-col">
                    {weekly.map((point, index) => (
                      <li key={point.date}>
                        <DataRow
                          first={index === 0}
                          label={weeklyLabel(point)}
                          value={formatAverageKg(point.value)}
                        />
                      </li>
                    ))}
                  </ul>
                </Collapsible>
              </div>
            ) : null}
          </section>

          <div className="mt-1 flex min-h-11 items-center justify-between gap-3">
            <Kicker>Weigh-ins</Kicker>
            {addOverlay}
          </div>
          <ul className="flex flex-col gap-2" aria-label="Weigh-ins">
            {overview.entries.map((entry, index) => (
              <li key={entry.id}>
                <Link
                  href={`/body/weight/${entry.entryDate}/edit`}
                  style={rowStagger(index)}
                  className="flex min-h-[62px] items-center gap-3 rounded-[var(--pf-r2)] border border-[var(--pf-bg-surface)] bg-[var(--pf-bg-surface)] pr-3 pl-[18px] transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] hover:border-[var(--pf-border-strong)] active:scale-[0.99] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both]"
                >
                  <span className="pf-numeric shrink-0 text-[19px] font-semibold">
                    {formatKg(entry.weightKg)}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-[var(--pf-text-3)]">
                    {formatHistoryDate(entry.entryDate)}
                    {entry.changeKg === null
                      ? null
                      : ` · ${formatChangeKg(entry.changeKg)}`}
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
    </PageFrame>
  );
}

function weeklyLabel(point: ChartSeries["points"][number]): string {
  const start = formatHistoryDate(point.span?.start ?? point.date);
  if (!point.span) return `Week of ${start}`;
  const recorded = formatRecordedDays(point.span.recordedDays);
  return `Week of ${start} · ${recorded}${point.span.provisional ? " · provisional" : ""}`;
}
