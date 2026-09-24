"use client";

import { useState } from "react";

import { Icon } from "./icon";
import { Sheet } from "./overlays";
import type { TransientOverlay } from "./transient-overlay";
import "./date-picker.css";

/*
 * The date picker — the prototype's screen 21 — ported for step 20 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy of
 * `Workout App - Prototype.dc.html` at the etag the plan records:
 *   markup        lines 1285-1310, `data-screen-label="Choose date"`
 *   bound values  lines 3118-3145 (`dpOpen` … `dpCells`), 1638-1655
 *                 (`shiftMonth`, `monthCells`, `monthLabel`)
 *
 * A month of days, Monday first, over the panel the picker was opened from. A
 * press on a day chooses it and closes the picker; a day after today cannot
 * be chosen, and the month after today's cannot be turned to.
 */
export function DatePicker({
  overlay,
  value,
  localDate,
  onPick,
}: {
  overlay: TransientOverlay;
  /** The chosen date, `YYYY-MM-DD`. */
  value: string;
  /** Today in the configured zone: the last day that can be chosen. */
  localDate: string;
  onPick: (date: string) => void;
}) {
  const todayMonth = localDate.slice(0, 7);
  // `dpMonth` (3120): the picker opens on the chosen date's month.
  const [month, setMonth] = useState(value.slice(0, 7) || todayMonth);
  const [openedFor, setOpenedFor] = useState(overlay.open);
  if (overlay.open !== openedFor) {
    setOpenedFor(overlay.open);
    if (overlay.open) setMonth(value.slice(0, 7) || todayMonth);
  }
  const atToday = month >= todayMonth;

  const pick = (date: string) => {
    onPick(date);
    overlay.requestOpenChange(false);
  };

  return (
    <Sheet panel="choose-date" overlay={overlay} title="Choose date">
      <div data-date-picker-month="">
        <button
          type="button"
          aria-label="Previous month"
          title="Previous month"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          {/* The prototype turns the next chevron round (line 1293). */}
          <Icon name="chevron-right" size={16} />
        </button>
        <span aria-live="polite">{monthLabel(month)}</span>
        {/* `dpNextBg` and `dpNextColor` (3129-3130): the month after today's
            is drawn out and cannot be turned to. */}
        <button
          type="button"
          aria-label="Next month"
          title="Next month"
          disabled={atToday}
          onClick={() => {
            const next = shiftMonth(month, 1);
            if (next <= todayMonth) setMonth(next);
          }}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div data-date-picker-grid="" role="group" aria-label={monthLabel(month)}>
        {weekdays.map((day) => (
          <span key={day} data-date-picker-weekday="" aria-hidden="true">
            {day.slice(0, 2)}
          </span>
        ))}
        {monthCells(month).map((date, index) => {
          if (date === null)
            return (
              <span key={`e${index}`} data-date-picker-day="" aria-hidden />
            );
          const selected = date === value;
          const future = date > localDate;
          return (
            <button
              key={date}
              type="button"
              data-date-picker-day={
                selected ? "selected" : future ? "future" : ""
              }
              data-today={date === localDate && !selected ? "" : undefined}
              aria-label={dayLabel(date)}
              aria-pressed={selected}
              disabled={future}
              onClick={() => pick(date)}
            >
              {Number(date.slice(8, 10))}
            </button>
          );
        })}
      </div>

      {/* `dpToday` (3131). */}
      <button
        type="button"
        data-date-picker-today=""
        aria-label="Jump to today"
        title="Jump to today"
        onClick={() => pick(localDate)}
      >
        Today
      </button>
    </Sheet>
  );
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** `shiftMonth` (1638). */
function shiftMonth(month: string, delta: number): string {
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7)) - 1 + delta;
  const date = new Date(Date.UTC(year, index, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** `monthCells` (1643): the month's days, Monday first, padded to full weeks. */
function monthCells(month: string): (string | null)[] {
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7)) - 1;
  const lead = (new Date(Date.UTC(year, index, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day += 1)
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** `monthLabel` (1652): `September 2026`. */
function monthLabel(month: string): string {
  const parsed = new Date(`${month}-01T00:00:00Z`);
  return Number.isFinite(parsed.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsed)
    : month;
}

/** `dateLabel` (1634): `Thu 24 Sept`, which a day's button is named. */
function dayLabel(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
