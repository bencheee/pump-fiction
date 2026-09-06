"use client";

import { useState } from "react";

import {
  createMeasurementTypeAction,
  deleteMeasurementTypeAction,
  renameMeasurementTypeAction,
} from "@/app/actions/body";
import type { MeasurementSummary } from "@/features/history/domain/body";
import { validateMeasurementTypeName } from "@/features/history/domain/body-validation";
import {
  Action,
  DestructiveDialog,
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
const parent = "/body/measurements";

/**
 * `S22`. A measurement type is a name and a fixed unit. Under ADR-0024 it has
 * no archived state: it is renamed, or deleted while it holds nothing.
 */
export function MeasurementTypeForm({
  measurement,
}: {
  measurement?: MeasurementSummary;
}) {
  const [name, setName] = useState(measurement?.name ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<SavePhase>("editing");
  const [saveMessage, setSaveMessage] = useState<string>();

  const { returnToParent, reportFailure } = useSaveOutcome(parent);
  const { savedSnapshot } = useSavedSnapshot(name.trim());
  const isSaving = phase === "saving";
  const saveState =
    phase === "editing"
      ? name.trim() === savedSnapshot
        ? "clean"
        : "unsaved"
      : phase;

  async function save() {
    const validation = validateMeasurementTypeName({ name });
    if (!validation.ok) {
      setErrors(validation.fieldErrors);
      setPhase("editing");
      setSaveMessage(validationMessage);
      reportFailure(validationMessage);
      return;
    }

    setErrors({});
    setSaveMessage(undefined);
    setPhase("saving");
    const result = measurement
      ? await renameMeasurementTypeAction({
          id: measurement.id,
          ...validation.value,
        })
      : await createMeasurementTypeAction(validation.value);

    if (!result.ok) {
      setErrors(result.error.fieldErrors ?? {});
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      setPhase("failure");
      reportFailure(result.error.message);
      return;
    }

    returnToParent(measurement ? "Measurement renamed." : "Measurement added.");
  }

  async function remove() {
    if (!measurement) return;
    setPhase("saving");
    setSaveMessage(undefined);
    const result = await deleteMeasurementTypeAction(measurement.id);
    if (!result.ok) {
      setPhase("failure");
      setSaveMessage(result.error.retryable ? undefined : result.error.message);
      reportFailure(result.error.message);
      return;
    }
    returnToParent("Measurement deleted.");
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={measurement ? "Edit Measurement" : "New Measurement"}
        backHref={parent}
        backLabel="Body"
      />
      <main className="flex flex-1 flex-col px-[var(--pf-gutter)] pt-5">
        <div className="space-y-6">
          <TextField
            id="measurement-name"
            label="Name"
            value={name}
            error={errors.name?.[0]}
            hint="Whatever you call it: waist at navel, left upper arm, chest. Measured in centimetres."
            disabled={isSaving}
            autoComplete="off"
            onChange={(event) => {
              setName(event.target.value);
              setPhase("editing");
              setSaveMessage(undefined);
              setErrors({});
            }}
          />

          {measurement && !measurement.deletable ? (
            <section className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4">
              <p className="font-semibold">
                {measurement.entryCount === 1
                  ? "1 measurement recorded"
                  : `${measurement.entryCount} measurements recorded`}
              </p>
              <p className="mt-2 text-[13px] leading-[1.45] text-[var(--pf-text-2)]">
                They are the only record of this measurement, so it cannot be
                deleted while they exist. Renaming it keeps every one of them.
              </p>
            </section>
          ) : null}
        </div>

        <StickyActionBar>
          {/* The v0.4 package puts the save, validation, and outcome cue in the
              first row of this bar on S22. */}
          <SaveStatus
            state={saveState}
            validationMessage={saveMessage}
            onRetry={() => void save()}
          />
          <Action disabled={isSaving} onClick={() => void save()}>
            Save Measurement
          </Action>
          {measurement?.deletable ? (
            <DestructiveDialog
              title="Delete this measurement?"
              description="It has nothing recorded, so nothing is lost."
              confirmLabel="Delete Measurement"
              onConfirm={() => void remove()}
              trigger={
                <Action variant="danger" disabled={isSaving}>
                  Delete Measurement
                </Action>
              }
            />
          ) : null}
        </StickyActionBar>
      </main>
    </div>
  );
}
