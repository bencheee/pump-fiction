"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  createProgramAction,
  deleteProgramAction,
  reorderSplitsAction,
  setCurrentProgramAction,
  setNextSplitAction,
  updateProgramAction,
} from "@/app/actions/programs";
import type { Program, ProgramSplit } from "@/features/programs/domain/program";
import { validateProgramDefinition } from "@/features/programs/domain/program-validation";
import {
  Action,
  ActionsPanel,
  Badge,
  DestructiveDialog,
  EmptyCard,
  Icon,
  NameField,
  SectionHead,
  Sheet,
  TopBar,
  UnsavedChip,
  useHoldReorder,
  useSaveOutcome,
  useToast,
  useTransientOverlay,
  type ActionEntry,
} from "@/shared/ui";

import "./program-form.css";
import { failureMessage } from "@/shared/application/operation-result";

/*
 * The Program screen — the prototype's screen 11, with Set next split, its
 * screen 18 — ported for step 14 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 775-832, `data-screen-label="Program"`
 *                 lines 1211-1231, `data-screen-label="Set next split"`
 *   bound values  lines 2672-2684 (`pgSplits`), 2809-2816 (`doSaveProgram`,
 *                 `doDeleteProgram`), 2839-2846 (this screen's Actions
 *                 entries), 2915-2956 (`pgTitle` … `pgCloseSheet`)
 *   behaviour     `gDragStart` 2526, `gDragMove` 2542, `gDragEnd` 2563,
 *                 `gRow` 2576, `pPop` 2496, `editPrograms` 2516
 *
 * The prototype keeps every edit in a draft until Save. The application writes
 * the order of the splits and the rotation pointer the moment they change, as
 * it always has, and holds only the name for Save — so `Unsaved` is the name's
 * and nothing else's.
 */

/** `gRow` (2578): the height an unmeasured split row is taken to be. */
const fallbackRowHeight = 76;

