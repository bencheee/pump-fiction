"use client";

import { useState } from "react";

import { Icon } from "./icon";
import "./stepper.css";

/*
 * The stepper, ported from the prototype for step 10 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the byte-exact local copy of
 * `Workout App - Prototype.dc.html` (the Claude Design MCP would not connect
 * this session; see the verification note in the plan):
 *   markup        lines 440-447, inside `data-screen-label="Correct workout"`
 *   bound values  lines 2080-2097 (`edSteppers`), `bump()` at 2439
 *
 * A row is a label, a minus, the value in the numerals, and a plus. The value
 * hops 5px when either button is pressed — `bump{A,B} 240ms` — and the pair
 * alternates so a second press in the same direction restarts the hop, exactly
 * as the wheel's does. The prototype bumps on the press and not on the change,
 * so a value held at its limit still answers.
 *
 * The card the rows sit in belongs to the screen, not to the stepper. The
 * split editor's prescription field (line 865, step 15) looks related and is
 * not this surface: its label sits over a 44px well with two 34px buttons and
 * no hop, so it stays that screen's own.
 */
export function Stepper({
  label,
  value,
  downLabel,
  upLabel,
  disabled = false,
  onDown,
  onUp,
}: {
  label: string;
  /** Already formatted: the prototype's own `dateLabel`, `hhmm`, `durText`. */
  value: string;
  /*
   * What each button does, said in words. The prototype writes `Previous day`
   * and `Next day`; a screen with two time steppers on it says which one it
   * is moving, as step 5's remove button names its exercise.
   */
  downLabel: string;
  upLabel: string;
  disabled?: boolean;
  onDown: () => void;
  onUp: () => void;
}) {
  // `this.bumps[name]` (line 2439): a counter, so the A/B pair alternates.
  const [bump, setBump] = useState(0);

  return (
    <div data-stepper="">
      <span data-stepper-label="">{label}</span>
      <button
        type="button"
        data-stepper-step=""
        aria-label={downLabel}
        title={downLabel}
        disabled={disabled}
        onClick={() => {
          setBump((count) => count + 1);
          onDown();
        }}
      >
        <Icon name="minus" size={14} />
      </button>
      {/* The prototype states the value and nothing more. A press moves it
          without moving focus, so nothing tells a screen reader what it now
          reads; this one says so. */}
      <span
        data-stepper-value=""
        data-bump={bump === 0 ? undefined : bump % 2 ? "A" : "B"}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        data-stepper-step=""
        aria-label={upLabel}
        title={upLabel}
        disabled={disabled}
        onClick={() => {
          setBump((count) => count + 1);
          onUp();
        }}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
