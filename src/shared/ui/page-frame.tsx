import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "./icon";
import "./page-frame.css";

export function PageFrame({
  screen = "",
  title,
  trailing,
  under,
  children,
}: {
  /** Names the screen, so its own stylesheet can reach the shared frame. */
  screen?: string;
  title: ReactNode;
  /** The optional trailing item of the title bar — Today's date chip. */
  trailing?: ReactNode;
  /**
   * What stands between the title bar and the scroll region and does not
   * scroll with it — the Exercise library's search field (line 906).
   */
  under?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section data-screen-frame={screen}>
      <div data-screen-heading="">
        <h1>{title}</h1>
        {trailing}
      </div>
      {under}
      <div data-screen-body="">{children}</div>
    </section>
  );
}

export function TopBar({
  screen = "",
  title,
  backHref,
  onBack,
  backLabel,
  trailing,
}: {
  /** Names the screen, so its own stylesheet can reach the shared bar. */
  screen?: string;
  title: string;
  /** Where Back goes. A screen that is a view rather than a route passes
      `onBack` instead: the workout overview returns to where it was opened
      from, as the prototype's `goBack` does through `prevScreenName`. */
  backHref?: string;
  onBack?: () => void;
  backLabel: string;
  /** The trailing item of the bar, which the prototype gives to two of its
      nine: the overview's clock (line 236) and a program's Unsaved chip (781). */
  trailing?: ReactNode;
}) {
  return (
    <header data-top-bar={screen}>
      {backHref === undefined ? (
        <button
          type="button"
          aria-label={backLabel}
          title={backLabel}
          data-top-bar-back=""
          onClick={onBack}
        >
          <Icon name="arrow-left" size={18} />
        </button>
      ) : (
        <Link href={backHref} aria-label={backLabel} data-top-bar-back="">
          <Icon name="arrow-left" size={18} />
        </Link>
      )}
      <h1>{title}</h1>
      {trailing}
    </header>
  );
}

export function StickyActionBar({
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest}>{children}</div>;
}
