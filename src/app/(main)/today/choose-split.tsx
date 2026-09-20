"use client";

import type { TodaySplit } from "@/features/active-workout/domain/workout";
import { Action, Icon, Sheet } from "@/shared/ui";

import "./choose-split.css";
import { splitStatsText } from "./split-stats";

/*
 * Choose another split — step 3 of docs/design/redesign-v2/PLAN.md, the
 * prototype's `OVERLAY: SPLITS` (line 1446, `data-screen-label="Choose split"`).
 *
 * Its two actions are the prototype's `sp.start` and `sp.select` (line 3336):
 * one starts the split now, the other puts it on Today and leaves rotation
 * alone. Both close the panel, as `startSplit` and `select` both clear
 * `sheet` in the state machine.
 */
export function ChooseSplitPanel({
  splits,
  selectedSplitId,
  pending,
  onStart,
  onSelect,
}: {
  splits: readonly TodaySplit[];
  /** The split on Today now — `sp.bg` tints its card (line 3335). */
  selectedSplitId?: string;
  pending: boolean;
  onStart: (split: TodaySplit) => void;
  onSelect: (split: TodaySplit) => void;
}) {
  return (
    <Sheet
      panel="choose-split"
      title="Choose another split"
      description="Pick a split to train today. This does not change your rotation."
      trigger={
        <Action variant="secondary" disabled={pending}>
          Another split
        </Action>
      }
    >
      {(close) =>
        splits.map((split) => {
          const stats = splitStatsText(split);

          return (
            <section
              key={split.splitId}
              aria-label={split.splitName}
              data-split-card={
                split.splitId === selectedSplitId ? "current" : ""
              }
            >
              <p data-split-name="">{split.splitName}</p>
              {stats ? <p data-split-meta="">{stats}</p> : null}
              <div data-split-actions="">
                <button
                  type="button"
                  data-split-start=""
                  aria-label="Train this today"
                  title="Train this today"
                  onClick={() => {
                    close();
                    onStart(split);
                  }}
                >
                  <Icon name="play" size={17} />
                  Train today
                </button>
                <button
                  type="button"
                  data-split-select=""
                  aria-label="Put on Today, don't start yet"
                  title="Put on Today, don't start yet"
                  onClick={() => {
                    onSelect(split);
                    close();
                  }}
                >
                  <Icon name="calendar-check" size={17} />
                </button>
              </div>
            </section>
          );
        })
      }
    </Sheet>
  );
}
