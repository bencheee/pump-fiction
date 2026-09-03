import { notFound } from "next/navigation";

import { listExercises } from "@/server/application/exercises";
import { getProgram, getSplit } from "@/server/application/programs";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { SplitForm } from "../../../programs/split-form";

export const dynamic = "force-dynamic";

export default async function EditSplitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const saved = (await searchParams).saved;
  const splitResult = await getSplit(id);
  if (!splitResult.ok && splitResult.error.code === "not_found") notFound();
  if (!splitResult.ok)
    return <LoadFailure message={splitResult.error.message} />;
  const [programResult, exerciseResult] = await Promise.all([
    getProgram(splitResult.value.programId),
    listExercises(false),
  ]);
  if (!programResult.ok && programResult.error.code === "not_found") notFound();
  if (!programResult.ok || !exerciseResult.ok) {
    return (
      <LoadFailure
        message={
          !programResult.ok
            ? programResult.error.message
            : exerciseResult.ok
              ? ""
              : exerciseResult.error.message
        }
      />
    );
  }
  return (
    <SplitForm
      program={programResult.value}
      split={splitResult.value}
      exerciseLibrary={exerciseResult.value.filter(
        (exercise) => exercise.status === "active",
      )}
      initiallySaved={
        saved === "1" || (Array.isArray(saved) && saved[0] === "1")
      }
    />
  );
}

function LoadFailure({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Edit Split" backHref="/programs" backLabel="Programs" />
      <PageFrame title="Split unavailable" className="pt-5">
        <EmptyState title="Split couldn't be loaded" body={message} />
      </PageFrame>
    </div>
  );
}
