import type { ReactNode } from "react";

import { TabbedFrame } from "@/shared/ui";

import "./body.css";

// The two tabs of the Body destination, under ADR-0030. Body opens on Weight.
const tabs = [
  { href: "/body/weight", label: "Weight" },
  { href: "/body/measurements", label: "Measurements" },
] as const;

/*
 * The Body screen's frame — the prototype's screen 15 — ported for step 18 of
 * docs/design/redesign-v2/PLAN.md: the shared tabbed frame History takes as
 * well. A measurement's own screen, and every form under Body, is a screen of
 * its own and the frame steps out of its way.
 */
export default function BodyLayout({ children }: { children: ReactNode }) {
  return (
    <TabbedFrame
      screen="body"
      title="Body"
      label="Body subsections"
      tabs={tabs}
    >
      {children}
    </TabbedFrame>
  );
}
