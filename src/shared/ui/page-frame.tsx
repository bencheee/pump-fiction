import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "./icon";
import "./page-frame.css";

export function PageFrame({
  screen = "",
  title,
  trailing,
  children,
}: {
  /** Names the screen, so its own stylesheet can reach the shared frame. */
  screen?: string;
  title: ReactNode;
  /** The optional trailing item of the title bar — Today's date chip. */
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section data-screen-frame={screen}>
      <div data-screen-heading="">
        <h1>{title}</h1>
        {trailing}
      </div>
      <div data-screen-body="">{children}</div>
    </section>
  );
}

export function TopBar({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <header data-top-bar="">
      <Link href={backHref} aria-label={backLabel} data-top-bar-back="">
        <Icon name="arrow-left" size={18} />
      </Link>
      <h1>{title}</h1>
    </header>
  );
}

export function StickyActionBar({
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest}>{children}</div>;
}
