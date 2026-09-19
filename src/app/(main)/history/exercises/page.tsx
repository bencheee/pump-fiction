import Link from "next/link";

import { listExerciseHistory } from "@/server/application/workout-history";
import { EmptyState, PageFrame } from "@/shared/ui";

import { ExerciseHistoryList } from "./exercise-history-list";

export const dynamic = "force-dynamic";

export default async function ExerciseHistoryPage() {
  const result = await listExerciseHistory();

  if (!result.ok) {
    return (
      <PageFrame title="Exercises">
        <EmptyState
          title="Exercise history couldn't be loaded"
          body={result.error.message}
          action={<Link href="/history/exercises">Retry</Link>}
        />
      </PageFrame>
    );
  }

  return <ExerciseHistoryList entries={result.value} />;
}
