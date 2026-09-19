"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  ActionOverlay,
  ActionsTrigger,
  Badge,
  DestructiveDialog,
  EmptyState,
  Icon,
  Kicker,
  Overlay,
  SaveStatus,
  ScreenBody,
  StickyActionBar,
  TextField,
  TopBar,
  useReorder,
  useSaveOutcome,
  useSavedSnapshot,
  useToast,
  useTransientOverlay,
  type SavePhase,
} from "@/shared/ui";

export function ProgramForm({ program }: { program?: Program }) {
  const router = useRouter();
  const [name, setName] = useState(program?.name ?? "");
  const [isCurrent, setIsCurrent] = useState(program?.isCurrent ?? false);
  const [splits, setSplits] = useState<readonly ProgramSplit[]>(
    program?.splits ?? [],
  );
  const [nextSplitId, setNextSplitId] = useState<string | null>(
    program?.nextSplitId ?? null,
  );
  const [error, setError] = useState<string>();
  const [nameError, setNameError] = useState<string>();
  const [phase, setPhase] = useState<SavePhase>("editing");
  const { returnToParent, reportFailure } = useSaveOutcome("/programs");
  const { showToast } = useToast();
  const { savedSnapshot } = useSavedSnapshot(snapshotOf(name));
  const busy = phase === "saving";
  const saveState =
    phase === "editing"
      ? snapshotOf(name) === savedSnapshot
        ? "clean"
        : "unsaved"
      : phase;

  function changed() {
    setNameError(undefined);
    setError(undefined);
    setPhase("editing");
  }

  async function save() {
    const validation = validateProgramDefinition({ name });
    if (!validation.ok) {
      setNameError(validation.fieldErrors.name?.[0]);
      setError(validationMessage);
      setPhase("editing");
      reportFailure(validationMessage);
      return;
    }

    setError(undefined);
    setNameError(undefined);
    setPhase("saving");
    const result = program
      ? await updateProgramAction(program.id, validation.value)
      : await createProgramAction(validation.value);
    if (!result.ok) {
      setNameError(result.error.fieldErrors?.name?.[0]);
      setError(result.error.retryable ? undefined : result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Program saved.");
  }

  async function chooseNext(splitId: string, close: () => void) {
    if (!program) return;
    setPhase("saving");
    setError(undefined);
    const wasCurrent = isCurrent;
    const result = wasCurrent
      ? await setNextSplitAction(program.id, splitId)
      : await setCurrentProgramAction(program.id, splitId);
    if (!result.ok) {
      setError(result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    setIsCurrent(result.value.isCurrent);
    setNextSplitId(result.value.nextSplitId);
    setSplits(result.value.splits);
    setPhase("editing");
    close();
    showToast(wasCurrent ? "Next split updated." : "Program is now current.");
    router.refresh();
  }

  async function moveSplit(from: number, to: number) {
    if (!program) return;
    if (to < 0 || to >= splits.length || to === from) return;
    const previous = [...splits];
    const reordered = [...splits];
    const [moved] = reordered.splice(from, 1);
    if (!moved) return;
    reordered.splice(to, 0, moved);
    setSplits(reordered);
    const result = await reorderSplitsAction(
      program.id,
      reordered.map((split) => split.id),
    );
    if (!result.ok) {
      setSplits(previous);
      setError(result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    setSplits(result.value.splits);
    setNextSplitId(result.value.nextSplitId);
    setPhase("editing");
    showToast("Order saved.");
  }

  async function remove() {
    if (!program) return;
    setPhase("saving");
    const result = await deleteProgramAction(program.id);
    if (!result.ok) {
      setError(result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Program deleted.");
  }

  return (
    <ProgramFormBody
      program={program}
      name={name}
      setName={setName}
      isCurrent={isCurrent}
      splits={splits}
      nextSplitId={nextSplitId}
      busy={busy}
      saveState={saveState}
      error={error}
      nameError={nameError}
      onChanged={changed}
      onSave={() => void save()}
      onMove={(from, to) => void moveSplit(from, to)}
      onChooseNext={(splitId, close) => void chooseNext(splitId, close)}
      onDelete={() => void remove()}
    />
  );
}

function ProgramFormBody({
  program,
  name,
  setName,
  isCurrent,
  splits,
  nextSplitId,
  busy,
  saveState,
  error,
  nameError,
  onChanged,
  onSave,
  onMove,
  onChooseNext,
  onDelete,
}: {
  program?: Program;
  name: string;
  setName: (value: string) => void;
  isCurrent: boolean;
  splits: readonly ProgramSplit[];
  nextSplitId: string | null;
  busy: boolean;
  saveState: "clean" | "unsaved" | "saving" | "failure";
  error?: string;
  nameError?: string;
  onChanged: () => void;
  onSave: () => void;
  onMove: (from: number, to: number) => void;
  onChooseNext: (splitId: string, close: () => void) => void;
  onDelete: () => void;
}) {
  const nextOverlay = useTransientOverlay();
  const confirmDelete = useTransientOverlay();
  const reorder = useReorder({ count: splits.length, onMove });
  const dirty = saveState === "unsaved";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={program ? "Program" : "New program"}
        backHref="/programs"
        backLabel="Programs"
        trailing={dirty ? <Badge tone="accent">Unsaved</Badge> : undefined}
      />
      <ScreenBody className="gap-2.5">
        {isCurrent ? (
          <p className="flex items-center gap-2.5 rounded-[var(--pf-r2)] bg-[var(--pf-accent-dim)] px-[18px] py-3.5 text-[13.5px] font-semibold text-[var(--pf-accent)]">
            <Icon name="calendar-check" size={15} />
            Current program
          </p>
        ) : null}

        <TextField
          id="program-name"
          label="Program name"
          value={name}
          error={nameError}
          disabled={busy}
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            onChanged();
          }}
        />

        <div className="mt-1.5 flex min-h-11 items-center justify-between gap-3">
          <Kicker>Split rotation · {splits.length}</Kicker>
          {splits.length > 1 ? (
            <span className="text-[12px] text-[var(--pf-text-3)]">
              Hold to reorder
            </span>
          ) : null}
        </div>

        {!program ? (
          <EmptyState
            icon="layout-grid"
            title="Save the program first"
            body="After saving the draft, you can add and order its splits."
          />
        ) : splits.length === 0 ? (
          <EmptyState
            icon="layout-grid"
            title="No splits yet"
            body="Add the first split before making this program current."
          />
        ) : (
          splits.map((split, index) => {
            const row = reorder.row(index);
            return (
              <section
                key={split.id}
                {...row}
                aria-label={split.name}
                className="relative flex cursor-grab items-center gap-2.5 rounded-[var(--pf-r3)] border border-transparent bg-[var(--pf-bg-surface)] py-3.5 pr-3.5 pl-[18px]"
              >
                <Link
                  href={`/splits/${split.id}/edit`}
                  className="min-w-0 flex-1"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15.5px] font-semibold [text-wrap:pretty]">
                      {split.name}
                    </span>
                    {split.id === nextSplitId ? (
                      <Badge tone="accent">Next</Badge>
                    ) : null}
                  </span>
                  <span className="pf-numeric mt-1.5 block text-[14px] text-[var(--pf-text-3)]">
                    Position {index + 1}
                  </span>
                </Link>
                <Icon
                  name="chevron-right"
                  size={16}
                  className="shrink-0 text-[var(--pf-glyph-dim)]"
                />
              </section>
            );
          })
        )}

        {program ? (
          <Link
            href={`/programs/${program.id}/splits/new`}
            className="mt-1 flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--pf-accent-dim)] text-[15px] font-semibold text-[var(--pf-accent)] transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:bg-[var(--pf-accent-dim-hover)]"
          >
            <Icon name="plus" size={17} />
            Add split
          </Link>
        ) : null}

        <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]">
          Reordering never moves the rotation pointer. Workouts already recorded
          keep this program in History.
        </p>
      </ScreenBody>

      <StickyActionBar>
        <SaveStatus
          state={saveState}
          validationMessage={error}
          onRetry={onSave}
        />
        <ActionOverlay
          trigger={
            <ActionsTrigger
              label="Program actions"
              tone={dirty ? "accent" : "muted"}
              disabled={busy}
            />
          }
          title={name.trim() === "" ? "New program" : name}
          meta={`${splits.length} ${splits.length === 1 ? "split" : "splits"}`}
          actions={[
            {
              key: "save",
              label: program ? "Save changes" : "Save program",
              icon: "check",
              onRun: onSave,
            },
            ...(program && splits.length > 0
              ? [
                  {
                    key: "next",
                    label: isCurrent
                      ? "Set the next split"
                      : "Make this the current program",
                    icon: "calendar-check" as const,
                    onRun: () => nextOverlay.requestOpenChange(true),
                  },
                ]
              : []),
            ...(program
              ? [
                  {
                    key: "delete",
                    label: "Delete this program",
                    icon: "trash-2" as const,
                    onRun: () => confirmDelete.requestOpenChange(true),
                  },
                ]
              : []),
          ]}
        />
      </StickyActionBar>

      <Overlay
        open={nextOverlay.open}
        onOpenChange={nextOverlay.requestOpenChange}
        title={isCurrent ? "Set next split" : "Choose the first split"}
        description={
          isCurrent
            ? "This changes the persistent rotation pointer."
            : "Making this program current replaces any other current program."
        }
      >
        {(close) => (
          <div className="flex flex-col gap-2">
            {splits.map((split) => (
              <button
                key={split.id}
                type="button"
                disabled={busy}
                onClick={() => onChooseNext(split.id, close)}
                className="flex min-h-[68px] items-center gap-3.5 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[18px] py-3.5 text-left transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-border-strong)]"
              >
                <span className="min-w-0 flex-1 text-[15.5px] font-semibold [text-wrap:pretty]">
                  {split.name}
                </span>
                {split.id === nextSplitId ? (
                  <Badge tone="accent">Next</Badge>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </Overlay>

      <DestructiveDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.requestOpenChange}
        title="Delete program?"
        description="Its splits are deleted with it. Workouts already recorded keep this program in History."
        confirmLabel="Delete program"
        onConfirm={onDelete}
      />
    </div>
  );
}

const validationMessage = "Check the highlighted fields.";

function snapshotOf(name: string): string {
  return JSON.stringify([name]);
}
