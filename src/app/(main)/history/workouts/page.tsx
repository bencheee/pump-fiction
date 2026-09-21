import Link from "next/link";
import type { CSSProperties } from "react";

import {
  workoutVolumeTrends,
  type HistoryWorkoutTrend,
} from "@/features/history/domain/workout-history";
import { listWorkoutHistory } from "@/server/application/workout-history";
import { Icon, ListRow } from "@/shared/ui";

import { HistoryCount, HistoryPanel } from "../history-frame";
import {
  formatCount,
  formatHistoryMonth,
  summaryDetail,
} from "../history-presentation";

/*
 * The History list's Workouts tab — the prototype's screen 4, first tab —
 * ported for step 8 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 279-302, `data-screen-label="History list"`
 *   bound values  lines 2007-2038 (`monthMap`), 2183 (`tabCount`), 2186
 *                 (`noWorkouts`)
 */
export const dynamic = "force-dynamic";

export default async function WorkoutHistoryPage() {
  const result = await listWorkoutHistory();

  if (!result.ok) {
    return (
      <HistoryPanel>
        <p data-history-note="">
          {result.error.message}
          <Link href="/history/workouts">Try again</Link>
        </p>
      </HistoryPanel>
    );
  }

  const months = result.value;
  const total = months.reduce(
    (count, group) => count + group.workouts.length,
    0,
  );
  const trends = workoutVolumeTrends(months);
  // `rowIndex` (line 2009) runs across the months, not within one, so the
  // entrance staggers down the whole list.
  const rowIndexes = new Map(
    months
      .flatMap((group) => group.workouts)
      .map((workout, index) => [workout.id, index]),
  );

  return (
    <>
      <HistoryCount>{formatCount(total, "workout")}</HistoryCount>
      <HistoryPanel>
        {months.map((group) => (
          <section key={group.month} data-history-month="">
            <h2>{formatHistoryMonth(group.month)}</h2>
            <ul data-history-list="">
              {group.workouts.map((workout) => (
                <li
                  key={workout.id}
                  style={
                    {
                      "--row-index": Math.min(
                        rowIndexes.get(workout.id) ?? 0,
                        9,
                      ),
                    } as CSSProperties
                  }
                >
                  <ListRow
                    href={`/history/workouts/${workout.id}`}
                    title={workout.name}
                    detail={summaryDetail(workout)}
                    trailing={<Trend trend={trends.get(workout.id)} />}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {total === 0 ? (
          <div data-history-empty="">
            <Icon name="history" />
            <h2>No saved workouts yet</h2>
            <p>Finish a workout and it appears here, newest first.</p>
          </div>
        ) : null}
      </HistoryPanel>
    </>
  );
}

/**
 * `w.trend` (lines 2027-2030). A workout with nothing to compare against, or
 * one that lands on the same whole percent, carries no badge at all.
 */
function Trend({ trend }: { trend?: HistoryWorkoutTrend }) {
  if (trend === undefined) return null;
  return (
    <span data-history-trend={trend.rising ? "rising" : "falling"}>
      <Icon name={trend.rising ? "trending-up" : "trending-down"} size={12} />
      {`${trend.rising ? "+" : ""}${trend.percent}%`}
      {/* The prototype names the row `w.name` and so says none of this; the
          row here reads its own contents, and a bare percentage does not say
          what it measures. The words are the application's own metric
          label. */}
      <span data-history-trend-meaning="">{" workout volume"}</span>
    </span>
  );
}
