"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Icon } from "./icon";

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
      className="fixed right-[var(--pf-gutter)] bottom-[calc(98px+env(safe-area-inset-bottom))] left-[var(--pf-gutter)] z-60 flex items-center gap-2.5 rounded-[var(--pf-r2)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-3.5 py-3 text-[13.5px] text-[var(--pf-text)] shadow-[var(--pf-shadow-toast)] motion-safe:animate-[pf-rise_200ms_var(--pf-ease)]"
    >
      <Icon name="circle-check" size={15} className="text-[var(--pf-accent)]" />
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--pf-text-3)]"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

type ToastContextValue = Readonly<{ showToast: (message: string) => void }>;

const ToastContext = createContext<ToastContextValue | null>(null);

type PendingToast = Readonly<{ id: number; message: string }>;

// Lives above the routed screens so a toast raised just before navigation is
// still shown on the destination screen.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingToast>();
  const showToast = useCallback(
    (message: string) =>
      setPending((current) => ({ id: (current?.id ?? 0) + 1, message })),
    [],
  );
  const dismiss = useCallback(() => setPending(undefined), []);
  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        key={pending?.id}
        message={pending?.message ?? ""}
        visible={pending !== undefined}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast requires a ToastProvider ancestor.");
  }
  return context;
}
