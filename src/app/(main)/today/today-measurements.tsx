"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createTodayMeasurementEntriesAction } from "@/app/actions/body";
import {
  missingToday,
  type TodayMeasurements,
} from "@/features/history/domain/body";
import { formatCm } from "@/features/history/ui/body-presentation";
import {
  Action,
  normalizeDecimalInput,
  NumericField,
  SaveStatus,
  Sheet,
  useToast,
  type SavePhase,
} from "@/shared/ui";

import { formatHistoryDate } from "../history/history-presentation";

/**
 * `MVP-TOD-005`. The card offers the day's measurements exactly while the day
 * is missing at least one, and shows what is recorded once none are missing.
 * It renders nothing at all when no measurement is defined: there is nothing
 * to ask for, and Today should not advertise a screen the user has not used.
 */
export function TodayMeasurementsCard({
  measurements,
}: {
  measurements: TodayMeasurements;
}) {
  if (measurements.measurements.length === 0) return null;
  const missing = missingToday(measurements);

  return (
    <section aria-label="Today's measurements">
      <p>Today&apos;s measurements</p>
      {missing.length === 0 ? (
        <Recorded measurements={measurements} />
      ) : (
        <AddTodayMeasurements
          localDate={measurements.localDate}
          missing={missing}
        />
      )}
    </section>
  );
}

function Recorded({ measurements }: { measurements: TodayMeasurements }) {
  return (
    <>
      <ul>
        {measurements.measurements.map((measurement) => (
          <li key={measurement.id}>
            <span>{measurement.name}</span>
            <span>{formatCm(measurement.valueCm ?? 0)}</span>
          </li>
        ))}
      </ul>
      <p>
        Recorded {formatHistoryDate(measurements.localDate)}. Correct them in
        Body.
      </p>
      <Link href="/body/measurements">See Body</Link>
    </>
  );
}

function AddTodayMeasurements({
  localDate,
  missing,
}: {
  localDate: string;
  missing: readonly { id: string; name: string }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<SavePhase>("editing");
  const isSaving = phase === "saving";

  async function save(close: () => void) {
    // Every missing measurement is asked for, and every one of them is
    // required: a partial day would need a second create path to finish, and
    // ADR-0030 left exactly one.
    const blank = missing.filter((one) => (values[one.id] ?? "").trim() === "");
    if (blank.length > 0) {
      setErrors(
        Object.fromEntries(blank.map((one) => [one.id, "Enter a value."])),
      );
      return;
    }

    setErrors({});
    setPhase("saving");
    const result = await createTodayMeasurementEntriesAction(
      missing.map((one) => ({
        measurementTypeId: one.id,
        entryDate: localDate,
        valueCm: Number(normalizeDecimalInput(values[one.id] ?? "")),
      })),
    );

    if (!result.ok) {
      setPhase(result.error.retryable ? "failure" : "editing");
      const fieldErrors = result.error.fieldErrors ?? {};
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([id, messages]) => [
            id,
            messages[0] ?? "Check this measurement.",
          ]),
        ),
      );
      showToast(result.error.message);
      return;
    }

    setValues({});
    setPhase("editing");
    close();
    showToast("Measurements saved.");
    router.refresh();
  }

  return (
    <Sheet
      title="Add today's measurements"
      description={formatHistoryDate(localDate)}
      trigger={
        <Action variant="secondary">Add today&apos;s measurements</Action>
      }
    >
      {(close) => (
        <div>
          {missing.map((one) => (
            <NumericField
              key={one.id}
              id={`today-measurement-${one.id}`}
              label={`${one.name} (cm)`}
              value={values[one.id] ?? ""}
              error={errors[one.id]}
              disabled={isSaving}
              autoComplete="off"
              onChange={(event) => {
                const next = event.target.value;
                setValues((current) => ({ ...current, [one.id]: next }));
                setErrors((current) => ({ ...current, [one.id]: "" }));
                setPhase("editing");
              }}
            />
          ))}
          <SaveStatus
            state={phase === "editing" ? "clean" : phase}
            onRetry={() => void save(close)}
          />
          <Action disabled={isSaving} onClick={() => void save(close)}>
            {isSaving ? "Saving…" : "Save Measurements"}
          </Action>
        </div>
      )}
    </Sheet>
  );
}
