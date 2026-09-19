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
      <Link href="/exercises/new" aria-label="Add exercise">
        <Icon name="plus" size={20} />
      </Link>

      <form action="/exercises" method="get">
        <label htmlFor="exercise-search">Search exercises</label>
        <Icon name="search" size={18} />
        <input
          id="exercise-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search exercises"
        />
      </form>

      <p>Definitions only. Personal records and charts live in History.</p>

      {!result.ok ? (
        <EmptyState
          title="Exercises couldn't be loaded"
          body={result.error.message}
          action={<Link href={queryHref(query)}>Retry</Link>}
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
            !query ? <Link href="/exercises/new">Add Exercise</Link> : undefined
          }
        />
      ) : (
        <div>
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
