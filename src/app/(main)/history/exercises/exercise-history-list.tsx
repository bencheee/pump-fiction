"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { WorkoutSet } from "@/features/active-workout/domain/workout";
import { isRecordedSet } from "@/features/history/domain/exercise-statistics";
import type { ExerciseHistoryEntry } from "@/features/history/domain/exercise-statistics";
import { ListRow, SearchField } from "@/shared/ui";

import { HistoryPanel } from "../history-frame";
import { formatCount, formatHistoryDate } from "../history-presentation";

/*
 * The History list's Exercises tab — the prototype's screen 4, second tab —
 * ported for step 8 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 304-325, `data-screen-label="History list"`
 *   bound values  lines 2040-2054 (`exerciseRows`), 2187-2196
 *
 * Search filters the loaded list in the browser, as it always has: one
 * person's library stays small enough that a round trip per keystroke would
 * cost more than it saves. The prototype filters the same way.
 */
export function ExerciseHistoryList({
  entries,
}: {
  entries: readonly ExerciseHistoryEntry[];
}) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      trimmed === ""
        ? entries
        : entries.filter((entry) =>
            entry.exerciseName.toLowerCase().includes(trimmed),
          ),
    [entries, trimmed],
  );
  // `rowAnim("xrows", `${tab}|${q}|${exKeys.length}`, i)` (line 2051): the
  // entrance runs again each time the filter narrows, and the `A`/`B` pair
  // alternates so it restarts on the rows that stayed.
  const rowAnim = useRowAnimation(trimmed);

  return (
    <HistoryPanel>
      <SearchField
        label="Filter exercises by name"
        placeholder="Filter by name"
        value={query}
        onChange={setQuery}
      />
      {matches.length === 0 ? (
        <p data-note-card="">
          {entries.length === 0
            ? "No exercise history yet. Record a set in a workout and that exercise appears here."
            : "No exercise with a recorded set matches that name."}
        </p>
      ) : (
        <ul data-history-list="" data-row-anim={rowAnim}>
          {matches.map((entry, index) => (
            <li
              key={entry.exerciseIdentityId}
              style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
            >
              <ListRow
                href={`/history/exercises/${entry.exerciseIdentityId}`}
                title={entry.exerciseName}
                detail={latestSummary(entry)}
                badge={
                  entry.stillInLibrary ? undefined : "No longer in the library"
                }
              />
            </li>
          ))}
        </ul>
      )}
    </HistoryPanel>
  );
}

/**
 * `x.detail` (line 2049): the latest performance, its best set, and how many
 * performances stand behind the row. The best set is the heaviest by volume,
 * which is the prototype's own sort, read through the application's own load
 * vocabulary — a band, an assistance mode and a seconds-measured set all
 * carry their own words.
 */
function latestSummary(entry: ExerciseHistoryEntry): string {
  const latest = entry.latestPerformance;
  if (latest === null) return "No eligible performance yet";
  const best = latest.sets
    .filter(isRecordedSet)
    .reduce<WorkoutSet | null>(
      (top, set) => (top === null || volumeOf(set) > volumeOf(top) ? set : top),
      null,
    );
  return [
    formatHistoryDate(latest.workoutDate),
    best === null ? "Recorded" : formatSetSummary(best, latest.measurementType),
    formatCount(entry.performanceCount, "performance"),
  ].join(" · ");
}

function volumeOf(set: WorkoutSet): number {
  return (set.loadKg ?? 0) * (set.reps ?? 0);
}

function useRowAnimation(signature: string): "A" | "B" {
  const [memory, setMemory] = useState(() => ({ signature, n: 0 }));
  if (memory.signature !== signature) setMemory({ signature, n: memory.n + 1 });
  return memory.n % 2 ? "B" : "A";
}
