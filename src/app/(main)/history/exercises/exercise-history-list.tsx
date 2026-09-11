"use client";

import { useMemo, useState } from "react";

import { formatSetSummary } from "@/features/active-workout/ui/workout-presentation";
import type { ExerciseHistoryEntry } from "@/features/history/domain/exercise-statistics";
import { Badge, EmptyState, ListRow, PageFrame, TextField } from "@/shared/ui";

import { formatHistoryDate } from "../history-presentation";

/**
 * Search filters the loaded list in the browser. One person's library stays
 * small enough that a round trip per keystroke would cost more than it saves.
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

  return (
    <PageFrame title="Exercises" className="pt-6">
      {entries.length === 0 ? (
        <EmptyState
          title="No exercise history yet"
          body="Record a set in a workout and that exercise appears here."
        />
      ) : (
        <>
          <TextField
            id="exercise-search"
            label="Search"
            type="search"
            autoComplete="off"
            placeholder="Filter by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {matches.length === 0 ? (
            <EmptyState
              title="No matching exercise"
              body="No exercise with a recorded set matches that name."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {matches.map((entry) => (
                <li key={entry.exerciseIdentityId}>
                  <ListRow
                    href={`/history/exercises/${entry.exerciseIdentityId}`}
                    title={entry.exerciseName}
                    detail={
                      <span className="flex flex-wrap items-center gap-2">
                        <span>{latestSummary(entry)}</span>
                        {entry.stillInLibrary ? null : (
                          <Badge>No longer in the library</Badge>
                        )}
                      </span>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PageFrame>
  );
}

function latestSummary(entry: ExerciseHistoryEntry): string {
  const latest = entry.latestPerformance;
  if (latest === null) return "No eligible performance yet";
  const best = latest.sets
    .filter((set) => set.loadMode !== null && set.reps !== null)
    .map((set) => formatSetSummary(set, latest.measurementType));
  return [formatHistoryDate(latest.workoutDate), best.at(0) ?? "Recorded"].join(
    " · ",
  );
}
