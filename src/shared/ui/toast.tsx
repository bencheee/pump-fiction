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
import "./toast.css";

/*
 * The prototype's toast (lines 1319-1327), given its look in step 6 of
 * docs/design/redesign-v2/PLAN.md. `notify()` (line 1831) keeps one message at
 * a time and clears it after 2600ms, which is the default below.
 */
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
    <div data-toast="" role="status" aria-live="polite">
      <Icon name="circle-check" size={15} />
      <span data-toast-message="">{message}</span>
      <button
        type="button"
        data-toast-dismiss=""
        aria-label="Dismiss"
        onClick={onDismiss}
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
// still shown on the destination screen. Since step 6 it sits inside the
// stage, where the prototype draws it: `position:absolute` then resolves
// against the same box the panels fill, and the bottom navigation stays clear.
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
