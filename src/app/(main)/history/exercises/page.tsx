import Link from "next/link";

import { listExerciseHistory } from "@/server/application/workout-history";
import { EmptyState, PageFrame } from "@/shared/ui";

import { ExerciseHistoryList } from "./exercise-history-list";

export const dynamic = "force-dynamic";

export default async function ExerciseHistoryPage() {
  const result = await listExerciseHistory();

  if (!result.ok) {
    return (
      <PageFrame title="Exercises" className="pt-6">
        <EmptyState
          title="Exercise history couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/exercises"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  return <ExerciseHistoryList entries={result.value} />;
}
