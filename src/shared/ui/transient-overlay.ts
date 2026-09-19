"use client";

import { useCallback, useEffect, useId, useState } from "react";

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

  return { open, requestOpenChange };
}
