"use client";

import { useEffect } from "react";

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 2600,
}: {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onDismiss, visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-[calc(72px+env(safe-area-inset-bottom))] left-4 z-60 rounded-[var(--pf-r3)] bg-[var(--pf-bg-surface-3)] px-4 py-3 text-center font-medium text-[var(--pf-text)] shadow-[var(--pf-shadow-toast)] motion-safe:animate-[pf-rise_var(--pf-mo-base)_var(--pf-ease)]"
    >
      {message}
    </div>
  );
}
