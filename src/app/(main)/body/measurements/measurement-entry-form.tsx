"use client";

import { useState } from "react";

import {
  createMeasurementEntryAction,
  deleteMeasurementEntryAction,
  updateMeasurementEntryAction,
} from "@/app/actions/body";
import type {
  MeasurementEntry,
  MeasurementType,
} from "@/features/history/domain/body";
import { validateMeasurementEntry } from "@/features/history/domain/body-validation";
import {
  Action,
  DestructiveDialog,
  normalizeDecimalInput,
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

/** `S24`. Its validation and destructive behaviour mirror `S20`, scoped to one type. */
export function MeasurementEntryForm({
  type,
  entry,
  localDate,
}: {
  type: MeasurementType;
  entry?: MeasurementEntry;
  localDate: string;
}) {
  const parent = `/body/measurements/${type.id}`;
  const [entryDate, setEntryDate] = useState(entry?.entryDate ?? localDate);
  const [value, setValue] = useState(entry ? String(entry.valueCm) : "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<SavePhase>("editing");
  const [saveMessage, setSaveMessage] = useState<string>();

  const { returnToParent, reportFailure } = useSaveOutcome(parent);
  const { savedSnapshot } = useSavedSnapshot(snapshotOf(entryDate, value));
  const isSaving = phase === "saving";
  const saveState =
    phase === "editing"
      ? snapshotOf(entryDate, value) === savedSnapshot
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
    const typed = value.trim();
    if (typed === "") return fail({ valueCm: ["Enter a measurement."] });
    const valueCm = Number(normalizeDecimalInput(typed));
    if (!Number.isFinite(valueCm))
      return fail({ valueCm: ["Enter a number."] });

    const validation = validateMeasurementEntry(
      { measurementTypeId: type.id, entryDate, valueCm },
      localDate,
    );
    if (!validation.ok) return fail(validation.fieldErrors);

    setErrors({});
    setSaveMessage(undefined);
    setPhase("saving");
    const result = entry
      ? await updateMeasurementEntryAction({ id: entry.id, entryDate, valueCm })
      : await createMeasurementEntryAction(validation.value);

    if (!result.ok) {
      setErrors(result.error.fieldErrors ?? {});
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }

    returnToParent("Entry saved.");
  }

  async function remove() {
    if (!entry) return;
    setPhase("saving");
    setSaveMessage(undefined);
    const result = await deleteMeasurementEntryAction(entry.id);
    if (!result.ok) {
      setPhase("failure");
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Entry deleted.");
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={entry ? "Edit Entry" : "Add Entry"}
        backHref={parent}
        backLabel={type.name}
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        <div className="space-y-6">
          <p className="[overflow-wrap:anywhere] text-[var(--pf-text-2)]">
            {type.name}
          </p>

          <TextField
            id="measurement-date"
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
            id="measurement-value"
            label="Measurement (cm)"
            value={value}
            error={errors.valueCm?.[0]}
            hint="Up to two decimals."
            disabled={isSaving}
            autoComplete="off"
            onChange={(event) => {
              setValue(event.target.value);
              markChanged("valueCm");
            }}
          />
        </div>

        <StickyActionBar>
          {/* The v0.4 package puts the save, validation, and outcome cue in the
              first row of this bar on S24. */}
          <SaveStatus
            state={saveState}
            validationMessage={saveMessage}
            onRetry={() => void save()}
          />
          <Action disabled={isSaving} onClick={() => void save()}>
            Save Entry
          </Action>
          {entry ? (
            <DestructiveDialog
              title="Delete this entry?"
              description="The latest change and the total change beside it are recalculated. The measurement itself stays."
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

function snapshotOf(entryDate: string, value: string): string {
  return JSON.stringify([entryDate, value.trim()]);
}
