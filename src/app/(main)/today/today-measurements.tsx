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
    <section
      aria-label="Today's measurements"
      className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4"
    >
      <p className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
        Today&apos;s measurements
      </p>
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
      <ul className="mt-3 flex flex-col gap-1.5">
        {measurements.measurements.map((measurement) => (
          <li
            key={measurement.id}
            className="flex flex-wrap items-baseline justify-between gap-2"
          >
            <span className="[overflow-wrap:anywhere]">{measurement.name}</span>
            <span className="pf-numeric font-semibold">
              {formatCm(measurement.valueCm ?? 0)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] text-[var(--pf-text-2)]">
        Recorded {formatHistoryDate(measurements.localDate)}. Correct them in
        Body.
      </p>
      <Link
        href="/body/measurements"
        className="mt-3 flex min-h-11 items-center self-start border-b border-[var(--pf-border-control)] font-medium text-[var(--pf-text-2)]"
      >
        See Body
      </Link>
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
        valueCm: Number((values[one.id] ?? "").trim()),
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
        <Action variant="secondary" className="mt-4 w-full">
          Add today&apos;s measurements
        </Action>
      }
    >
      {(close) => (
        <div className="space-y-4">
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
          <Action
            className="w-full"
            disabled={isSaving}
            onClick={() => void save(close)}
          >
            {isSaving ? "Saving…" : "Save Measurements"}
          </Action>
        </div>
      )}
    </Sheet>
  );
}
