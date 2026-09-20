"use client";

import { AlertDialog, Dialog } from "radix-ui";
import type { ReactElement, ReactNode } from "react";
import { useRef } from "react";

import { Icon } from "./icon";
import "./overlays.css";
import { usePanelContainer } from "./panel-container";
import { useTransientOverlay } from "./transient-overlay";

/*
 * The full-screen panel. Its frame is the prototype's, identical on all four
 * panels that carry one: an opaque sheet over the stage, a 60px bar holding the
 * title against a 44px close button, and the scroll region under it. What goes
 * in the body is the screen's, and `panel` names the screen so its own
 * stylesheet can reach the shared frame.
 *
 * The prototype has no scrim: the panel is opaque and covers everything the
 * stage holds, so there is nothing to see through.
 */
export function Sheet({
  panel = "",
  trigger,
  title,
  description,
  children,
  closeLabel = "Close",
  onOpenChange,
}: {
  /** Names the panel, so its screen's stylesheet can reach the shared frame. */
  panel?: string;
  trigger: ReactElement;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  closeLabel?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const container = usePanelContainer();
  const overlay = useTransientOverlay();
  const requestOpenChange = (open: boolean) => {
    overlay.requestOpenChange(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog.Root open={overlay.open} onOpenChange={requestOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Content data-panel={panel}>
          <div data-panel-bar="">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close
              data-panel-close=""
              aria-label={closeLabel}
              title={closeLabel}
            >
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <div data-panel-body="">
            {description ? (
              <Dialog.Description data-panel-lead="">
                {description}
              </Dialog.Description>
            ) : null}
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
