import Link from "next/link";
import { notFound } from "next/navigation";

import { getProgram } from "@/server/application/programs";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { TopBar } from "@/shared/ui";

import { ProgramForm } from "../../program-form";
import "../../program-form.css";

export const dynamic = "force-dynamic";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = requireUuidRouteParam((await params).id);
  const result = await getProgram(id);
  if (!result.ok && result.error.code === "not_found") notFound();
  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // inside the screen's own frame, as every ported screen answers it.
    return (
      <div data-program="">
        <TopBar
          screen="program"
          title="Edit program"
          backHref="/programs"
          backLabel="Back"
        />
        <div data-program-body="">
          <p data-note-card="">
            {result.error.message}
            <Link href={`/programs/${id}/edit`}>Try again</Link>
          </p>
        </div>
      </div>
    );
  }
  return <ProgramForm program={result.value} />;
}
