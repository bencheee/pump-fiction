"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import {
  ActionOverlay,
  ActionsTrigger,
  DatePicker,
  normalizeDecimalInput,
  NumericField,
  Overlay,
  SaveStatus,
  useToast,
  type SavePhase,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

export type EntrySaveResult =
  | Readonly<{ ok: true; toast: string }>
  | Readonly<{ ok: false; message: string }>;

/**
 * Recording a weigh-in or a measurement, as the design draws it: a panel with
 * the date on a month grid and the value on its own field, committed through
 * the `···` actions panel. An earlier date is fine; a future one is refused by
 * the picker itself rather than by a message after the fact.
 */
export function BodyEntryOverlay({
  trigger,
  title,
  valueLabel,
  placeholder,
  hint,
  localDate,
  onSave,
  saveLabel,
}: {
  trigger: ReactElement;
  title: string;
  valueLabel: string;
  placeholder: string;
  hint: string;
  /** Today in the application's zone: the default and the latest allowed date. */
  localDate: string;
  onSave: (input: {
    entryDate: string;
    value: number;
  }) => Promise<EntrySaveResult>;
  saveLabel: string;
}) {
  const { showToast } = useToast();
  const [entryDate, setEntryDate] = useState(localDate);
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<SavePhase>("editing");
  const [message, setMessage] = useState<string>();
  const saving = phase === "saving";

  function refuse(text: string) {
    setMessage(text);
    setPhase("failure");
  }

  async function save(close: () => void) {
    const typed = value.trim();
    if (typed === "") return refuse("Enter a value.");
    const parsed = Number(normalizeDecimalInput(typed));
    if (!Number.isFinite(parsed)) return refuse("Enter a number.");

    setMessage(undefined);
    setPhase("saving");
    const result = await onSave({ entryDate, value: parsed });
    if (!result.ok) return refuse(result.message);

    setPhase("editing");
    setValue("");
    setEntryDate(localDate);
    close();
    showToast(result.toast);
  }

  return (
    <Overlay
      title={title}
      trigger={trigger}
      onOpenChange={(open) => {
        if (open) {
          setEntryDate(localDate);
          setValue("");
          setMessage(undefined);
          setPhase("editing");
        }
      }}
      footer={(close) => (
        <>
          <SaveStatus
            state={phase === "saving" ? "saving" : "clean"}
            validationMessage={phase === "failure" ? message : undefined}
          />
          <ActionOverlay
            trigger={
              <ActionsTrigger label={`${title} actions`} disabled={saving} />
            }
            title={title}
            meta={formatHistoryDate(entryDate)}
            actions={[
              {
                key: "save",
                label: saveLabel,
                icon: "check",
                onRun: () => void save(close),
              },
            ]}
          />
        </>
      )}
    >
      <div className="flex flex-col gap-4.5">
        <DatePicker
          label="Date"
          value={entryDate}
          displayValue={formatHistoryDate(entryDate)}
          today={localDate}
          max={localDate}
          hint="An earlier date is fine. A future one is not."
          onChange={setEntryDate}
        />
        <NumericField
          id="body-entry-value"
          label={valueLabel}
          placeholder={placeholder}
          hint={hint}
          value={value}
          disabled={saving}
          onChange={(event) => {
            setValue(event.target.value);
            if (phase === "failure") {
              setPhase("editing");
              setMessage(undefined);
            }
          }}
        />
      </div>
    </Overlay>
  );
}
