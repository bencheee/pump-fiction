"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createWeightEntryAction } from "@/app/actions/weight";
import type { WeightEntry } from "@/features/history/domain/weight";
import { formatKg } from "@/features/history/ui/weight-presentation";
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

/** What Today needs to know about the day's weigh-in, and nothing more. */
export type TodayWeight = Readonly<{
  localDate: string;
  entry: WeightEntry | null;
}>;

/**
 * `MVP-TOD-004`. The card offers the day's weigh-in exactly while the day has
 * none. Once it exists the same card shows it with a link to Weight and no
 * create control, so Today never reads as though a second entry were possible.
 */
export function TodayWeightCard({ weight }: { weight: TodayWeight }) {
  return (
    <section
      aria-label="Today's weight"
      className="rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-4"
    >
      <p className="text-[11px] font-semibold tracking-[0.1em] text-[var(--pf-text-2)] uppercase">
        Today&apos;s weight
      </p>
      {weight.entry ? (
        <RecordedWeight entry={weight.entry} />
      ) : (
        <AddTodayWeight localDate={weight.localDate} />
      )}
    </section>
  );
}

function RecordedWeight({ entry }: { entry: WeightEntry }) {
  return (
    <>
      <p className="pf-numeric mt-3 text-[30px] leading-none font-semibold">
        {formatKg(entry.weightKg)}
      </p>
      <p className="mt-2 text-[12.5px] text-[var(--pf-text-2)]">
        Recorded {formatHistoryDate(entry.entryDate)}. Correct it in Weight.
      </p>
      <Link
        href="/body/weight"
        className="mt-4 flex min-h-11 items-center self-start border-b border-[var(--pf-border-control)] font-medium text-[var(--pf-text-2)]"
      >
        See Weight
      </Link>
    </>
  );
}

function AddTodayWeight({ localDate }: { localDate: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [weight, setWeight] = useState("");
  const [phase, setPhase] = useState<SavePhase | "resolved">("editing");
  const [message, setMessage] = useState<string>();
  const isSaving = phase === "saving";
  // The refusal itself sits on the field; the cue reports only the lifecycle.
  const formPhase: SavePhase = phase === "resolved" ? "editing" : phase;

  async function save(close: () => void) {
    const typed = weight.trim();
    if (typed === "") return refuse("Enter a weight.");
    const weightKg = Number(normalizeDecimalInput(typed));
    if (!Number.isFinite(weightKg)) return refuse("Enter a number.");

    setMessage(undefined);
    setPhase("saving");
    const result = await createWeightEntryAction({
      entryDate: localDate,
      weightKg,
    });

    if (!result.ok) {
      // The date is fixed to today and cannot be in the future, so the only
      // way it can be refused is that today's weigh-in appeared meanwhile,
      // through S20 or another tab. That is resolved, not failed: the create
      // path closes and Today reloads showing the value that now exists.
      if (result.error.fieldErrors?.entryDate) {
        setPhase("resolved");
        router.refresh();
        return;
      }
      setPhase("failure");
      setMessage(result.error.retryable ? undefined : result.error.message);
      showToast(result.error.message);
      return;
    }

    setWeight("");
    setPhase("editing");
    close();
    showToast("Weight saved.");
    router.refresh();
  }

  function refuse(text: string) {
    setPhase("editing");
    setMessage(text);
  }

  return (
    <Sheet
      title="Add today's weight"
      description={formatHistoryDate(localDate)}
      trigger={
        <Action variant="secondary" className="mt-4 w-full">
          Add today&apos;s weight
        </Action>
      }
    >
      {(close) =>
        phase === "resolved" ? (
          <div className="space-y-4">
            <p role="status" className="text-[var(--pf-text-2)]">
              Today already has a weigh-in. Today now shows it, and Weight is
              where you correct it.
            </p>
            <Action variant="secondary" className="w-full" onClick={close}>
              Close
            </Action>
          </div>
        ) : (
          <div className="space-y-4">
            <NumericField
              id="today-weight-kg"
              label="Weight (kg)"
              value={weight}
              error={message}
              disabled={isSaving}
              autoComplete="off"
              onChange={(event) => {
                setWeight(event.target.value);
                setPhase("editing");
                setMessage(undefined);
              }}
            />
            <SaveStatus
              state={formPhase === "editing" ? "clean" : formPhase}
              onRetry={() => void save(close)}
            />
            <Action
              className="w-full"
              disabled={isSaving}
              onClick={() => void save(close)}
            >
              {isSaving ? "Saving…" : "Save Weight"}
            </Action>
          </div>
        )
      }
    </Sheet>
  );
}
