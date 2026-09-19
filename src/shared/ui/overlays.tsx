"use client";

import { AlertDialog, Dialog } from "radix-ui";
import type { ReactElement, ReactNode } from "react";
import { useRef } from "react";

import { classNames } from "./class-names";
import { Icon } from "./icon";
import { useTransientOverlay } from "./transient-overlay";

/**
 * Every transient surface in the redesign is a full-viewport opaque panel that
 * rises over the screen, not a bottom sheet behind a scrim. It keeps the Radix
 * modal semantics — focus containment, Escape, trigger restoration — and the
 * history-backed close of the overlay stack.
 */
export function Overlay({
  trigger,
  title,
  description,
  children,
  closeLabel = "Close",
  footer,
  onOpenChange,
}: {
  trigger: ReactElement;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  closeLabel?: string;
  footer?: ReactNode | ((close: () => void) => ReactNode);
  onOpenChange?: (open: boolean) => void;
}) {
  const overlay = useTransientOverlay();
  const requestOpenChange = (open: boolean) => {
    overlay.requestOpenChange(open);
    onOpenChange?.(open);
  };
  const close = () => requestOpenChange(false);

  return (
    <Dialog.Root open={overlay.open} onOpenChange={requestOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-[var(--pf-bg-overlay)] motion-safe:animate-[pf-overlay-in_var(--pf-mo-slow)_var(--pf-ease)]">
          <div className="flex min-h-[calc(var(--pf-size-overlay-header)+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-3 px-3.5 pt-[env(safe-area-inset-top)]">
            <Dialog.Title className="min-w-0 flex-1 truncate px-1.5 text-[16px] font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label={closeLabel}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-bg-surface)] text-[var(--pf-text-2)]"
            >
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <div className="pf-scroll flex min-h-0 flex-1 flex-col px-[var(--pf-gutter)] pt-3">
            {description ? (
              <Dialog.Description className="mb-4 text-[13.5px] leading-[1.45] text-[var(--pf-text-3)]">
                {description}
              </Dialog.Description>
            ) : null}
            {typeof children === "function" ? children(close) : children}
          </div>
          {footer ? (
            <div className="flex shrink-0 flex-col gap-2.5 px-[var(--pf-gutter)] pt-3 pb-[calc(var(--pf-bottom-buffer)+env(safe-area-inset-bottom))]">
              {typeof footer === "function" ? footer(close) : footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Retained name while the feature screens are converted to `Overlay`. */
export const Sheet = Overlay;

export function DestructiveDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancel",
  closeLabel = "Close",
  confirmLabel,
  onConfirm,
}: {
  /** Omitted when the dialog is opened from somewhere else, such as an
   * actions overlay; pass `open`/`onOpenChange` from `useTransientOverlay`
   * then, so Back still closes it. */
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  cancelLabel?: string;
  closeLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const overlay = useTransientOverlay();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const controlled = open !== undefined;

  return (
    <AlertDialog.Root
      open={controlled ? open : overlay.open}
      onOpenChange={controlled ? onOpenChange : overlay.requestOpenChange}
    >
      {trigger ? (
        <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      ) : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="pf-scrim-modal fixed inset-0 z-40 motion-safe:animate-[pf-fade-in_var(--pf-mo-fast)_linear]" />
        <AlertDialog.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-44px)] max-w-[398px] -translate-x-1/2 -translate-y-1/2 rounded-[var(--pf-r5)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] p-[22px] shadow-[var(--pf-shadow-sheet)] motion-safe:animate-[pf-overlay-in_220ms_var(--pf-ease)]"
        >
          <div className="flex items-start gap-2.5">
            <AlertDialog.Title className="min-w-0 flex-1 pt-2 text-[19px] leading-[1.2] font-semibold [overflow-wrap:anywhere]">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Cancel
              aria-label={closeLabel}
              className="-mt-1 -mr-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--pf-bg-surface-3)] text-[var(--pf-text-2)]"
            >
              <Icon name="x" size={15} />
            </AlertDialog.Cancel>
          </div>
          <AlertDialog.Description className="mt-2.5 text-[13.5px] leading-[1.5] text-[var(--pf-text-3)]">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 flex flex-col gap-2.5">
            <AlertDialog.Action
              onClick={onConfirm}
              className={classNames(
                "flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--pf-text)] text-[16px] font-semibold text-[var(--pf-bg-canvas)]",
              )}
            >
              {confirmLabel}
            </AlertDialog.Action>
            <AlertDialog.Cancel
              ref={cancelRef}
              className="flex h-[var(--pf-size-secondary-action)] items-center justify-center rounded-full border border-[var(--pf-border)] text-[15.5px] font-semibold text-[var(--pf-text-2)]"
            >
              {cancelLabel}
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
