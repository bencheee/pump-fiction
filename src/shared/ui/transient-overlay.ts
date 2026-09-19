"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const overlayStateKey = "__pumpFictionOverlayStack";

type OverlayHistoryState = Record<string, unknown> & {
  [overlayStateKey]?: string[];
};

function currentStack(): string[] {
  const state = window.history.state as OverlayHistoryState | null;
  return Array.isArray(state?.[overlayStateKey]) ? state[overlayStateKey] : [];
}

export function useTransientOverlay() {
  const reactId = useId();
  const marker = `pf-overlay-${reactId}`;
  const [open, setOpen] = useState(false);
  // Work queued behind this overlay's own close. `history.back()` settles on a
  // later task, so anything that opens a second overlay has to wait for it;
  // otherwise the second one pushes its marker first and the arriving popstate
  // closes it again.
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      if (!currentStack().includes(marker)) {
        setOpen(false);
        const queued = pending.current;
        pending.current = null;
        queued?.();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [marker]);

  const requestOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        if (open) return;

        const state = (window.history.state ?? {}) as OverlayHistoryState;
        window.history.pushState(
          { ...state, [overlayStateKey]: [...currentStack(), marker] },
          "",
          window.location.href,
        );
        setOpen(true);
        return;
      }

      if (!open) return;

      const stack = currentStack();
      if (stack.at(-1) === marker) {
        window.history.back();
      } else {
        setOpen(false);
      }
    },
    [marker, open],
  );

  /** Close this overlay, then run `action` once the close has settled. */
  const closeThenRun = useCallback(
    (action: () => void) => {
      if (!open) {
        action();
        return;
      }
      if (currentStack().at(-1) === marker) {
        pending.current = action;
        window.history.back();
        return;
      }
      setOpen(false);
      action();
    },
    [marker, open],
  );

  return { open, requestOpenChange, closeThenRun };
}
