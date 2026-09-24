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
  // The workout screens are part of Today in the prototype — `s.page` stays
  // `"today"` while `screen` walks to `overview` and `workout` — so its Today
  // destination stays lit through a workout. `/workout/*` is the same place
  // here, and `useScreenAnimation` below already reads it that way.
  if (root === "/today" && pathname.startsWith("/workout")) return true;
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
      <div data-stage="" ref={setStage}>
        <PanelContainerContext.Provider value={stage}>
          {/* The toast is a child of the stage in the prototype (line 1320),
              a sibling of the screen and above the panels. It stays outside
              `<main>` so a message raised just before a navigation is still
              shown on the screen that arrives. */}
          <ToastProvider>
            <main id="pf-scroll" data-screen="" data-screen-anim={screenAnim}>
              {children}
            </main>
          </ToastProvider>
        </PanelContainerContext.Provider>
      </div>
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
   the app reads the route for the page and keeps the stack itself. The workout
   screens are part of Today in the prototype — `s.page === "today"` with
   `screen` at depth 1 and 2 — and `/workout/*` is the same place here. */
const pageOrder: Record<string, number> = {
  today: 0,
  history: 1,
  programs: 2,
  exercises: 3,
  body: 4,
};

export type ScreenAnim = "none" | "scFwdA" | "scFwdB" | "scBackA" | "scBackB";

type NavMemory = {
  key: string;
  page: string;
  depth: number;
  n: number;
  anim: ScreenAnim;
  /* The prototype's `s.stack`, `s.pStack`, `s.xStack` and `s.bStack`: one stack
     per page, each surviving a move to another page, which is what lets a pop
     be told from a push. Step 9. */
  stacks: Readonly<Record<string, readonly string[]>>;
};

function useScreenAnimation(): ScreenAnim {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  /* The routes that sit under another page's stack in the prototype: the
     workout is Today's (`overview`, `workout`), and a split is edited from its
     program, so `/splits/[id]/edit` is on Programs' `pStack` (step 15). */
  const page =
    segments[0] === "workout"
      ? "today"
      : segments[0] === "splits"
        ? "programs"
        : (segments[0] ?? "");
  /* History's three tabs — every two-segment route under `/history` — are one
     screen in the prototype: `tabs[i].go` (line 2181) moves `s.tab` and never
     touches the stack, so moving between them is not a push and takes no
     screen transition. They answer to one key here and the panel's own
     `panFwd`/`panBack` is the whole of the movement. Step 8. */
  const key =
    page === "history" && segments.length === 2 ? "/history" : pathname;
  return useStageAnimation(key, page);
}

/*
 * `navAll()` itself, for the two screens the application holds inside one
 * route. The prototype's Today page walks three screens on its own state
 * machine — `today` at depth 0, `overview` at 1, `workout` at 2 — and takes the
 * same transition between them as between two routes. `/workout/current` holds
 * the last two, so they ask for it by name instead of by pathname. The shell's
 * own `<main>` carries the transition into the route; the screen inside it
 * starts at "none" and animates only when the view changes under it.
 */
export function useStageAnimation(
  key: string,
  page: string,
  /* A caller whose screens have a depth of their own says what it is, and the
     stack below is not consulted: the workout pair is one route holding the
     prototype's `overview` at 1 and `workout` at 2, so the overview is the
     shallower of the two however the route was opened. A route tree cannot say
     it — a sibling one level down is the same number of segments — and leaves
     this out. */
  depth?: number,
): ScreenAnim {
  // The prototype keeps this on the instance and compares during render; the
  // same shape here is state adjusted during render, so the rule that a ref is
  // not read while rendering still holds. The first route on screen animates
  // with nothing, as `navAll()` returns "none" until it has a previous key.
  const [memory, setMemory] = useState<NavMemory>(() => ({
    key,
    page,
    depth: depth ?? 1,
    n: 0,
    anim: "none",
    stacks: { [page]: [key] },
  }));

  // Recomputing for a route already on screen returns what it returned before,
  // exactly as the prototype's `if (prev.key !== key)` guard does, so a render
  // for any other reason does not replay the transition.
  if (memory.key !== key) {
    /* The move, told the way the prototype tells it: a screen already on this
       page's stack is a pop back to it — `stack.slice(0, -1)` in `pop()` —
       and anything else is a push. Reading the route's own depth instead
       cannot tell the two apart where a screen reaches a sibling at its own
       depth: `/history/workouts/[id]` and `/history/exercises/[id]` are both
       three segments, and going back from the second to the first used to
       take the forward transition. Step 9. */
    const previous = memory.stacks[page] ?? [];
    const at = previous.indexOf(key);
    const stack = at === -1 ? [...previous, key] : previous.slice(0, at + 1);
    const next = depth ?? stack.length;
    const forward =
      memory.page !== page
        ? (pageOrder[page] ?? 0) >= (pageOrder[memory.page] ?? 0)
        : next >= memory.depth;
    const n = memory.n + 1;
    setMemory({
      key,
      page,
      depth: next,
      n,
      anim: `sc${forward ? "Fwd" : "Back"}${n % 2 ? "A" : "B"}`,
      stacks: { ...memory.stacks, [page]: stack },
    });
  }

  return memory.anim;
}
