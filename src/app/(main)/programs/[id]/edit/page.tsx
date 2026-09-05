import { notFound } from "next/navigation";

import { getProgram } from "@/server/application/programs";
import { requireUuidRouteParam } from "@/shared/routing/uuid-route-param";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { ProgramForm } from "../../program-form";

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
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Edit Program"
          backHref="/programs"
          backLabel="Programs"
        />
        <PageFrame title="Program unavailable" className="pt-5">
          <EmptyState
            title="Program couldn't be loaded"
            body={result.error.message}
          />
        </PageFrame>
      </div>
    );
  }
  return <ProgramForm program={result.value} />;
}
