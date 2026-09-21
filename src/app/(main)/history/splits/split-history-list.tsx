"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

import type { SplitHistory } from "@/features/history/application/split-statistics-operations";
import { Chip, ListRow } from "@/shared/ui";

import { HistoryPanel } from "../history-frame";
import {
  formatCount,
  formatHistoryDate,
  formatHistoryDuration,
} from "../history-presentation";

/*
 * The History list's Splits tab — the prototype's screen 4, third tab —
 * ported for step 8 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 323-343, `data-screen-label="History list"`
 *   bound values  lines 2056-2075 (`programChips`, `splitRows`), 2197-2198
 */
export function SplitHistoryList({ history }: { history: SplitHistory }) {
  const [programId, setProgramId] = useState<string | null>(null);
  const shown =
    programId === null
      ? history.splits
      : history.splits.filter((split) => split.programIdentityId === programId);
  // `rowAnim("srows", `${tab}|${s.programFilter}|${shownSplits.length}`, i)`
  // (line 2072): choosing a program runs the entrance again.
  const rowAnim = useRowAnimation(programId ?? "");

  return (
    <HistoryPanel>
      {/* `showProgramChips` (line 2196) is `programs.length > 1`: with one
          program the row would hold `All programs` and that program, which
          says nothing. The prototype computes the value and its markup does
          not read it; the Owner settled on the value (2026-09-21). */}
      {history.programs.length > 1 ? (
        <div role="group" aria-label="Program" data-history-programs="">
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
        <p data-history-note="">
          {/* `noSplits` (line 2198) is only the filtered emptiness: the
              prototype draws nothing at all when there is no split history,
              which leaves the tab blank. The second sentence is the
              application's own, in the prototype's own card. */}
          {history.splits.length === 0
            ? "No split history yet. Complete a split workout and that split appears here with its durations."
            : "No split in this program yet. Complete one of its splits and it appears here."}
        </p>
      ) : (
        <ul data-history-list="" data-row-anim={rowAnim}>
          {shown.map((split, index) => (
            <li
              key={split.splitIdentityId}
              style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
            >
              <ListRow
                variant="split"
                href={`/history/splits/${split.splitIdentityId}`}
                title={split.splitName}
                meta={split.programName}
                detail={[
                  formatCount(split.completedWorkoutCount, "workout"),
                  `avg ${formatHistoryDuration(split.averageDurationSeconds)}`,
                  formatHistoryDate(split.latestWorkoutDate),
                ].join(" · ")}
                badge={
                  split.stillExists ? undefined : "No longer in the program"
                }
              />
            </li>
          ))}
        </ul>
      )}
    </HistoryPanel>
  );
}

function useRowAnimation(signature: string): "A" | "B" {
  const [memory, setMemory] = useState(() => ({ signature, n: 0 }));
  if (memory.signature !== signature) setMemory({ signature, n: memory.n + 1 });
  return memory.n % 2 ? "B" : "A";
}
