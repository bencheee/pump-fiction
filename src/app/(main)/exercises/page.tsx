import Link from "next/link";

import { exerciseTypeLabels } from "@/features/exercises/ui/exercise-presentation";
import { listExercises } from "@/server/application/exercises";
import { EmptyState, Icon, ListRow, PageFrame } from "@/shared/ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string | string[];
  status?: string | string[];
}>;

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = first((await searchParams).q).trim();
  const status =
    first((await searchParams).status) === "archived" ? "archived" : "active";
  const result = await listExercises(status === "archived");
  const exercises = result.ok
    ? result.value.filter(
        (exercise) =>
          exercise.status === status &&
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
        {status === "archived" ? (
          <input type="hidden" name="status" value="archived" />
        ) : null}
      </form>

      <nav aria-label="Exercise status" className="flex gap-2">
        <FilterLink
          href={queryHref("active", query)}
          selected={status === "active"}
        >
          Active
        </FilterLink>
        <FilterLink
          href={queryHref("archived", query)}
          selected={status === "archived"}
        >
          Archived
        </FilterLink>
      </nav>

      <p className="text-[12.5px] leading-[1.45] text-[var(--pf-text-2)]">
        Definitions only. Personal records and charts live in History.
      </p>

      {!result.ok ? (
        <EmptyState
          title="Exercises couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href={queryHref(status, query)}
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      ) : exercises.length === 0 ? (
        <EmptyState
          title={query ? "No matching exercises" : `No ${status} exercises`}
          body={
            query
              ? "Try another search or switch the status filter."
              : status === "active"
                ? "Add your first reusable exercise definition."
                : "Archived exercises will appear here."
          }
          action={
            status === "active" && !query ? (
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
              detail={`${exerciseTypeLabels[exercise.baseType]} · ${exercise.allowedLoadModes.length} ${exercise.allowedLoadModes.length === 1 ? "mode" : "modes"}`}
            />
          ))}
        </div>
      )}
    </PageFrame>
  );
}

function FilterLink({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`min-h-11 rounded-[var(--pf-r-pill)] border px-4 py-3 text-sm font-semibold ${
        selected
          ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent-dim)] text-[var(--pf-accent-strong)]"
          : "border-[var(--pf-border-control)] text-[var(--pf-text-2)]"
      }`}
    >
      {children}
    </Link>
  );
}

function queryHref(status: "active" | "archived", query: string): string {
  const params = new URLSearchParams();
  if (status === "archived") params.set("status", status);
  if (query) params.set("q", query);
  const suffix = params.toString();
  return suffix ? `/exercises?${suffix}` : "/exercises";
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
