import Link from "next/link";

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
    <PageFrame title="Exercises">
      <Link
        href="/exercises/new"
        aria-label="Add exercise"
        className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-[var(--pf-gutter)] flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] text-[var(--pf-accent-strong)]"
      >
        <Icon name="plus" size={20} />
      </Link>

      <form action="/exercises" method="get" className="relative">
        <label htmlFor="exercise-search" className="sr-only">
          Search exercises
        </label>
        <Icon
          name="search"
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--pf-text-2)]"
        />
        <input
          id="exercise-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search exercises"
          className="min-h-[var(--pf-size-input)] w-full rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface-2)] pr-3 pl-10"
        />
      </form>

      <p className="text-[12.5px] leading-[1.45] text-[var(--pf-text-2)]">
        Definitions only. Personal records and charts live in History.
      </p>

      {!result.ok ? (
        <EmptyState
          title="Exercises couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href={queryHref(query)}
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      ) : exercises.length === 0 ? (
        <EmptyState
          title={query ? "No matching exercises" : "No exercises yet"}
          body={
            query
              ? "Try another search."
              : "Add your first reusable exercise definition."
          }
          action={
            !query ? (
              <Link
                href="/exercises/new"
                className="min-h-11 rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 py-3 font-semibold text-[var(--pf-on-accent)]"
              >
                Add Exercise
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <ListRow
              key={exercise.id}
              href={`/exercises/${exercise.id}/edit`}
              title={exercise.name}
              detail={`${exerciseTypeLabels[exercise.baseType]} · ${exercise.measurementType === "seconds" ? "Seconds" : "Reps"} · ${exercise.allowedLoadModes.length} ${exercise.allowedLoadModes.length === 1 ? "mode" : "modes"}`}
            />
          ))}
        </div>
      )}
    </PageFrame>
  );
}

function queryHref(query: string): string {
  return query ? `/exercises?q=${encodeURIComponent(query)}` : "/exercises";
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
