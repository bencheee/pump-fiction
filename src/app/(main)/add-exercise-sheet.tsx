"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { listExercisesAction } from "@/app/actions/exercises";
import type { Exercise } from "@/features/exercises/domain/exercise";
import { exerciseTypeLabels } from "@/features/exercises/ui/exercise-presentation";
import { Icon, Sheet } from "@/shared/ui";

import "./add-exercise-sheet.css";

/*
 * The Add exercise panel — the prototype's screen 28 — ported for step 6 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 1414-1445, `data-screen-label="Add exercise"`
 *   bound values  lines 3225-3235 (`library`), 3468-3483
 *
 * Two things the application knows that the prototype does not. Its `LIBRARY`
 * (line 1710) is a constant on the state machine; here it is fetched when the
 * panel opens, so the list also has a loading and a failed state, both written
 * as the panel's own note paragraph. And `addPicked` (3473) returns early when
 * nothing is picked, which is what the disabled pill does here.
 */
export function AddExerciseSheet({
  initialExercises,
  trigger,
  onAdd,
}: {
  initialExercises?: readonly Exercise[];
  trigger?: ReactElement;
  onAdd: (exercises: readonly Exercise[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [exercises, setExercises] = useState<readonly Exercise[] | null>(
    initialExercises ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  async function loadExercises() {
    if (exercises !== null || loading) return;
    setLoading(true);
    setError(undefined);
    const result = await listExercisesAction();
    if (result.ok) setExercises(result.value);
    else setError(result.error.message);
    setLoading(false);
  }
  const filtered = (exercises ?? []).filter((exercise) =>
    exercise.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <Sheet
      panel="add-exercise"
      title="Add exercise"
      description="Your active library. This workout only."
      onOpenChange={(open) => {
        if (open) void loadExercises();
        else {
          // `closeSheet` (3461) leaves the draft behind; `addPicked` (3479)
          // clears both. Reopening the picker starts from nothing either way.
          setSelected([]);
          setQuery("");
        }
      }}
      trigger={
        trigger ?? (
          <button type="button">
            <Icon name="plus" size={18} /> Add exercise
          </button>
        )
      }
    >
      {(close) => (
        <>
          <div data-add-search="">
            <input
              type="search"
              aria-label="Search active library"
              placeholder="Search active library"
              value={query}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Icon name="search" size={17} />
          </div>

          <div data-add-library="">
            {loading ? (
              <p data-add-note="" role="status">
                <Icon name="loader-circle" size={16} />
                Loading exercises…
              </p>
            ) : error !== undefined ? (
              <p data-add-note="" role="alert">
                {error}
                <button
                  type="button"
                  data-add-retry=""
                  onClick={() => void loadExercises()}
                >
                  Retry
                </button>
              </p>
            ) : filtered.length === 0 ? (
              <p data-add-note="">No active exercise matches this search.</p>
            ) : (
              filtered.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  data-add-row=""
                  aria-pressed={selected.includes(exercise.id)}
                  aria-label={exercise.name}
                  onClick={() => toggle(exercise.id)}
                >
                  <span data-add-check="">
                    <Icon name="check" size={13} />
                  </span>
                  <span data-add-text="">
                    <span data-add-name="">{exercise.name}</span>
                    <span data-add-meta="">
                      {exerciseTypeLabels[exercise.baseType]} ·{" "}
                      {exercise.allowedLoadModes.length}{" "}
                      {exercise.allowedLoadModes.length === 1
                        ? "mode"
                        : "modes"}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            data-add-submit=""
            disabled={selected.length === 0 || exercises === null}
            aria-label="Add selected"
            title="Add selected"
            onClick={() => {
              onAdd(
                (exercises ?? []).filter((exercise) =>
                  selected.includes(exercise.id),
                ),
              );
              setSelected([]);
              setQuery("");
              close();
            }}
          >
            <Icon name="plus" size={18} />
            {selected.length === 0
              ? "Select exercises"
              : `Add ${selected.length} selected`}
          </button>
        </>
      )}
    </Sheet>
  );
}
