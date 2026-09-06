"use client";

import { useState } from "react";

import {
  createWeightEntryAction,
  deleteWeightEntryAction,
  updateWeightEntryAction,
} from "@/app/actions/weight";
import type { WeightEntry } from "@/features/history/domain/weight";
import { validateWeightEntry } from "@/features/history/domain/weight-validation";
import {
  Action,
  DestructiveDialog,
  NumericField,
  SaveStatus,
  StickyActionBar,
  TextField,
  TopBar,
  useSaveOutcome,
  useSavedSnapshot,
  type SavePhase,
} from "@/shared/ui";

type FieldErrors = Readonly<Record<string, readonly string[]>>;

const validationMessage = "Check the highlighted fields.";
const parent = "/body/weight";

export function WeightForm({
  entry,
  localDate,
}: {
  entry?: WeightEntry;
  localDate: string;
}) {
  const [entryDate, setEntryDate] = useState(entry?.entryDate ?? localDate);
  const [weight, setWeight] = useState(entry ? String(entry.weightKg) : "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<SavePhase>("editing");
  const [saveMessage, setSaveMessage] = useState<string>();

  const { returnToParent, reportFailure } = useSaveOutcome(parent);
  const { savedSnapshot } = useSavedSnapshot(snapshotOf(entryDate, weight));
  const isSaving = phase === "saving";
  const saveState =
    phase === "editing"
      ? snapshotOf(entryDate, weight) === savedSnapshot
        ? "clean"
        : "unsaved"
      : phase;

  function markChanged(field: string) {
    setPhase("editing");
    setSaveMessage(undefined);
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function fail(fieldErrors: FieldErrors) {
    setErrors(fieldErrors);
    setPhase("editing");
    setSaveMessage(validationMessage);
    reportFailure(validationMessage);
  }

  async function save() {
    // The entered text becomes a number here; every product rule about that
    // number belongs to the domain validator both this screen and the server use.
    const typed = weight.trim();
    if (typed === "") return fail({ weightKg: ["Enter a weight."] });
    const weightKg = Number(typed);
    if (!Number.isFinite(weightKg))
      return fail({ weightKg: ["Enter a number, using a dot for decimals."] });

    const validation = validateWeightEntry({ entryDate, weightKg }, localDate);
    if (!validation.ok) return fail(validation.fieldErrors);

    setErrors({});
    setSaveMessage(undefined);
    setPhase("saving");
    const result = entry
      ? await updateWeightEntryAction({ id: entry.id, ...validation.value })
      : await createWeightEntryAction(validation.value);

    if (!result.ok) {
      setErrors(result.error.fieldErrors ?? {});
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }

    returnToParent("Weigh-in saved.");
  }

  async function remove() {
    if (!entry) return;
    setPhase("saving");
    setSaveMessage(undefined);
    const result = await deleteWeightEntryAction(entry.id);
    if (!result.ok) {
      setPhase("failure");
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Weigh-in deleted.");
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={entry ? "Edit Weight" : "Add Weight"}
        backHref={parent}
        backLabel="Weight"
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        <div className="space-y-6">
          <TextField
            id="weight-date"
            label="Date"
            type="date"
            value={entryDate}
            max={localDate}
            error={errors.entryDate?.[0]}
            hint="An earlier date is fine. A future one is not."
            disabled={isSaving}
            onChange={(event) => {
              setEntryDate(event.target.value);
              markChanged("entryDate");
            }}
          />

          <NumericField
            id="weight-kg"
            label="Weight (kg)"
            value={weight}
            error={errors.weightKg?.[0]}
            hint="Up to two decimals."
            disabled={isSaving}
            autoComplete="off"
            onChange={(event) => {
              setWeight(event.target.value);
              markChanged("weightKg");
            }}
          />
        </div>

        <StickyActionBar>
          {/* The v0.4 package puts the save, validation, and outcome cue in the
              first row of this bar on S20. */}
          <SaveStatus
            state={saveState}
            validationMessage={saveMessage}
            onRetry={() => void save()}
          />
          <Action disabled={isSaving} onClick={() => void save()}>
            Save Weight
          </Action>
          {entry ? (
            <DestructiveDialog
              title="Delete this weigh-in?"
              description="Its weekly average and every change beside it are recalculated. Nothing else in History changes."
              confirmLabel="Delete Entry"
              onConfirm={() => void remove()}
              trigger={
                <Action variant="danger" disabled={isSaving}>
                  Delete Entry
                </Action>
              }
            />
          ) : null}
        </StickyActionBar>
      </main>
    </div>
  );
}

function snapshotOf(entryDate: string, weight: string): string {
  return JSON.stringify([entryDate, weight.trim()]);
}
