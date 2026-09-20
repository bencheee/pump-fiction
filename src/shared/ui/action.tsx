import type { ButtonHTMLAttributes, ReactNode } from "react";

import "./action.css";

// `primary` and `on-accent` are the prototype's one 60px pill with its two
// colours swapped, and `secondary` is its 48px outline pill. `tertiary` and
// `danger` have no prototype surface yet and keep the base button look until
// the screen that owns them is ported.
type ActionVariant =
  "primary" | "on-accent" | "secondary" | "tertiary" | "danger";

export type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant;
  children: ReactNode;
};

export function Action({
  variant = "primary",
  type = "button",
  ...props
}: ActionProps) {
  return <button type={type} data-variant={variant} {...props} />;
}
