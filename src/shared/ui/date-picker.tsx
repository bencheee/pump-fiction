"use client";

import { useState } from "react";

import { Action } from "./action";
import { classNames } from "./class-names";
import { Icon } from "./icon";
import { Overlay } from "./overlays";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function toUtc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthOf(date: string): string {
  return date.slice(0, 7);
}

function shiftMonth(month: string, delta: number): string {
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7)) - 1 + delta;
  return iso(new Date(Date.UTC(year, index, 1))).slice(0, 7);
}

function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtc(`${month}-01`));
}

/** Leading blanks, then every day of the month, padded to whole weeks. */
function monthCells(month: string): (string | null)[] {
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7)) - 1;
  const lead = (new Date(Date.UTC(year, index, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();

  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function MonthCalendar({
  value,
  today,
  max,
  onSelect,
}: {
  value: string;
  today: string;
  /** Latest selectable date, inclusive. */
  max?: string;
  onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(() => monthOf(value));
  const nextMonthStart = `${shiftMonth(month, 1)}-01`;
  const canGoForward = max === undefined || nextMonthStart <= max;

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          aria-label="Previous month"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-bg-surface)] text-[var(--pf-text-2)]"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <span
          aria-live="polite"
          className="min-w-0 flex-1 text-center text-[17px] font-semibold"
        >
          {monthLabel(month)}
        </span>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className={classNames(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            canGoForward
              ? "bg-[var(--pf-bg-surface)] text-[var(--pf-text-2)]"
              : "bg-transparent text-[var(--pf-glyph-dim)]",
          )}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            aria-hidden="true"
            className="flex h-6 items-center justify-center text-[11px] font-semibold tracking-[0.06em] text-[var(--pf-text-4)] uppercase"
          >
            {weekday.slice(0, 2)}
          </span>
        ))}
        {monthCells(month).map((date, index) => {
          if (date === null) {
            return <span key={`blank-${index}`} aria-hidden="true" />;
          }

          const selected = date === value;
          const isToday = date === today;
          const disabled = max !== undefined && date > max;

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              aria-pressed={selected}
              aria-label={new Intl.DateTimeFormat("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(toUtc(date))}
              className={classNames(
                "pf-numeric flex h-[46px] items-center justify-center rounded-[var(--pf-r1)] border text-[17px] transition-[background-color,color] duration-[var(--pf-mo-fast)] ease-linear",
                selected
                  ? "border-[var(--pf-accent)] bg-[var(--pf-accent)] font-bold text-[var(--pf-on-accent)]"
                  : disabled
                    ? "border-transparent bg-transparent font-medium text-[var(--pf-glyph-dim)]"
                    : isToday
                      ? "border-[var(--pf-accent)] bg-[var(--pf-bg-surface)] font-semibold text-[var(--pf-text)]"
                      : "border-transparent bg-[var(--pf-bg-surface)] font-medium text-[var(--pf-text-2)]",
              )}
            >
              {Number(date.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The date field from the body-entry overlay: a 58px button showing the chosen
 * day, opening the full-screen month grid.
 */
export function DatePicker({
  label,
  value,
  displayValue,
  today,
  max,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  displayValue: string;
  today: string;
  max?: string;
  hint?: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[length:var(--pf-type-label-size)] font-semibold tracking-[0.1em] text-[var(--pf-text-4)] uppercase">
        {label}
      </span>
      <Overlay
        title="Choose date"
        trigger={
          <button
            type="button"
            aria-label={`${label}: ${displayValue}`}
            className="flex h-[var(--pf-size-input)] w-full items-center gap-3 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[18px] text-left transition-colors duration-[var(--pf-mo-fast)] ease-linear hover:border-[var(--pf-border-strong)]"
          >
            <span className="pf-numeric min-w-0 flex-1 truncate text-[18px]">
              {displayValue}
            </span>
            <Icon
              name="calendar-check"
              size={17}
              className="shrink-0 text-[var(--pf-text-4)]"
            />
          </button>
        }
        footer={(close) => (
          <Action
            variant="accent"
            className="min-h-12"
            onClick={() => {
              onChange(today);
              close();
            }}
          >
            Today
          </Action>
        )}
      >
        {(close) => (
          <MonthCalendar
            value={value}
            today={today}
            max={max}
            onSelect={(date) => {
              onChange(date);
              close();
            }}
          />
        )}
      </Overlay>
      {hint ? (
        <span className="text-[12.5px] text-[var(--pf-text-4)]">{hint}</span>
      ) : null}
    </div>
  );
}
