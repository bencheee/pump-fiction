import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "./class-names";

type ActionVariant =
  "primary" | "hero" | "accent" | "secondary" | "tertiary" | "danger";

export type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant;
  children: ReactNode;
};

const variants: Record<ActionVariant, string> = {
  // Filled accent: the one committing action on a screen.
  primary:
    "h-[var(--pf-size-primary-action)] border-transparent bg-[var(--pf-accent)] text-[17px] text-[var(--pf-on-accent)]",
  // The taller stage action inside the active workout.
  hero: "h-[var(--pf-size-hero-action)] border-transparent bg-[var(--pf-accent)] text-[18px] text-[var(--pf-on-accent)]",
  // Dim accent block: additive actions such as Add exercise or Add split.
  accent:
    "min-h-[54px] border-transparent bg-[var(--pf-accent-dim)] text-[15px] text-[var(--pf-accent)] hover:bg-[var(--pf-accent-dim-hover)]",
  secondary:
    "h-[var(--pf-size-secondary-action)] border-[var(--pf-border)] bg-transparent text-[15.5px] text-[var(--pf-text-2)] hover:border-[var(--pf-border-strong)]",
  tertiary:
    "min-h-11 border-transparent bg-transparent text-[13.5px] text-[var(--pf-accent)]",
  danger:
    "h-[var(--pf-size-secondary-action)] border-[var(--pf-border)] bg-transparent text-[15px] text-[var(--pf-danger)]",
};

export function Action({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ActionProps) {
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex min-w-11 items-center justify-center gap-2.5 rounded-full border px-4 font-semibold transition-[background-color,border-color,color,transform] duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-[var(--pf-opacity-disabled)]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
