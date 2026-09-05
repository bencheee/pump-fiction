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
  Action,
  Badge,
  DestructiveDialog,
  EmptyState,
  Icon,
  SaveStatus,
  Sheet,
  StickyActionBar,
  TextField,
  TopBar,
  useSaveOutcome,
  useSavedSnapshot,
  useToast,
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

  async function moveSplit(index: number, direction: -1 | 1) {
    if (!program) return;
    const destination = index + direction;
    if (destination < 0 || destination >= splits.length) return;
    const previous = [...splits];
    const reordered = [...splits];
    [reordered[index], reordered[destination]] = [
      reordered[destination]!,
      reordered[index]!,
    ];
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
    <div className="flex min-h-full flex-col">
      <TopBar
        title={program ? "Edit Program" : "New Program"}
        backHref="/programs"
        backLabel="Programs"
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        {isCurrent ? (
          <section className="mb-5 flex items-center gap-2 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4 font-semibold">
            <Icon name="calendar-check" size={16} /> Current program
          </section>
        ) : null}

        <div className="space-y-6">
          <TextField
            id="program-name"
            label="Program name"
            value={name}
            className="min-h-[var(--pf-size-input-prominent)]"
            error={nameError}
            disabled={busy}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              changed();
            }}
          />

          <section aria-labelledby="split-rotation-title">
            <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
              <h2
                id="split-rotation-title"
                className="text-[11px] font-semibold tracking-[0.1em] uppercase"
              >
                Split rotation · {splits.length}
              </h2>
            </div>

            {!program ? (
              <EmptyState
                title="Save the program first"
                body="After saving the draft, you can add and order its splits."
              />
            ) : splits.length === 0 ? (
              <EmptyState
                title="No splits yet"
                body="Add the first split before activating this program."
                action={
                  program ? (
                    <Link
                      href={`/programs/${program.id}/splits/new`}
                      className="min-h-11 rounded-[var(--pf-r2)] bg-[var(--pf-accent)] px-4 py-3 font-semibold text-[var(--pf-on-accent)]"
                    >
                      Add Split
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-2">
                {splits.map((split, index) => (
                  <div
                    key={split.id}
                    className="flex min-h-20 items-center gap-2 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-2"
                  >
                    <Icon
                      name="grip-vertical"
                      size={18}
                      className="text-[var(--pf-text-3-deep)]"
                    />
                    <Link
                      href={`/splits/${split.id}/edit`}
                      className="min-w-0 flex-1 py-2"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold [overflow-wrap:anywhere]">
                          {split.name}
                        </span>
                        {split.id === nextSplitId ? (
                          <Badge tone="accent">Next</Badge>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-[12.5px] text-[var(--pf-text-2)]">
                        Position {index + 1}
                      </span>
                    </Link>
                    <div className="flex shrink-0">
                      <button
                        type="button"
                        aria-label={`Move ${split.name} up`}
                        disabled={busy || index === 0}
                        onClick={() => void moveSplit(index, -1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-up" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${split.name} down`}
                        disabled={busy || index === splits.length - 1}
                        onClick={() => void moveSplit(index, 1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-down" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {program && splits.length > 0 ? (
              <Link
                href={`/programs/${program.id}/splits/new`}
                className="mt-3 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[var(--pf-r2)] border border-dashed border-[var(--pf-border-control)] font-semibold text-[var(--pf-accent-strong)]"
              >
                <Icon name="plus" size={18} /> Add Split
              </Link>
            ) : null}
          </section>
        </div>

        <StickyActionBar>
          <SaveStatus
            state={saveState}
            validationMessage={error}
            onRetry={() => void save()}
          />
          <Action disabled={busy} onClick={() => void save()}>
            {program ? "Save Changes" : "Save Program"}
          </Action>
          {program && splits.length > 0 ? (
            <Sheet
              title={isCurrent ? "Set next split" : "Choose the first split"}
              description={
                isCurrent
                  ? "This changes the persistent rotation pointer."
                  : "Making this program current replaces any other current program."
              }
              trigger={
                <Action variant="secondary" disabled={busy}>
                  {isCurrent ? "Set Next Split" : "Make Current Program"}
                </Action>
              }
            >
              {(close) => (
                <div className="space-y-2">
                  {splits.map((split) => (
                    <Action
                      key={split.id}
                      variant="secondary"
                      className="w-full justify-between"
                      disabled={busy}
                      onClick={() => void chooseNext(split.id, close)}
                    >
                      {split.name}
                      {split.id === nextSplitId ? (
                        <Badge tone="accent">Next</Badge>
                      ) : null}
                    </Action>
                  ))}
                </div>
              )}
            </Sheet>
          ) : null}
          {program ? (
            <DestructiveDialog
              title="Delete program?"
              description="Its splits are deleted with it. Workouts already recorded keep this program in History."
              confirmLabel="Delete Program"
              onConfirm={() => void remove()}
              trigger={
                <Action variant="danger" disabled={busy}>
                  Delete Program
                </Action>
              }
            />
          ) : null}
        </StickyActionBar>
      </main>
    </div>
  );
}

const validationMessage = "Check the highlighted fields.";

function snapshotOf(name: string): string {
  return JSON.stringify([name]);
}
