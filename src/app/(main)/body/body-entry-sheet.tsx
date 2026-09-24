"use client";

import { useRouter } from "next/navigation";
import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";

import {
  createMeasurementEntryAction,
  createMeasurementTypeAction,
  deleteMeasurementEntryAction,
  deleteMeasurementTypeAction,
  renameMeasurementTypeAction,
  updateMeasurementEntryAction,
} from "@/app/actions/body";
import {
  createWeightEntryAction,
  deleteWeightEntryAction,
  updateWeightEntryAction,
} from "@/app/actions/weight";
import {
  validateMeasurementEntry,
  validateMeasurementTypeName,
} from "@/features/history/domain/body-validation";
import { validateWeightEntry } from "@/features/history/domain/weight-validation";
import {
  Action,
  ActionsPanel,
  DatePicker,
  Icon,
  normalizeDecimalInput,
  Sheet,
  useToast,
  useTransientOverlay,
  type ActionEntry,
} from "@/shared/ui";

import { formatHistoryDate } from "@/app/(main)/history/history-presentation";

/*
 * The Body entry panel — the prototype's screen 20 — ported for step 20 of
 * docs/design/redesign-v2/PLAN.md, with the date picker (screen 21) it opens.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 1256-1282, `data-screen-label="Body entry"`
 *   bound values  lines 2759-2807 (`saveSheet`, `deleteSheet`), 2878-2884
 *                 (its Actions entries), 3102-3117 (`bshTitle` … `bshClose`)
 *
 * One panel for everything Body records: a weigh-in, a measurement's entry,
 * and a measurement itself. What it saves goes through the same actions and
 * the same domain validators the forms it replaces used.
 */

/** A value already saved on a date, so a save onto that date corrects it. */
type Existing = Readonly<{ id: string; date: string; value: number }>;

type Target =
  | Readonly<{
      kind: "weight";
      entry?: Existing;
      /** Every weigh-in's date and id: `saveSheet` (2776) corrects the one a
          chosen date already holds rather than adding a second. */
      saved: readonly Existing[];
    }>
  | Readonly<{
      kind: "measurement";
      typeId: string;
      entry?: Existing;
      saved: readonly Existing[];
    }>
  | Readonly<{
      kind: "type";
      /** An existing measurement to rename or delete; the prototype only adds. */
      measurement?: Readonly<{ id: string; name: string }>;
    }>;

