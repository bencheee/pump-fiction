import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "./icon";
import "./page-frame.css";

export function PageFrame({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section data-screen-frame="">
      <div data-screen-heading="">
        <h1>{title}</h1>
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
