import Link from "next/link";

import { listExerciseHistory } from "@/server/application/workout-history";
import { EmptyState, PageFrame } from "@/shared/ui";

import { HistoryNavigation } from "../history-navigation";

import { ExerciseHistoryList } from "./exercise-history-list";

export const dynamic = "force-dynamic";

export default async function ExerciseHistoryPage() {
  const result = await listExerciseHistory();

  if (!result.ok) {
    return (
      <PageFrame title="History" pinned={<HistoryNavigation />}>
        <EmptyState
          icon="circle-alert"
          title="Exercise history couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/history/exercises"
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
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
