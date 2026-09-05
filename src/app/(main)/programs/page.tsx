import Link from "next/link";

import type { Program } from "@/features/programs/domain/program";
import { listPrograms } from "@/server/application/programs";
import { Badge, EmptyState, Icon, PageFrame } from "@/shared/ui";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const result = await listPrograms();

  return (
    <PageFrame title="Programs">
      <Link
        href="/programs/new"
        aria-label="Add program"
        className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-[var(--pf-gutter)] flex size-11 items-center justify-center rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] text-[var(--pf-accent-strong)]"
      >
        <Icon name="plus" size={20} />
      </Link>

      {!result.ok ? (
        <EmptyState
          title="Programs couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/programs"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      ) : result.value.length === 0 ? (
        <EmptyState
          title="No programs yet"
          body="Create a program, add its split rotation, then choose the split it starts from."
          action={
            <Link
              href="/programs/new"
              className="min-h-11 rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 py-3 font-semibold text-[var(--pf-on-accent)]"
            >
              Add Program
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
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
    <Link
      href={`/programs/${program.id}/edit`}
      className={`flex min-h-20 items-center gap-3 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4 ${
        program.isCurrent ? "border-l-[3px] border-l-[var(--pf-accent)]" : ""
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[16.5px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
            {program.name}
          </span>
          {program.isCurrent ? <Badge tone="accent">Current</Badge> : null}
        </span>
        <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
          {program.splits.length}{" "}
          {program.splits.length === 1 ? "split" : "splits"}
          {next ? ` · Next: ${next.name}` : ""}
        </span>
      </span>
      <Icon
        name="chevron-right"
        size={16}
        className="text-[var(--pf-text-2)]"
      />
    </Link>
  );
}
