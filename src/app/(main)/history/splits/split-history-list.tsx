"use client";

import { useState } from "react";

import type { SplitHistory } from "@/features/history/application/split-statistics-operations";
import { Badge, Chip, EmptyState, ListRow, PageFrame } from "@/shared/ui";

import {
  formatHistoryDate,
  formatHistoryDuration,
} from "../history-presentation";

export function SplitHistoryList({ history }: { history: SplitHistory }) {
  const [programId, setProgramId] = useState<string | null>(null);
  const shown =
    programId === null
      ? history.splits
      : history.splits.filter((split) => split.programIdentityId === programId);

  return (
    <PageFrame title="Splits">
      {history.splits.length === 0 ? (
        <EmptyState
          title="No split history yet"
          body="Complete a split workout and that split appears here with its durations."
        />
      ) : (
        <>
          {history.programs.length > 1 ? (
            <div role="group" aria-label="Program">
              <Chip
                selected={programId === null}
                onClick={() => setProgramId(null)}
              >
                All programs
              </Chip>
              {history.programs.map((program) => (
                <Chip
                  key={program.programIdentityId}
                  selected={programId === program.programIdentityId}
                  onClick={() => setProgramId(program.programIdentityId)}
                >
                  {program.programName}
                </Chip>
              ))}
            </div>
          ) : null}
          {shown.length === 0 ? (
            <EmptyState
              title="No split in this program yet"
              body="Complete one of its splits and it appears here."
            />
          ) : (
            <ul>
              {shown.map((split) => (
                <li key={split.splitIdentityId}>
                  <ListRow
                    href={`/history/splits/${split.splitIdentityId}`}
                    title={split.splitName}
                    detail={
                      <span>
                        <span>
                          {split.programName} ·{" "}
                          {split.completedWorkoutCount === 1
                            ? "1 workout"
                            : `${split.completedWorkoutCount} workouts`}{" "}
                          · avg{" "}
                          {formatHistoryDuration(split.averageDurationSeconds)}{" "}
                          · {formatHistoryDate(split.latestWorkoutDate)}
                        </span>
                        {split.stillExists ? null : (
                          <Badge>No longer in the program</Badge>
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
