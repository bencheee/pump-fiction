import Link from "next/link";
import type { CSSProperties } from "react";

import type { Program } from "@/features/programs/domain/program";
import { listPrograms } from "@/server/application/programs";
import { Badge, Icon, ListRow, PageFrame } from "@/shared/ui";

import "./programs.css";

export const dynamic = "force-dynamic";

/*
 * The Programs list — the prototype's screen 10 — ported for step 13 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 748-771, `data-screen-label="Programs"`
 *   bound values  lines 2661-2669 (`programRows`), 2906-2915 (`pgAdd`)
 */
export default async function ProgramsPage() {
  const result = await listPrograms();

  return (
    <PageFrame screen="programs" title="Programs" trailing={<AddProgram />}>
      <p data-programs-lead="">
        The current program drives the rotation on Today. Its splits run in the
        order you set here.
      </p>

      {!result.ok ? (
        // A read that failed, which the prototype has no notion of: the note
        // card every ported list answers such a state with.
        <p data-note-card="">
          {result.error.message}
          <Link href="/programs">Try again</Link>
        </p>
      ) : result.value.length === 0 ? (
        // No program at all, which the prototype has no screen for either.
        <p data-note-card="">
          Create a program, add its split rotation, then choose the split it
          starts from.
          <Link href="/programs/new">Add program</Link>
        </p>
      ) : (
        <ul data-programs-list="">
          {result.value.map((program, index) => (
            <li
              key={program.id}
              style={{ "--row-index": Math.min(index, 9) } as CSSProperties}
            >
              <ProgramRow program={program} />
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
}

/** `pgAdd` (line 752): a new program opens as its own screen, a route here. */
function AddProgram() {
  return (
    <Link
      href="/programs/new"
      data-variant="title-add"
      aria-label="Add program"
      title="Add program"
    >
      <Icon name="plus" size={18} />
    </Link>
  );
}

/** `programRows` (lines 756-769, values at 2661-2669). */
function ProgramRow({ program }: { program: Program }) {
  const next = program.splits.find((split) => split.id === program.nextSplitId);
  const count = program.splits.length;

  return (
    <ListRow
      href={`/programs/${program.id}/edit`}
      variant="program"
      current={program.isCurrent}
      title={program.name}
      titleBadge={
        program.isCurrent ? <Badge tone="accent">Current</Badge> : undefined
      }
      detail={`${count} ${count === 1 ? "split" : "splits"}${next ? ` · Next: ${next.name}` : ""}`}
    />
  );
}
