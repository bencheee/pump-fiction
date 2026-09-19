"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Icon, type IconName } from "./icon";
import { ToastProvider } from "./toast";

type Destination = {
  href: string;
  label: string;
  icon: IconName;
};

// The five destinations of ADR-0030. History and Body both land on their
// first tab, so each carries the root its whole subtree lives under.
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
    <nav aria-label="Primary">
      {destinations.map((destination) => {
        const current = isCurrentDestination(pathname, destination);

        return (
          <Link
            key={destination.href}
            href={destination.href}
            aria-current={current ? "page" : undefined}
          >
            <Icon name={destination.icon} size={19} />
            <span>{destination.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MainShell({ children }: { children: ReactNode }) {
  const keyboardOpen = useKeyboardOpen();

  return (
    <div data-shell="main" data-keyboard-open={keyboardOpen}>
      <ToastProvider>
        <main id="pf-scroll">{children}</main>
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
