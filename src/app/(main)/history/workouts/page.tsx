import Link from "next/link";

import { listWorkoutHistory } from "@/server/application/workout-history";
import { EmptyState, Kicker, ListRow, PageFrame } from "@/shared/ui";

import { HistoryNavigation } from "../history-navigation";
import { HistoryCount } from "../history-count";
import { formatHistoryMonth, summaryDetail } from "../history-presentation";

export const dynamic = "force-dynamic";

export default async function WorkoutHistoryPage() {
  const result = await listWorkoutHistory();

  if (!result.ok) {
    return (
      <PageFrame title="History" pinned={<HistoryNavigation />}>
        <EmptyState
          icon="circle-alert"
          title="History couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/workouts"
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  const months = result.value;
  const total = months.reduce(
    (count, group) => count + group.workouts.length,
    0,
  );
  let row = 0;

  return (
    <PageFrame
      title="History"
      action={<HistoryCount count={total} noun="workout" />}
      pinned={<HistoryNavigation />}
      className="gap-3 pt-4.5"
    >
      {months.length === 0 ? (
        <EmptyState
          icon="history"
          title="No saved workouts yet"
          body="Finish a workout and it appears here, newest first."
        />
      ) : (
        months.map((group) => (
          <section key={group.month} className="flex flex-col gap-2">
            <Kicker>{formatHistoryMonth(group.month)}</Kicker>
            <ul className="flex flex-col gap-2">
              {group.workouts.map((workout) => (
                <li key={workout.id}>
                  <ListRow
                    href={`/history/workouts/${workout.id}`}
                    title={workout.name}
                    detail={summaryDetail(workout)}
                    index={row++}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </PageFrame>
  );
}
