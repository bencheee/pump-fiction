import Link from "next/link";

import type { Program } from "@/features/programs/domain/program";
import { listPrograms } from "@/server/application/programs";
import { Badge, EmptyState, Icon, PageFrame, rowStagger } from "@/shared/ui";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const result = await listPrograms();

  return (
    <PageFrame
      title="Programs"
      action={
        <Link
          href="/programs/new"
          aria-label="Add program"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--pf-border)] text-[var(--pf-accent)] transition-[background-color,border-color] duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-accent)] hover:bg-[var(--pf-accent-dim)]"
        >
          <Icon name="plus" size={18} />
        </Link>
      }
      className="gap-2.5"
    >
      <p className="text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
        The current program drives the rotation on Today. Its splits run in the
        order you set here.
      </p>

      {!result.ok ? (
        <EmptyState
          icon="circle-alert"
          title="Programs couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/programs"
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
            >
              Retry
            </Link>
          }
        />
      ) : result.value.length === 0 ? (
        <EmptyState
          icon="layout-grid"
          title="No programs yet"
          body="Create a program, add its split rotation, then choose the split it starts from."
          action={
            <Link
              href="/programs/new"
              className="mt-1 flex min-h-12 items-center rounded-full bg-[var(--pf-accent)] px-5 font-semibold text-[var(--pf-on-accent)]"
            >
              Add program
            </Link>
          }
        />
      ) : (
        result.value.map((program, index) => (
          <ProgramCard key={program.id} program={program} index={index} />
        ))
      )}
    </PageFrame>
  );
}

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const next = program.splits.find((split) => split.id === program.nextSplitId);

  return (
    <Link
      href={`/programs/${program.id}/edit`}
      style={rowStagger(index)}
      className={`flex min-h-[var(--pf-size-list-row)] items-center gap-2.5 rounded-[var(--pf-r3)] border border-transparent py-3.5 pr-3 pl-[18px] transition-[border-color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] hover:border-[var(--pf-border-strong)] active:scale-[0.99] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both] ${
        program.isCurrent
          ? "bg-[var(--pf-accent-dim)]"
          : "bg-[var(--pf-bg-surface)]"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[16.5px] leading-[1.25] font-semibold [text-wrap:pretty]">
            {program.name}
          </span>
          {program.isCurrent ? <Badge tone="accent">Current</Badge> : null}
        </span>
        <span className="mt-1.5 block text-[13px] text-[var(--pf-text-3)]">
          {program.splits.length}{" "}
          {program.splits.length === 1 ? "split" : "splits"}
          {next ? ` · Next: ${next.name}` : ""}
        </span>
      </span>
      <Icon
        name="chevron-right"
        size={16}
        className="shrink-0 text-[var(--pf-glyph-dim)]"
      />
    </Link>
  );
}
