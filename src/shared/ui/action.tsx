import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "./class-names";

type ActionVariant = "primary" | "secondary" | "tertiary" | "danger";

export type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant;
  children: ReactNode;
};

const variants: Record<ActionVariant, string> = {
  primary:
    "min-h-[var(--pf-size-primary-action)] border-transparent bg-[var(--pf-accent)] text-[var(--pf-on-accent)]",
  secondary:
    "min-h-[var(--pf-size-secondary-action)] border-[var(--pf-border-control)] bg-transparent text-[var(--pf-text)]",
  tertiary:
    "min-h-11 border-transparent bg-transparent text-[var(--pf-accent-strong)]",
  danger:
    "min-h-[var(--pf-size-secondary-action)] border-[var(--pf-danger)] bg-transparent text-[var(--pf-danger)]",
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
        "inline-flex min-w-11 items-center justify-center gap-2 rounded-[var(--pf-r2)] border px-4 font-semibold transition-colors duration-[var(--pf-mo-fast)] ease-[var(--pf-ease)] disabled:cursor-not-allowed disabled:opacity-[var(--pf-opacity-disabled)]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
