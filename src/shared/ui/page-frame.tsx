import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { Icon } from "./icon";

export function PageFrame({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section>
      <h1>{title}</h1>
      {children}
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
    <header>
      <Link href={backHref} aria-label={backLabel}>
        <Icon name="chevron-left" size={18} />
      </Link>
      <h1>{title}</h1>
      <span aria-hidden="true" />
    </header>
  );
}

export function StickyActionBar({
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest}>{children}</div>;
}
