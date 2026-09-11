import Link from "next/link";

import { listWorkoutHistory } from "@/server/application/workout-history";
import { EmptyState, ListRow, PageFrame } from "@/shared/ui";

import { formatHistoryMonth, summaryDetail } from "../history-presentation";

export const dynamic = "force-dynamic";

export default async function WorkoutHistoryPage() {
  const result = await listWorkoutHistory();

  if (!result.ok) {
    return (
      <PageFrame title="Workouts" className="pt-6">
        <EmptyState
          title="History couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/workouts"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  const months = result.value;

  return (
    <PageFrame title="Workouts" className="pt-6">
      {months.length === 0 ? (
        <EmptyState
          title="No saved workouts yet"
          body="Finish a workout and it appears here, newest first."
        />
      ) : (
        months.map((group) => (
          <section key={group.month} className="flex flex-col gap-2">
            <h2 className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
              {formatHistoryMonth(group.month)}
            </h2>
            <ul className="flex flex-col gap-2">
              {group.workouts.map((workout) => (
                <li key={workout.id}>
                  <ListRow
                    href={`/history/workouts/${workout.id}`}
                    title={workout.name}
                    detail={summaryDetail(workout)}
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
