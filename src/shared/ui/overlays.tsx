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
  layer,
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
  /** Which layer the panel takes. The prototype draws all but one of its
      panels at z-index 20, under the toast; the Screen actions overlay (line
      1189) it lifts to 27, over it. */
  layer?: "above-toast";
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
          data-panel-layer={layer}
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

/*
 * The confirm dialog — the prototype's screen 33 (lines 1560-1575), with
 * `dialogTitle`, `dialogBody`, `dialogConfirm`, `closeDialog` and
 * `confirmDialog` at lines 2302-2308 and 3490-3500.
 *
 * One dialog for every destructive action, as the prototype's single
 * `s.dialog` slot is: deleting a workout, a program, a split or an exercise,
 * removing a set or an exercise from a workout, discarding one. It sits over
 * the stage, so the bottom navigation stays drawn under its scrim exactly as
 * it does under a panel.
 */
export function DestructiveDialog({
  trigger,
  overlay: controlled,
  title,
  description,
  cancelLabel = "Cancel",
  closeLabel = "Close",
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
  closeLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const container = usePanelContainer();
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
      <AlertDialog.Portal container={container ?? undefined}>
        <AlertDialog.Overlay data-dialog-scrim="" />
        {/* The prototype centres the card inside a padded scrim; Radix draws
            the scrim beside the content rather than around it, so the content
            is the centring box and the card is the element inside it. */}
        <AlertDialog.Content
          data-dialog-frame=""
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
        >
          <div data-dialog="">
            <div data-dialog-head="">
              <AlertDialog.Title data-dialog-title="">
                {title}
              </AlertDialog.Title>
              {/* The prototype draws the same `closeDialog` twice: the round x
                  in the corner and Cancel at the bottom. */}
              <AlertDialog.Cancel
                data-dialog-close=""
                aria-label={closeLabel}
                title={closeLabel}
              >
                <Icon name="x" size={15} />
              </AlertDialog.Cancel>
            </div>
            <AlertDialog.Description data-dialog-body="">
              {description}
            </AlertDialog.Description>
            <div data-dialog-actions="">
              <AlertDialog.Action
                data-dialog-confirm=""
                aria-label={confirmLabel}
                title={confirmLabel}
                onClick={onConfirm}
              >
                {confirmLabel}
              </AlertDialog.Action>
              <AlertDialog.Cancel ref={cancelRef} data-dialog-cancel="">
                {cancelLabel}
              </AlertDialog.Cancel>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
