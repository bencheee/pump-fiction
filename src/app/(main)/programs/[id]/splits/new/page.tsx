import Link from "next/link";
import { notFound } from "next/navigation";

import { listExercises } from "@/server/application/exercises";
import { getProgram } from "@/server/application/programs";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { SplitForm } from "../../../split-form";
import "../../../split-form.css";

export const dynamic = "force-dynamic";

export default async function NewSplitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const [programResult, exerciseResult] = await Promise.all([
    getProgram(id),
    listExercises(),
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
        title="New split"
        backHref={`/programs/${id}/edit`}
        message={message}
      />
    );
  }
  return (
    <SplitForm
      program={programResult.value}
      exerciseLibrary={exerciseResult.value}
    />
  );
}

/* A read that failed, which the prototype has no notion of: the note card
   inside the screen's own frame, as every ported screen answers it. */
function LoadFailure({
  title = "New split",
  backHref = "/programs",
  message,
}: {
  title?: string;
  backHref?: string;
  message: string;
}) {
  return (
    <div data-split-editor="">
      <TopBar
        screen="split-editor"
        title={title}
        backHref={backHref}
        backLabel="Back"
      />
      <div data-split-editor-body="">
        <p data-note-card="">
          {message}
          <Link href={backHref}>Back</Link>
        </p>
      </div>
    </div>
  );
}
