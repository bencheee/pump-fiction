import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionVariant = "primary" | "secondary" | "tertiary" | "danger";

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
