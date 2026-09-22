"use client";

import type { ReactElement, RefObject } from "react";
import { useState } from "react";

import { Icon } from "./icon";
import "./note-sheet.css";
import { Sheet } from "./overlays";
import type { TransientOverlay } from "./transient-overlay";

/*
 * The note editor — the prototype's screen 27 (lines 1396-1412) — built in
 * step 6 inside the set queue and lifted here in step 10 of
 * docs/design/redesign-v2/PLAN.md.
 *
 * The note it edits is the one that belongs to an occurrence of an exercise:
 * the queue writes today's, the correction screen writes a saved workout's,
 * and the panel is the same one. What differs is what the bar and the line
 * under the heading are called, which the two callers say.
 */
export function NoteEditorSheet({
  panel,
  title,
  heading,
  lead,
  value,
  placeholder,
  fieldLabel,
  saveLabel = "Save note",
  overlay,
  returnFocusRef,
  trigger,
  onCommit,
}: {
  /** Names the panel, so its screen's stylesheet can reach the shared frame. */
  panel: string;
  /** The word in the 60px bar. */
  title: string;
  /** The 22px heading the body opens with: what the note is about. */
  heading: string;
  /** The line under it. */
  lead: string;
  /** What the draft starts from each time the panel opens. */
  value: string;
  placeholder: string;
  fieldLabel: string;
  saveLabel?: string;
  overlay?: TransientOverlay;
  returnFocusRef?: RefObject<HTMLElement | null>;
  trigger?: ReactElement;
  onCommit: (note: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <Sheet
      panel={panel}
      title={title}
      overlay={overlay}
      returnFocusRef={returnFocusRef}
      trigger={trigger}
      onOpenChange={(open) => {
        if (open) setDraft(value);
      }}
    >
      {(close) => (
        <>
          <h2 data-panel-heading="">{heading}</h2>
          <p data-note-lead="">{lead}</p>
          <textarea
            data-note-field=""
            aria-label={fieldLabel}
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div data-note-actions="">
            <button
              type="button"
              data-note-save=""
              aria-label={saveLabel}
              title={saveLabel}
              onClick={() => {
                onCommit(draft);
                close();
              }}
            >
              <Icon name="check" size={19} />
              {saveLabel}
            </button>
            <button
              type="button"
              data-note-cancel=""
              aria-label="Cancel"
              title="Cancel"
              onClick={close}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
