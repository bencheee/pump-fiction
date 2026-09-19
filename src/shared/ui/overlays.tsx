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
        <Dialog.Overlay />
        <Dialog.Content>
          <div>
            <span aria-hidden="true" />
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close aria-label={closeLabel}>
              <Icon name="x" size={18} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description>{description}</Dialog.Description>
          ) : null}
          <div>
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
        <AlertDialog.Overlay />
        <AlertDialog.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
        >
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
          <div>
            <AlertDialog.Cancel ref={cancelRef}>
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={onConfirm}>
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
