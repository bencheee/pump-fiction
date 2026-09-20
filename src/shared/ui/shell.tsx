"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Icon, type IconName } from "./icon";
import { PanelContainerContext } from "./panel-container";
import "./shell.css";
import { ToastProvider } from "./toast";

type Destination = {
  href: string;
  label: string;
  icon: IconName;
};

// The five destinations of ADR-0030. History and Body both land on their
// first tab, so each carries the root its whole subtree lives under. The
// order, the labels and the icons are the prototype's `navItems` (line 3293).
const destinations: (Destination & { root?: string })[] = [
  { href: "/today", label: "Today", icon: "calendar-check" },
  {
    href: "/history/workouts",
    label: "History",
    icon: "history",
    root: "/history",
  },
  { href: "/programs", label: "Programs", icon: "layout-grid" },
  { href: "/exercises", label: "Exercises", icon: "dumbbell" },
  { href: "/body/weight", label: "Body", icon: "scale", root: "/body" },
];

function isCurrentDestination(
  pathname: string,
  destination: { href: string; root?: string },
): boolean {
  const root = destination.root ?? destination.href;
  return pathname === destination.href || pathname.startsWith(`${root}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" data-nav="primary">
      {destinations.map((destination) => {
        const current = isCurrentDestination(pathname, destination);

        return (
          <Link
            key={destination.href}
            href={destination.href}
            aria-current={current ? "page" : undefined}
          >
            <Icon name={destination.icon} size={20} />
            <span>{destination.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MainShell({ children }: { children: ReactNode }) {
  const keyboardOpen = useKeyboardOpen();
  const screenAnim = useScreenAnimation();
  // The prototype's overlays are children of the stage, one level above the
  // screen and one below the bottom navigation. A panel opened anywhere in the
  // tree portals back here so it lands in the same place.
  const [stage, setStage] = useState<HTMLElement | null>(null);

  return (
    <div data-shell="main" data-keyboard-open={keyboardOpen}>
      <ToastProvider>
        <div data-stage="" ref={setStage}>
          <PanelContainerContext.Provider value={stage}>
            <main id="pf-scroll" data-screen="" data-screen-anim={screenAnim}>
              {children}
            </main>
          </PanelContainerContext.Provider>
        </div>
      </ToastProvider>
      <BottomNavigation />
    </div>
  );
}

function useKeyboardOpen(): boolean {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const layoutHeight = window.innerHeight;
    const update = () => setKeyboardOpen(layoutHeight - viewport.height > 150);

    viewport.addEventListener("resize", update);
    update();
    return () => viewport.removeEventListener("resize", update);
  }, []);

  return keyboardOpen;
}

/* One shared push/pop direction for every screen in the app, ported from the
   prototype's `navAll()` (line 2453):

     Tab bar: moving right in the bar enters from the right, left enters from
     the left. Inside a tab: drilling deeper enters from the right, going back
     enters from the left.

   The prototype reads its own state machine for the page and the stack depth;
   the app reads the route, which carries both. The workout screens are part of
   Today in the prototype — `s.page === "today"` with `screen` at depth 1 and 2
   — and `/workout/*` is the same place here. */
const pageOrder: Record<string, number> = {
  today: 0,
  history: 1,
  programs: 2,
  exercises: 3,
  body: 4,
};

type ScreenAnim = "none" | "scFwdA" | "scFwdB" | "scBackA" | "scBackB";

type NavMemory = {
  key: string;
  page: string;
  depth: number;
  n: number;
  anim: ScreenAnim;
};

function useScreenAnimation(): ScreenAnim {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const page = segments[0] === "workout" ? "today" : (segments[0] ?? "");
  const depth = segments.length;

  // The prototype keeps this on the instance and compares during render; the
  // same shape here is state adjusted during render, so the rule that a ref is
  // not read while rendering still holds. The first route on screen animates
  // with nothing, as `navAll()` returns "none" until it has a previous key.
  const [memory, setMemory] = useState<NavMemory>(() => ({
    key: pathname,
    page,
    depth,
    n: 0,
    anim: "none",
  }));

  // Recomputing for a route already on screen returns what it returned before,
  // exactly as the prototype's `if (prev.key !== key)` guard does, so a render
  // for any other reason does not replay the transition.
  if (memory.key !== pathname) {
    const forward =
      memory.page !== page
        ? (pageOrder[page] ?? 0) >= (pageOrder[memory.page] ?? 0)
        : depth >= memory.depth;
    const n = memory.n + 1;
    setMemory({
      key: pathname,
      page,
      depth,
      n,
      anim: `sc${forward ? "Fwd" : "Back"}${n % 2 ? "A" : "B"}`,
    });
  }

  return memory.anim;
}
