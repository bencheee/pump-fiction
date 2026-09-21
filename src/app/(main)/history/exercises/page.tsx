import Link from "next/link";

import { listExerciseHistory } from "@/server/application/workout-history";

import { HistoryCount, HistoryPanel } from "../history-frame";
import { formatCount } from "../history-presentation";
import { ExerciseHistoryList } from "./exercise-history-list";

export const dynamic = "force-dynamic";

export default async function ExerciseHistoryPage() {
  const result = await listExerciseHistory();

  if (!result.ok) {
    return (
      <HistoryPanel>
        <p data-history-note="">
          {result.error.message}
          <Link href="/history/exercises">Try again</Link>
        </p>
      </HistoryPanel>
    );
  }

  return (
    <>
      {/* `tabCount` (line 2183) counts the library, not the filtered list. */}
      <HistoryCount>
        {formatCount(result.value.length, "exercise")}
      </HistoryCount>
      <ExerciseHistoryList entries={result.value} />
    </>
  );
}
