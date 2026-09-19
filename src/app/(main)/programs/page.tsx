import Link from "next/link";

import type { Program } from "@/features/programs/domain/program";
import { listPrograms } from "@/server/application/programs";
import { Badge, EmptyState, Icon, PageFrame } from "@/shared/ui";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const result = await listPrograms();

  return (
    <PageFrame title="Programs">
      <Link href="/programs/new" aria-label="Add program">
        <Icon name="plus" size={20} />
      </Link>

      {!result.ok ? (
        <EmptyState
          title="Programs couldn't be loaded"
          body={result.error.message}
          action={<Link href="/programs">Retry</Link>}
        />
      ) : result.value.length === 0 ? (
        <EmptyState
          title="No programs yet"
          body="Create a program, add its split rotation, then choose the split it starts from."
          action={<Link href="/programs/new">Add Program</Link>}
        />
      ) : (
        <div>
          {result.value.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </PageFrame>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const next = program.splits.find((split) => split.id === program.nextSplitId);

  return (
    <Link href={`/programs/${program.id}/edit`}>
      <span>
        <span>
          <span>{program.name}</span>
          {program.isCurrent ? <Badge tone="accent">Current</Badge> : null}
        </span>
        <span>
          {program.splits.length}{" "}
          {program.splits.length === 1 ? "split" : "splits"}
          {next ? ` · Next: ${next.name}` : ""}
        </span>
      </span>
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}
