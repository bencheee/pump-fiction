"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  activateProgramAction,
  archiveProgramAction,
  createProgramAction,
  reorderSplitsAction,
  setNextSplitAction,
  updateProgramAction,
} from "@/app/actions/programs";
import type {
  Program,
  ProgramSplit,
  ProgramStatus,
} from "@/features/programs/domain/program";
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
  Toast,
  TopBar,
} from "@/shared/ui";

type SaveState = "idle" | "saving" | "saved" | "failure";

export function ProgramForm({
  program,
  initiallySaved = false,
}: {
  program?: Program;
  initiallySaved?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(program?.name ?? "");
  const [status, setStatus] = useState<ProgramStatus>(
    program?.status ?? "draft",
  );
  const [splits, setSplits] = useState<readonly ProgramSplit[]>(
    program?.splits ?? [],
  );
  const [nextSplitId, setNextSplitId] = useState<string | null>(
    program?.nextSplitId ?? null,
  );
  const [error, setError] = useState<string>();
  const [nameError, setNameError] = useState<string>();
  const [saveState, setSaveState] = useState<SaveState>(
    initiallySaved ? "saved" : "idle",
  );
  const [toast, setToast] = useState<string>();
  const busy = saveState === "saving";
  const activeSplits = splits.filter((split) => split.status === "active");

  useEffect(() => {
    if (initiallySaved && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [initiallySaved]);

  const dismissToast = useCallback(() => setToast(undefined), []);

  function changed() {
    setNameError(undefined);
    setError(undefined);
    setSaveState("idle");
  }

  async function save() {
    const validation = validateProgramDefinition({ name });
    if (!validation.ok) {
      setNameError(validation.fieldErrors.name?.[0]);
      setError("Check the highlighted fields.");
      setSaveState("idle");
      return;
    }

    setError(undefined);
    setNameError(undefined);
    setSaveState("saving");
    const result = program
      ? await updateProgramAction(program.id, validation.value)
      : await createProgramAction(validation.value);
    if (!result.ok) {
      setNameError(result.error.fieldErrors?.name?.[0]);
      setError(result.error.retryable ? undefined : result.error.message);
      setSaveState("failure");
      return;
    }
    setName(result.value.name);
    setSaveState("saved");
    if (!program) router.replace(`/programs/${result.value.id}/edit?saved=1`);
    else router.refresh();
  }

  async function chooseNext(splitId: string, close: () => void) {
    if (!program) return;
    setSaveState("saving");
    setError(undefined);
    const wasActive = status === "active";
    const result = wasActive
      ? await setNextSplitAction(program.id, splitId)
      : await activateProgramAction(program.id, splitId);
    if (!result.ok) {
      setError(result.error.message);
      setSaveState("failure");
      return;
    }
    setStatus(result.value.status);
    setNextSplitId(result.value.nextSplitId);
    setSplits(result.value.splits);
    setSaveState("saved");
    close();
    setToast(wasActive ? "Next split updated." : "Program activated.");
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
      setSaveState("failure");
      return;
    }
    setSplits(result.value.splits);
    setNextSplitId(result.value.nextSplitId);
    setSaveState("saved");
    setToast("Order saved.");
  }

  async function archive() {
    if (!program) return;
    setSaveState("saving");
    const result = await archiveProgramAction(program.id);
    if (!result.ok) {
      setError(result.error.message);
      setSaveState("failure");
      return;
    }
    setStatus("archived");
    setSaveState("saved");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={status.toUpperCase()}
        backHref="/programs"
        backLabel="Programs"
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        {status === "archived" ? (
          <section className="mb-5 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Icon name="archive" size={16} /> Archived program
            </div>
            <p className="mt-2 text-[13px] text-[var(--pf-text-2)]">
              History is preserved. Reactivating requires choosing the first
              next split.
            </p>
          </section>
        ) : null}

        <div className="space-y-6">
          <TextField
            id="program-name"
            label="Program name"
            value={name}
            className="min-h-[var(--pf-size-input-prominent)]"
            error={nameError}
            disabled={busy || status === "archived"}
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
                  status !== "archived" ? (
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
                        {split.status === "archived" ? (
                          <Badge>Archived</Badge>
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
                        disabled={busy || status === "archived" || index === 0}
                        onClick={() => void moveSplit(index, -1)}
                        className="flex size-11 items-center justify-center disabled:opacity-[var(--pf-opacity-disabled)]"
                      >
                        <Icon name="arrow-up" size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${split.name} down`}
                        disabled={
                          busy ||
                          status === "archived" ||
                          index === splits.length - 1
                        }
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
            {program && status !== "archived" && splits.length > 0 ? (
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
          {status !== "archived" ? (
            <Action disabled={busy} onClick={() => void save()}>
              {program ? "Save Changes" : "Save as Draft"}
            </Action>
          ) : null}
          {program && activeSplits.length > 0 ? (
            <Sheet
              title={
                status === "active"
                  ? "Set next split"
                  : "Choose first next split"
              }
              description={
                status === "active"
                  ? "This changes the persistent rotation pointer."
                  : "Activation archives any other active program."
              }
              trigger={
                <Action variant="secondary" disabled={busy}>
                  {status === "active"
                    ? "Set Next Split"
                    : status === "archived"
                      ? "Reactivate Program"
                      : "Activate Program"}
                </Action>
              }
            >
              {(close) => (
                <div className="space-y-2">
                  {activeSplits.map((split) => (
                    <Action
                      key={split.id}
                      variant="secondary"
                      className="w-full justify-between"
                      disabled={busy}
                      onClick={() => void chooseNext(split.id, close)}
                    >
                      {split.name}
                      {split.id === nextSplitId ? (
                        <Badge tone="accent">Current</Badge>
                      ) : null}
                    </Action>
                  ))}
                </div>
              )}
            </Sheet>
          ) : null}
          {program && status !== "archived" ? (
            <DestructiveDialog
              title="Archive program?"
              description="Its split templates and History identity are preserved, but it will no longer be active."
              confirmLabel="Archive Program"
              onConfirm={() => void archive()}
              trigger={
                <Action variant="danger" disabled={busy}>
                  Archive Program
                </Action>
              }
            />
          ) : null}
        </StickyActionBar>
      </main>
      <Toast
        message={toast ?? ""}
        visible={toast !== undefined}
        onDismiss={dismissToast}
      />
    </div>
  );
}
