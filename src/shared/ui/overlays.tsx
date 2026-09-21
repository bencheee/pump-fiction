"use client";

import { AlertDialog, Dialog } from "radix-ui";
import type { MouseEvent, ReactElement, ReactNode, RefObject } from "react";
import { useRef } from "react";

import { Icon } from "./icon";
import "./overlays.css";
import { usePanelContainer } from "./panel-container";
import {
  useTransientOverlay,
  type TransientOverlay,
} from "./transient-overlay";

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
  overlay: controlled,
  returnFocusRef,
  title,
  description,
  children,
  closeLabel = "Close",
  onBodyClick,
  onOpenChange,
}: {
  /** Names the panel, so its screen's stylesheet can reach the shared frame. */
  panel?: string;
  /** Omitted when the panel is opened by its controller rather than a press. */
  trigger?: ReactElement;
  /*
   * The prototype keeps one `s.sheet` slot and moves between panels by
   * writing another name into it — the Actions overlay's "Add today's note"
   * (line 3269) closes itself and opens the note panel. A caller that has to
   * do the same owns the controller and hands it in; every other panel makes
   * its own and is opened by its trigger.
   */
  overlay?: TransientOverlay;
  /*
   * Radix hands focus back to the trigger when a panel closes. A panel with no
   * trigger — one the screen opens from more than one control — says where it
   * came from here instead, so the press that opened it still gets focus back.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  closeLabel?: string;
  /** The prototype's `menuBlur` (line 3427): a press on the panel itself, not
      on one of its controls, cancels the pick the panel is holding. */
  onBodyClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const container = usePanelContainer();
  const own = useTransientOverlay();
  const overlay = controlled ?? own;
  const requestOpenChange = (open: boolean) => {
    overlay.requestOpenChange(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog.Root open={overlay.open} onOpenChange={requestOpenChange}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Content
          data-panel={panel}
          onCloseAutoFocus={
            trigger === undefined && returnFocusRef !== undefined
              ? (event) => {
                  event.preventDefault();
                  returnFocusRef.current?.focus();
                }
              : undefined
          }
        >
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
          <div data-panel-body="" onClick={onBodyClick}>
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
  overlay: controlled,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  onConfirm,
}: {
  /** Omitted when the dialog is raised by a panel that has just closed, the
      way the prototype's `s.dialog` (line 3491) is. */
  trigger?: ReactElement;
  overlay?: TransientOverlay;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const own = useTransientOverlay();
  const overlay = controlled ?? own;
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog.Root
      open={overlay.open}
      onOpenChange={overlay.requestOpenChange}
    >
      {trigger === undefined ? null : (
        <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      )}
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
