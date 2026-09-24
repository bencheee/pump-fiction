import type { InputHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "./icon";
import "./definition.css";

/*
 * The parts a definition screen is built from, ported from the prototype for
 * step 14 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read from the byte-exact local copy. Each is written on
 * the Program (lines 790-822), the Split editor (847-884) and, for the name,
 * the Exercise definition (948-951), with the same declarations every time and
 * only the words changed, so steps 15 and 17 take these.
 */

/** The labelled name a definition is saved under (lines 790-793). */
export function NameField({
  label,
  accessibleName = label,
  invalid = false,
  ...props
}: {
  label: string;
  /**
   * What the field is called and what it shows while empty, where that says
   * more than the label: the Exercise definition's `Name` is `Exercise name`
   * (line 950).
   */
  accessibleName?: string;
  /** The name was refused; the prototype says so in a toast alone. */
  invalid?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "aria-label">) {
  return (
    <label data-name-field="">
      <span>{label}</span>
      <input
        aria-label={accessibleName}
        aria-invalid={invalid ? true : undefined}
        placeholder={accessibleName}
        autoComplete="off"
        {...props}
      />
    </label>
  );
}

/**
 * The heading of a list the screen orders, with the count it holds and the
 * words that say how (lines 795-798).
 */
export function SectionHead({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div data-section-head="">
      <p>{children}</p>
      {aside ? <span>{aside}</span> : null}
    </div>
  );
}

/** What a list the screen orders says while it holds nothing (lines 817-821). */
export function EmptyCard({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <div data-empty-card="">
      <Icon name={icon} size={28} />
      <p>{title}</p>
      <p>{children}</p>
    </div>
  );
}
