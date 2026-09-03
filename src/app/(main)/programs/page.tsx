import Link from "next/link";

import type {
  Program,
  ProgramStatus,
} from "@/features/programs/domain/program";
import { listPrograms } from "@/server/application/programs";
import { Badge, EmptyState, Icon, PageFrame } from "@/shared/ui";

export const dynamic = "force-dynamic";

const groups: ReadonlyArray<{
  status: ProgramStatus;
  label: string;
  empty: string;
}> = [
  { status: "active", label: "Active", empty: "No active program" },
  { status: "draft", label: "Drafts", empty: "No draft programs" },
  { status: "archived", label: "Archived", empty: "No archived programs" },
];

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
          body="Create a program, add its split rotation, then choose the first split when you activate it."
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
        <div className="space-y-7">
          {groups.map((group) => {
            const programs = result.value.filter(
              (program) => program.status === group.status,
            );
            return (
              <section
                key={group.status}
                aria-labelledby={`${group.status}-programs`}
              >
                <h2
                  id={`${group.status}-programs`}
                  className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase"
                >
                  {group.label}
                </h2>
                {programs.length === 0 ? (
                  <p className="rounded-[var(--pf-r2)] border border-dashed border-[var(--pf-border)] px-3 py-4 text-[13px] text-[var(--pf-text-3-deep)]">
                    {group.empty}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {programs.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </PageFrame>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const activeSplits = program.splits.filter(
    (split) => split.status === "active",
  );
  const next = program.splits.find((split) => split.id === program.nextSplitId);

  return (
    <Link
      href={`/programs/${program.id}/edit`}
      className={`flex min-h-20 items-center gap-3 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4 ${
        program.status === "active"
          ? "border-l-[3px] border-l-[var(--pf-accent)]"
          : ""
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[16.5px] leading-[1.25] font-semibold [overflow-wrap:anywhere]">
            {program.name}
          </span>
          <Badge tone={program.status === "active" ? "accent" : "neutral"}>
            {program.status}
          </Badge>
        </span>
        <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
          {activeSplits.length} {activeSplits.length === 1 ? "split" : "splits"}
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
