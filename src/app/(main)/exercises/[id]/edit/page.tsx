import Link from "next/link";
import { notFound } from "next/navigation";

import { getExercise } from "@/server/application/exercises";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { ExerciseForm } from "../../exercise-form";
import "../../exercise-form.css";

export const dynamic = "force-dynamic";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const result = await getExercise(id);
  if (!result.ok && result.error.code === "not_found") notFound();

  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // inside the screen's own frame, as every ported screen answers it.
    return (
      <div data-definition="">
        <TopBar
          screen="definition"
          title="Edit exercise"
          backHref="/exercises"
          backLabel="Back"
        />
        <div data-definition-body="">
          <p data-note-card="">
            {result.error.message}
            <Link href={`/exercises/${id}/edit`}>Try again</Link>
          </p>
        </div>
      </div>
    );
  }

  return <ExerciseForm exercise={result.value} />;
}
