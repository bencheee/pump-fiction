import Link from "next/link";

import type { Exercise } from "@/features/exercises/domain/exercise";
import { exerciseTypeLabels } from "@/features/exercises/ui/exercise-presentation";
import { listExercises } from "@/server/application/exercises";
import { EmptyState, Icon, ListRow, PageFrame } from "@/shared/ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string | string[] }>;

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = first((await searchParams).q).trim();
  const result = await listExercises();
  const exercises = result.ok
    ? result.value.filter((exercise) =>
        exercise.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      )
    : [];

  return (
    <PageFrame
      title="Exercises"
      action={
        <Link
          href="/exercises/new"
          aria-label="Add exercise"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--pf-border)] text-[var(--pf-accent)] transition-[background-color,border-color] duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-accent)] hover:bg-[var(--pf-accent-dim)]"
        >
          <Icon name="plus" size={18} />
        </Link>
      }
      pinned={
        <form action="/exercises" method="get" className="relative">
          <label htmlFor="exercise-search" className="sr-only">
            Search exercises
          </label>
          <input
            id="exercise-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search exercises"
            className="h-[var(--pf-size-search)] w-full rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[46px] text-[16px] transition-colors duration-[var(--pf-mo-base)] ease-linear placeholder:text-[var(--pf-text-4)] focus:border-[var(--pf-border-strong)]"
          />
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute top-1/2 left-[18px] -translate-y-1/2 text-[var(--pf-text-4)]"
          />
          {query ? (
            <Link
              href="/exercises"
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-[var(--pf-text-3)]"
            >
              <Icon name="x" size={14} />
            </Link>
          ) : null}
        </form>
      }
      className="gap-3.5 pt-4"
    >
      <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
        Definitions only. Personal records and charts live in History.
      </p>

      {!result.ok ? (
        <EmptyState
          icon="circle-alert"
          title="Exercises couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href={queryHref(query)}
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
            >
              Retry
            </Link>
          }
        />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title={query ? "No matching exercises" : "No exercises yet"}
          body={
            query
              ? "No exercise matches this search."
              : "Add your first reusable exercise definition."
          }
          action={
            !query ? (
              <Link
                href="/exercises/new"
                className="mt-1 flex min-h-12 items-center rounded-full bg-[var(--pf-accent)] px-5 font-semibold text-[var(--pf-on-accent)]"
              >
                Add exercise
              </Link>
            ) : undefined
          }
        />
      ) : (
        groupByInitial(exercises).map(([letter, group]) => (
          <section key={letter} className="flex flex-col gap-2">
            <p className="pf-numeric text-[13px] font-bold tracking-[0.14em] text-[var(--pf-glyph-dim)]">
              {letter}
            </p>
            {group.map((exercise, index) => (
              <ListRow
                key={exercise.id}
                index={index}
                href={`/exercises/${exercise.id}/edit`}
                title={exercise.name}
                detail={`${exerciseTypeLabels[exercise.baseType]} · ${exercise.measurementType === "seconds" ? "Seconds" : "Reps"} · ${exercise.allowedLoadModes.length} ${exercise.allowedLoadModes.length === 1 ? "mode" : "modes"}`}
              />
            ))}
          </section>
        ))
      )}
    </PageFrame>
  );
}

/** The design files the library under the initial of each definition's name. */
function groupByInitial(
  exercises: readonly Exercise[],
): [string, Exercise[]][] {
  const groups = new Map<string, Exercise[]>();
  for (const exercise of exercises) {
    const letter = (exercise.name.trim()[0] ?? "#").toLocaleUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), exercise]);
  }
  return [...groups.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function queryHref(query: string): string {
  return query ? `/exercises?q=${encodeURIComponent(query)}` : "/exercises";
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
