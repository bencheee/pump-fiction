"use client";

import { AlertDialog, Dialog } from "radix-ui";
import type { ReactElement, ReactNode } from "react";
import { useRef } from "react";

import { Icon } from "./icon";
import { useTransientOverlay } from "./transient-overlay";

export function Sheet({
  trigger,
  title,
  description,
  children,
  closeLabel = "Close",
  onOpenChange,
}: {
  trigger: ReactElement;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  closeLabel?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const overlay = useTransientOverlay();
  const requestOpenChange = (open: boolean) => {
    overlay.requestOpenChange(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog.Root open={overlay.open} onOpenChange={requestOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="pf-scrim-sheet fixed inset-0 z-40" />
        <Dialog.Content className="fixed right-0 bottom-0 left-0 z-50 max-h-[calc(100dvh-env(safe-area-inset-top))] overflow-y-auto rounded-t-[var(--pf-r4)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface-2)] px-4 pt-4 pb-[calc(var(--pf-s4)+var(--pf-bottom-buffer)+env(safe-area-inset-bottom))] shadow-[var(--pf-shadow-sheet)] motion-safe:animate-[pf-rise_var(--pf-mo-slow)_var(--pf-ease)]">
          <div className="grid grid-cols-[44px_1fr_44px] items-center">
            <span aria-hidden="true" />
            <Dialog.Title className="text-center text-[21px] leading-[1.22] font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label={closeLabel}
              className="flex size-11 items-center justify-center justify-self-end text-[var(--pf-accent-strong)]"
            >
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mt-2 text-center text-[var(--pf-text-3-deep)]">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-5">
            {typeof children === "function"
              ? children(() => requestOpenChange(false))
              : children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DestructiveDialog({
  trigger,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  onConfirm,
}: {
  trigger: ReactElement;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const overlay = useTransientOverlay();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog.Root
      open={overlay.open}
      onOpenChange={overlay.requestOpenChange}
    >
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="pf-scrim-modal fixed inset-0 z-40" />
        <AlertDialog.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 -translate-y-1/2 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface-2)] p-4 shadow-[var(--pf-shadow-toast)] motion-safe:animate-[pf-rise_var(--pf-mo-base)_var(--pf-ease)]"
        >
          <AlertDialog.Title className="text-[21px] leading-[1.22] font-semibold [overflow-wrap:anywhere]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-[var(--pf-text-3-deep)]">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex flex-col gap-2">
            <AlertDialog.Cancel
              ref={cancelRef}
              className="min-h-12 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 font-semibold"
            >
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className="min-h-12 rounded-[var(--pf-r2)] border border-[var(--pf-danger)] px-4 font-semibold text-[var(--pf-danger)]"
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
