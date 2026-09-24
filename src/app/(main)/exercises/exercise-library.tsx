"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

import type { Exercise } from "@/features/exercises/domain/exercise";
import { exerciseDefinitionDetail } from "@/features/exercises/ui/exercise-presentation";
import { ListRow, PageFrame, SearchField } from "@/shared/ui";

/*
 * The Exercise library — the prototype's screen 13 — ported for step 16 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 898-933, `data-screen-label="Exercises"`
 *   bound values  lines 2722-2737 (`defsSorted`, `defsFound`, the letter
 *                 groups), 2993-3001 (`xQuery` … `dfAdd`), 1782 (`defDetail`)
 *
 * The search filters the loaded library in the browser, as the prototype does
 * and as the History list's exercises tab does: one person's library stays
 * small enough that a round trip per keystroke would cost more than it saves.
 */
export function ExerciseLibrary({
  exercises,
  add,
}: {
  exercises: readonly Exercise[];
  /** The title bar's add button, drawn by the page. */
  add: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  /* `defsSorted`, `defsFound` and the groups (2723-2736): by name, under the
     letter each name starts with. */
  const groups = useMemo(() => {
    const found = [...exercises]
      .sort((left, right) => left.name.localeCompare(right.name))
      .filter(
        (exercise) =>
          trimmed === "" || exercise.name.toLowerCase().includes(trimmed),
      );
    const result: { letter: string; rows: Exercise[] }[] = [];
    for (const exercise of found) {
      const letter = (exercise.name[0] ?? "#").toUpperCase();
      const last = result.at(-1);
      if (last?.letter === letter) last.rows.push(exercise);
      else result.push({ letter, rows: [exercise] });
    }
    return result;
  }, [exercises, trimmed]);
  const count = groups.reduce((sum, group) => sum + group.rows.length, 0);

  // `rowAnim("dfl", `${q}|${defsFound.length}|…`, rowIndex)` (2733): the
  // entrance runs again as the search narrows, the `A`/`B` pair alternating
  // so it restarts on the rows that stayed, and the stagger counts across
  // the letters rather than starting again under each.
  const rowAnim = useRowAnimation(`${trimmed}|${count}`);
  let rowIndex = 0;

  return (
    <PageFrame
      screen="exercises"
      title="Exercises"
      trailing={add}
      under={
        <div data-exercises-search="">
          <SearchField
            label="Search exercises"
            placeholder="Search exercises"
            value={query}
            onChange={setQuery}
          />
        </div>
      }
    >
      <p data-exercises-lead="">
        Definitions only. Personal records and charts live in History.
      </p>

      {exercises.length === 0 ? (
        // An empty library, which the prototype has no screen for.
        <p data-note-card="">
          Add your first reusable exercise definition.
          <Link href="/exercises/new">Add exercise</Link>
        </p>
      ) : count === 0 ? (
        /* `dfNoResults` (line 929). */
        <p data-note-card="">No exercise matches this search.</p>
      ) : (
        groups.map((group) => (
          <section
            key={group.letter}
            data-exercises-group=""
            data-row-anim={rowAnim}
            aria-label={group.letter}
          >
            <p aria-hidden="true">{group.letter}</p>
            <ul>
              {group.rows.map((exercise) => {
                const index = Math.min(rowIndex, 9);
                rowIndex += 1;
                return (
                  <li
                    key={exercise.id}
                    style={{ "--row-index": index } as CSSProperties}
                  >
                    <ListRow
                      href={`/exercises/${exercise.id}/edit`}
                      variant="definition"
                      title={exercise.name}
                      detail={exerciseDefinitionDetail(exercise)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </PageFrame>
  );
}

function useRowAnimation(signature: string): "A" | "B" {
  const [memory, setMemory] = useState(() => ({ signature, n: 0 }));
  if (memory.signature !== signature) setMemory({ signature, n: memory.n + 1 });
  return memory.n % 2 ? "B" : "A";
}
