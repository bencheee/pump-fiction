"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { listExercisesAction } from "@/app/actions/exercises";
import type { Exercise } from "@/features/exercises/domain/exercise";
import { exerciseTypeLabels } from "@/features/exercises/ui/exercise-presentation";
import { Action, Icon, Sheet, TextField } from "@/shared/ui";

/*
 * Moved out of `active-workout-experience.tsx` in step 4 of
 * docs/design/redesign-v2/PLAN.md, unchanged but for the `trigger` prop: the
 * set queue's empty state opens the same picker from its own pill, and the
 * overview opens it from the button it has always had. Its panel is the
 * prototype's screen 28 and is ported in step 6.
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
      title="Add Exercise"
      description="Choose from your active library. This workout only."
      onOpenChange={(open) => {
        if (open) void loadExercises();
      }}
      trigger={
        trigger ?? (
          <button type="button">
            <Icon name="plus" size={18} /> Add Exercise
          </button>
        )
      }
    >
      {(close) => (
        <div>
          <TextField
            id="add-exercise-search"
            label="Search active library"
            placeholder="Search active library"
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          <p>Archived exercises are not listed.</p>
          {loading ? (
            <p role="status">
              <Icon name="loader-circle" size={16} /> Loading exercises…
            </p>
          ) : error ? (
            <div>
              <p role="alert">{error}</p>
              <button type="button" onClick={() => void loadExercises()}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p>No active exercise matches this search.</p>
          ) : (
            <div>
              {filtered.map((exercise) => {
                const isSelected = selected.includes(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={exercise.name}
                    onClick={() => toggle(exercise.id)}
                  >
                    <span aria-hidden="true">
                      <Icon name="check" size={13} />
                    </span>
                    <span>
                      <span>{exercise.name}</span>
                      <span>
                        {exerciseTypeLabels[exercise.baseType]} ·{" "}
                        {exercise.allowedLoadModes.length}{" "}
                        {exercise.allowedLoadModes.length === 1
                          ? "mode"
                          : "modes"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <Action
            disabled={selected.length === 0 || exercises === null}
            onClick={() => {
              onAdd(
                (exercises ?? []).filter((exercise) =>
                  selected.includes(exercise.id),
                ),
              );
              setSelected([]);
              close();
            }}
          >
            Add Selected
          </Action>
        </div>
      )}
    </Sheet>
  );
}