export function ProgramForm({ program }: { program?: Program }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { returnToParent, reportFailure } = useSaveOutcome("/programs");
  const [savedName, setSavedName] = useState(program?.name ?? "");
  const [name, setName] = useState(program?.name ?? "");
  const [isCurrent, setIsCurrent] = useState(program?.isCurrent ?? false);
  const [splits, setSplits] = useState<readonly ProgramSplit[]>(
    program?.splits ?? [],
  );
  const [nextSplitId, setNextSplitId] = useState<string | null>(
    program?.nextSplitId ?? null,
  );
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  /* `pDirty` (2913): a new program is a draft from the first frame, as `pgAdd`
     marks it; a saved one only once its name differs. */
  const dirty = program === undefined || name !== savedName;

  /*
   * The prototype writes into its one `s.pSheet` and `s.dialog` slots from the
   * panel it has just closed. Each panel here carries its own history entry,
   * so what an entry runs waits for the Actions panel to give its entry back
   * first — the mechanism steps 6 and 9 use.
   */
  const actionsOverlay = useTransientOverlay();
  const nextOverlay = useTransientOverlay();
  const confirmOverlay = useTransientOverlay();
  const pendingRef = useRef<(() => void) | null>(null);
  const actionsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (actionsOverlay.open) return;
    const run = pendingRef.current;
    if (run === null) return;
    pendingRef.current = null;
    run();
  }, [actionsOverlay.open]);

  const reorder = useHoldReorder({
    count: splits.length,
    fallbackHeight: fallbackRowHeight,
    onMove: (from, to) => void moveSplit(from, to),
  });

  /* `doSaveProgram` (2809). */
  async function save() {
    const validation = validateProgramDefinition({ name });
    if (!validation.ok) {
      setInvalid(true);
      showToast("Enter a program name.");
      return;
    }
    setBusy(true);
    const result = program
      ? await updateProgramAction(program.id, validation.value)
      : await createProgramAction(validation.value);
    setBusy(false);
    if (!result.ok) {
      setInvalid(Boolean(result.error.fieldErrors?.name));
      reportFailure(failureMessage(result.error));
      return;
    }
    setSavedName(validation.value.name);
    returnToParent("Program saved.");
  }

  /* `o.pick` (2946-2954). */
  async function chooseNext(splitId: string) {
    if (!program) return;
    const wasCurrent = isCurrent;
    setBusy(true);
    const result = wasCurrent
      ? await setNextSplitAction(program.id, splitId)
      : await setCurrentProgramAction(program.id, splitId);
    setBusy(false);
    if (!result.ok) {
      reportFailure(result.error.message);
      return;
    }
    setIsCurrent(result.value.isCurrent);
    setNextSplitId(result.value.nextSplitId);
    setSplits(result.value.splits);
    nextOverlay.requestOpenChange(false);
    showToast(wasCurrent ? "Next split updated." : "Program is now current.");
    router.refresh();
  }

  /* `gripUp` (2679-2682): the order is written at once, and says so. */
  async function moveSplit(from: number, to: number) {
    if (!program) return;
    const previous = splits;
    const reordered = [...splits];
    const [moved] = reordered.splice(from, 1);
    if (moved === undefined) return;
    reordered.splice(to, 0, moved);
    setSplits(reordered);
    const result = await reorderSplitsAction(
      program.id,
      reordered.map((split) => split.id),
    );
    if (!result.ok) {
      setSplits(previous);
      reportFailure(result.error.message);
      return;
    }
    setSplits(result.value.splits);
    setNextSplitId(result.value.nextSplitId);
    showToast("Order saved.");
  }

  async function remove() {
    if (!program) return;
    setBusy(true);
    const result = await deleteProgramAction(program.id);
    setBusy(false);
    if (!result.ok) {
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Program deleted.");
  }

  /* `actRaw` for a program (2839-2846). */
  const actions: ActionEntry[] = [
    {
      key: "save",
      label: program ? "Save changes" : "Save program",
      icon: "check",
      disabled: busy,
      run: () => {
        pendingRef.current = () => void save();
      },
    },
    ...(program && splits.length > 0
      ? [
          {
            key: "next",
            label: isCurrent ? "Set next split" : "Make current program",
            icon: "calendar-check" as const,
            disabled: busy,
            run: () => {
              pendingRef.current = () => nextOverlay.requestOpenChange(true);
            },
          },
        ]
      : []),
    ...(program
      ? [
          {
            key: "delete",
            label: "Delete program",
            icon: "trash-2" as const,
            disabled: busy,
            run: () => {
              pendingRef.current = () => confirmOverlay.requestOpenChange(true);
            },
          },
        ]
      : []),
  ];

  const splitCount = splits.length;

  return (
    <div data-program="">
      <TopBar
        screen="program"
        title={program ? "Edit program" : "New program"}
        backHref="/programs"
        backLabel="Back"
        trailing={dirty ? <UnsavedChip /> : null}
      />

      <div data-program-body="">
        {isCurrent ? (
          <p data-program-current="">
            <Icon name="calendar-check" size={15} />
            Current program
          </p>
        ) : null}

        <NameField
          label="Program name"
          value={name}
          invalid={invalid}
          disabled={busy}
          onChange={(event) => {
            setName(event.target.value);
            setInvalid(false);
          }}
        />

        <SectionHead aside="Hold to reorder">
          Split rotation · {splitCount}
        </SectionHead>

        {splits.map((split, index) => (
          <SplitRow
            key={split.id}
            split={split}
            index={index}
            count={splitCount}
            next={split.id === nextSplitId}
            gesture={reorder.rowProps(index)}
            onOpen={() => {
              if (reorder.recentDrag()) return;
              router.push(`/splits/${split.id}/edit`);
            }}
          />
        ))}

        {program === undefined ? (
          // A program that has not been saved has nowhere to keep a split
          // yet, which the prototype's draft does not have to say.
          <EmptyCard icon="layout-grid" title="No splits yet">
            Save the program first, then add its splits.
          </EmptyCard>
        ) : splitCount === 0 ? (
          <EmptyCard icon="layout-grid" title="No splits yet">
            Add the first split before making this program current.
          </EmptyCard>
        ) : null}

        {program ? (
          <Link
            href={`/programs/${program.id}/splits/new`}
            data-variant="add"
            aria-label="Add split"
            title="Add split"
          >
            <Icon name="plus" size={17} />
            Add split
          </Link>
        ) : null}

        <p data-program-footnote="">
          Reordering never moves the rotation pointer. Workouts already recorded
          keep this program in History.
        </p>
      </div>

      <div data-program-footer="">
        <ActionsPanel
          panel="program-actions"
          heading={name.trim() || "Untitled program"}
          meta={`${splitCount} ${splitCount === 1 ? "split" : "splits"}${dirty ? " · Unsaved changes" : ""}`}
          overlay={actionsOverlay}
          items={actions}
          trigger={
            <Action
              ref={actionsRef}
              variant="actions"
              data-edits=""
              aria-label="Actions"
              title="Actions"
            >
              {"···"}
            </Action>
          }
        />
      </div>

      {program ? (
        <Sheet
          panel="set-next-split"
          overlay={nextOverlay}
          returnFocusRef={actionsRef}
          title={isCurrent ? "Set next split" : "Choose the first split"}
          description={
            isCurrent
              ? "This moves the persistent rotation pointer."
              : "Making this program current replaces any other current program."
          }
        >
          {splits.map((split, index) => {
            const selected = split.id === nextSplitId;
            return (
              <button
                key={split.id}
                type="button"
                data-next-option={selected ? "selected" : ""}
                aria-label={split.name}
                aria-pressed={selected}
                disabled={busy}
                style={
                  { "--option-delay": `${40 + index * 45}ms` } as CSSProperties
                }
                onClick={() => void chooseNext(split.id)}
              >
                <span>{split.name}</span>
                {selected ? <Badge tone="accent">Next</Badge> : null}
              </button>
            );
          })}
        </Sheet>
      ) : null}

      {program ? (
        <DestructiveDialog
          overlay={confirmOverlay}
          title={`Delete ${savedName || "this program"}?`}
          description="Its splits are deleted with it. Workouts already recorded keep this program in History."
          confirmLabel="Delete program"
          onConfirm={() => void remove()}
        />
      ) : null}
    </div>
  );
}