export function BodyEntrySheet({
  target,
  localDate,
  trigger,
  onDeleted,
}: {
  target: Target;
  /** Today in the configured zone: the default date and the last one allowed. */
  localDate: string;
  trigger: ReactElement;
  /** Where to go once what the panel was opened on no longer exists. */
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const overlay = useTransientOverlay();
  const actionsOverlay = useTransientOverlay();
  const pickerOverlay = useTransientOverlay();
  const pendingRef = useRef<(() => void) | null>(null);
  const [busy, setBusy] = useState(false);

  const initialDate =
    target.kind === "type" ? localDate : (target.entry?.date ?? localDate);
  const initialValue =
    target.kind === "type"
      ? (target.measurement?.name ?? "")
      : target.entry
        ? String(target.entry.value)
        : "";
  const [date, setDate] = useState(initialDate);
  const [value, setValue] = useState(initialValue);

  // `bshClose` (3117) and every opening start from what the target holds.
  const [openedFor, setOpenedFor] = useState(overlay.open);
  if (overlay.open !== openedFor) {
    setOpenedFor(overlay.open);
    if (overlay.open) {
      setDate(initialDate);
      setValue(initialValue);
    }
  }

  // What an Actions entry runs waits for the panel to give its history entry
  // back first — the mechanism steps 6, 9, 14, 15 and 17 use.
  useEffect(() => {
    if (actionsOverlay.open) return;
    const run = pendingRef.current;
    if (run === null) return;
    pendingRef.current = null;
    run();
  }, [actionsOverlay.open]);

  // A move away once what the panel was opened on is gone waits the same way,
  // for the panel's own history entry: leaving first would be undone by the
  // step back that closes it.
  const afterCloseRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (overlay.open) return;
    const run = afterCloseRef.current;
    if (run === null) return;
    afterCloseRef.current = null;
    run();
  }, [overlay.open]);

  const existing =
    target.kind === "type" ? undefined : (target.entry ?? undefined);
  const copy = copyFor(target);

  function finish(message: string) {
    overlay.requestOpenChange(false);
    showToast(message);
    router.refresh();
  }

  /* `saveSheet` (2761-2794). */
  async function save() {
    if (target.kind === "type") {
      const validation = validateMeasurementTypeName({ name: value });
      if (!validation.ok) {
        showToast("Enter a measurement name.");
        return;
      }
      setBusy(true);
      const result = target.measurement
        ? await renameMeasurementTypeAction({
            id: target.measurement.id,
            ...validation.value,
          })
        : await createMeasurementTypeAction(validation.value);
      setBusy(false);
      if (!result.ok) return showToast(result.error.message);
      finish(
        target.measurement ? "Measurement renamed." : "Measurement added.",
      );
      return;
    }

    const number = Number(normalizeDecimalInput(value.trim()));
    if (value.trim() === "" || !Number.isFinite(number) || number <= 0) {
      showToast("Enter a number.");
      return;
    }
    if (date > localDate) {
      showToast("A future date is not allowed.");
      return;
    }
    // A date that already holds a value is corrected rather than doubled.
    const onDate = existing ?? target.saved.find((item) => item.date === date);

    setBusy(true);
    let result;
    if (target.kind === "weight") {
      const validation = validateWeightEntry(
        { entryDate: date, weightKg: number },
        localDate,
      );
      if (!validation.ok) {
        setBusy(false);
        return showToast(firstMessage(validation.fieldErrors));
      }
      result = onDate
        ? await updateWeightEntryAction({ id: onDate.id, ...validation.value })
        : await createWeightEntryAction(validation.value);
    } else {
      const validation = validateMeasurementEntry(
        { measurementTypeId: target.typeId, entryDate: date, valueCm: number },
        localDate,
      );
      if (!validation.ok) {
        setBusy(false);
        return showToast(firstMessage(validation.fieldErrors));
      }
      result = onDate
        ? await updateMeasurementEntryAction({
            id: onDate.id,
            entryDate: date,
            valueCm: number,
          })
        : await createMeasurementEntryAction(validation.value);
    }
    setBusy(false);
    if (!result.ok) return showToast(result.error.message);
    finish(target.kind === "weight" ? "Weigh-in saved." : "Measurement saved.");
  }

  /* `deleteSheet` (2795-2807). */
  async function remove() {
    setBusy(true);
    let result;
    if (target.kind === "type") {
      if (!target.measurement) return setBusy(false);
      result = await deleteMeasurementTypeAction(target.measurement.id);
    } else if (existing) {
      result =
        target.kind === "weight"
          ? await deleteWeightEntryAction(existing.id)
          : await deleteMeasurementEntryAction(existing.id);
    } else return setBusy(false);
    setBusy(false);
    if (!result.ok) return showToast(result.error.message);
    showToast(
      target.kind === "weight"
        ? "Weigh-in deleted."
        : target.kind === "type"
          ? "Measurement deleted."
          : "Entry deleted.",
    );
    afterCloseRef.current = onDeleted ?? (() => router.refresh());
    overlay.requestOpenChange(false);
  }

  /* `actRaw` for the Body entry panel (2878-2884). */
  const canDelete =
    target.kind === "type" ? Boolean(target.measurement) : Boolean(existing);
  const actions: ActionEntry[] = [
    {
      key: "save",
      label: copy.save,
      icon: "check",
      disabled: busy,
      run: () => {
        pendingRef.current = () => void save();
      },
    },
    ...(canDelete
      ? [
          {
            key: "delete",
            label: copy.delete,
            icon: "trash-2" as const,
            disabled: busy,
            run: () => {
              pendingRef.current = () => void remove();
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Sheet
        panel="body-entry"
        overlay={overlay}
        title={copy.title}
        trigger={cloneElement(trigger)}
      >
        <div data-body-entry-fields="">
          {target.kind === "type" ? null : (
            <div data-body-entry-field="">
              <span id="body-entry-date">Date</span>
              {/* `dpOpen` (3120): the field is a button that opens the
                  picker over the panel. */}
              <button
                type="button"
                data-body-entry-date=""
                aria-label="Choose date"
                aria-describedby="body-entry-date"
                title="Choose date"
                disabled={busy}
                onClick={() => pickerOverlay.requestOpenChange(true)}
              >
                <span>{formatHistoryDate(date)}</span>
                <Icon name="calendar-check" size={17} />
              </button>
              <span>An earlier date is fine. A future one is not.</span>
            </div>
          )}
          <label data-body-entry-field="">
            <span>{copy.valueLabel}</span>
            <input
              value={value}
              inputMode={target.kind === "type" ? "text" : "decimal"}
              autoComplete="off"
              placeholder={copy.placeholder}
              aria-label={copy.valueLabel}
              disabled={busy}
              onChange={(event) => setValue(event.target.value)}
            />
            <span>{copy.hint}</span>
          </label>
        </div>

        <div data-body-entry-footer="">
          <ActionsPanel
            panel="body-entry-actions"
            heading={copy.title}
            meta={
              target.kind === "type"
                ? "Recorded in centimetres."
                : formatHistoryDate(date)
            }
            overlay={actionsOverlay}
            items={actions}
            trigger={
              <Action variant="actions" aria-label="Actions" title="Actions">
                {"···"}
              </Action>
            }
          />
        </div>
      </Sheet>

      {target.kind === "type" ? null : (
        <DatePicker
          overlay={pickerOverlay}
          value={date}
          localDate={localDate}
          onPick={setDate}
        />
      )}
    </>
  );
}

/** `bshTitle`, `bshValueLabel`, `bshPlaceholder`, `bshHint`, `bshSaveLabel`. */
function copyFor(target: Target) {
  if (target.kind === "type")
    return {
      title: target.measurement ? "Edit measurement" : "Add measurement",
      valueLabel: "Measurement name",
      placeholder: "Waist",
      hint: "Recorded in centimetres.",
      save: target.measurement ? "Save changes" : "Add measurement",
      delete: "Delete measurement",
    };
  if (target.kind === "weight")
    return {
      title: target.entry ? "Edit weigh-in" : "Add weigh-in",
      valueLabel: "Weight (kg)",
      placeholder: "81.0",
      hint: "Up to two decimals.",
      save: "Save weigh-in",
      delete: "Delete entry",
    };
  return {
    title: target.entry ? "Edit entry" : "Record measurement",
    valueLabel: "Measurement (cm)",
    placeholder: "38.5",
    hint: "Up to two decimals.",
    save: "Save entry",
    delete: "Delete entry",
  };
}

function firstMessage(
  errors: Readonly<Record<string, readonly string[] | undefined>>,
): string {
  return (
    Object.values(errors).find((list) => list?.length)?.[0] ??
    "Check the entry."
  );
}

/**
 * `bmAddType` (line 1102): the Measurements tab's `Add measurement`. The tab
 * is a server page, and a trigger it built would reach the panel as a server
 * element the panel cannot take hold of, so the pill is drawn here.
 */
export function AddMeasurementSheet({ localDate }: { localDate: string }) {
  return (
    <BodyEntrySheet
      target={{ kind: "type" }}
      localDate={localDate}
      trigger={
        <button type="button" data-body-add="" aria-label="Add measurement">
          <Icon name="plus" size={16} />
          Add measurement
        </button>
      }
    />
  );
}
