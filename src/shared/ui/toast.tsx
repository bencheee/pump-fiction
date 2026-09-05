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