/*
 * `pgSplits` (lines 803-814, values at 2672-2684). The prototype's row is a
 * `<section>` that opens its split on a press; here it is a link, so it can
 * be reached and opened without a pointer, and Alt with an arrow moves it.
 */
function SplitRow({
  split,
  index,
  count,
  next,
  gesture,
  onOpen,
}: {
  split: ProgramSplit;
  index: number;
  count: number;
  next: boolean;
  gesture: ReturnType<ReturnType<typeof useHoldReorder>["rowProps"]>;
  onOpen: () => void;
}) {
  const exercises = `${split.exerciseCount} ${split.exerciseCount === 1 ? "exercise" : "exercises"}`;

  return (
    <a
      {...gesture}
      href={`/splits/${split.id}/edit`}
      data-program-split=""
      draggable={false}
      aria-label={`${split.name}, position ${index + 1} of ${count}`}
      onClick={(event) => {
        event.preventDefault();
        onOpen();
      }}
    >
      <span data-program-split-text="">
        <span data-program-split-heading="">
          <span>{split.name}</span>
          {next ? <Badge tone="accent">Next</Badge> : null}
        </span>
        <span data-program-split-meta="">
          Position {index + 1} · {exercises}
        </span>
      </span>
      <Icon name="chevron-right" size={16} />
    </a>
  );
}
