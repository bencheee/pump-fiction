"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

const overlayStateKey = "__pumpFictionOverlayStack";

type OverlayHistoryState = Record<string, unknown> & {
  [overlayStateKey]?: string[];
};

function currentStack(): string[] {
  const state = window.history.state as OverlayHistoryState | null;
  return Array.isArray(state?.[overlayStateKey]) ? state[overlayStateKey] : [];
}

export type TransientOverlay = Readonly<{
  open: boolean;
  requestOpenChange: (open: boolean) => void;
}>;

export function useTransientOverlay(): TransientOverlay {
  const reactId = useId();
  const marker = `pf-overlay-${reactId}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (!currentStack().includes(marker)) {
        setOpen(false);
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

  // One stable object per state, so a caller that owns an overlay can put it
  // in an effect's dependencies without the effect running every render.
  return useMemo(
    () => ({ open, requestOpenChange }),
    [open, requestOpenChange],
  );
}
