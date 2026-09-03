import { notFound } from "next/navigation";

import { listExercises } from "@/server/application/exercises";
import { getProgram } from "@/server/application/programs";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { SplitForm } from "../../../split-form";

export const dynamic = "force-dynamic";

export default async function NewSplitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const [programResult, exerciseResult] = await Promise.all([
    getProgram(id),
    listExercises(false),
  ]);
  if (!programResult.ok && programResult.error.code === "not_found") notFound();
  if (!programResult.ok || !exerciseResult.ok) {
    const message = !programResult.ok
      ? programResult.error.message
      : exerciseResult.ok
        ? ""
        : exerciseResult.error.message;
    return (
      <LoadFailure
        title="New Split"
        backHref={`/programs/${id}/edit`}
        message={message}
      />
    );
  }
  if (programResult.value.status === "archived") {
    return (
      <LoadFailure
        title="New Split"
        backHref={`/programs/${id}/edit`}
        message="Reactivate this program before adding a split."
      />
    );
  }
  return (
    <SplitForm
      program={programResult.value}
      exerciseLibrary={exerciseResult.value.filter(
        (exercise) => exercise.status === "active",
      )}
    />
  );
}

function LoadFailure({
  title,
  backHref,
  message,
}: {
  title: string;
  backHref: string;
  message: string;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={title} backHref={backHref} backLabel="Program" />
      <PageFrame title="Split unavailable" className="pt-5">
        <EmptyState title="Split couldn't be opened" body={message} />
      </PageFrame>
    </div>
  );
}
