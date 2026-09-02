import { notFound } from "next/navigation";

import { getExercise } from "@/server/application/exercises";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { ExerciseForm } from "../../exercise-form";

export const dynamic = "force-dynamic";

export default async function EditExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const saved = (await searchParams).saved;
  const result = await getExercise(id);
  if (!result.ok && result.error.code === "not_found") notFound();

  if (!result.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Edit Exercise"
          backHref="/exercises"
          backLabel="Exercises"
        />
        <PageFrame title="Exercise unavailable" className="pt-5">
          <EmptyState
            title="Exercise couldn't be loaded"
            body={result.error.message}
          />
        </PageFrame>
      </div>
    );
  }

  return (
    <ExerciseForm
      exercise={result.value}
      initiallySaved={
        saved === "1" || (Array.isArray(saved) && saved[0] === "1")
      }
    />
  );
}
