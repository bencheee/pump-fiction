"use client";

import { createContext, useContext } from "react";

/*
 * Where a full-screen panel renders.
 *
 * The prototype's overlays are children of the stage (line 67), not of the
 * frame: `position:absolute;inset:0` fills the screen and stops at the top of
 * the bottom navigation, which stays drawn underneath. `MainShell` hands the
 * stage node down here so `Sheet` can portal into the same place; a `Sheet`
 * rendered outside the shell finds nothing and falls back to the document body.
 */
export const PanelContainerContext = createContext<HTMLElement | null>(null);

export function usePanelContainer(): HTMLElement | null {
  return useContext(PanelContainerContext);
}
