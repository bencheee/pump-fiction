import type { ComponentPropsWithRef, ReactNode } from "react";

import "./action.css";

// `primary` and `on-accent` are the prototype's one 60px pill with its two
// colours swapped, `secondary` is its 48px outline pill, `add` the 54px tinted
// pill that ends a list you can add to, `row-icon` the 44px icon button a row
// carries at its end, `actions` the 58px pill that opens a screen's Actions
// panel, `commit` the 58px pill a screen saves its work with and `quiet` the
// 50px outline pill that stands beside it. `tertiary` and `danger` have no
// prototype surface yet and keep the base button look until the screen that
// owns them is ported.
type ActionVariant =
  | "primary"
  | "on-accent"
  | "secondary"
  | "add"
  | "row-icon"
  | "actions"
  | "commit"
  | "quiet"
  | "tertiary"
  | "danger";

export type ActionProps = ComponentPropsWithRef<"button"> & {
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
