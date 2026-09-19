import Link from "next/link";

import { listWorkoutHistory } from "@/server/application/workout-history";
import { EmptyState, ListRow, PageFrame } from "@/shared/ui";

import { formatHistoryMonth, summaryDetail } from "../history-presentation";

export const dynamic = "force-dynamic";

export default async function WorkoutHistoryPage() {
  const result = await listWorkoutHistory();

  if (!result.ok) {
    return (
      <PageFrame title="Workouts">
        <EmptyState
          title="History couldn't be loaded"
          body={result.error.message}
          action={<Link href="/history/workouts">Retry</Link>}
        />
      </PageFrame>
    );
  }

  const months = result.value;

  return (
    <PageFrame title="Workouts">
      {months.length === 0 ? (
        <EmptyState
          title="No saved workouts yet"
          body="Finish a workout and it appears here, newest first."
        />
      ) : (
        months.map((group) => (
          <section key={group.month}>
            <h2>{formatHistoryMonth(group.month)}</h2>
            <ul>
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
