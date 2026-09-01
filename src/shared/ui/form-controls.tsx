import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { classNames } from "./class-names";
import { Icon } from "./icon";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

const controlClass =
  "min-h-[var(--pf-size-input)] w-full rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] bg-[var(--pf-bg-surface-2)] px-3 text-[length:var(--pf-type-input-size)] text-[var(--pf-text)] placeholder:text-[var(--pf-text-3-deep)] disabled:cursor-not-allowed disabled:opacity-[var(--pf-opacity-disabled)] aria-invalid:border-[var(--pf-danger)]";

function FieldMessage({
  id,
  hint,
  error,
}: Pick<FieldProps, "id" | "hint" | "error">) {
  if (!error && !hint) return null;

  return (
    <>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1 text-[12.5px] leading-[1.4] font-medium text-[var(--pf-danger)]"
        >
          <Icon name="triangle-alert" size={14} className="mt-0.5" />
          {error}
        </p>
      ) : null}
      {hint ? (
        <p
          id={`${id}-hint`}
          className="text-[12.5px] leading-[1.4] font-medium text-[var(--pf-text-3)]"
        >
          {hint}
        </p>
      ) : null}
    </>
  );
}

export function TextField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-[0.1em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={classNames(controlClass, className)}
        {...props}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function NumericField(
  props: FieldProps & InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <TextField
      inputMode="decimal"
      {...props}
      className={classNames("pf-numeric", props.className)}
    />
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-[0.1em] uppercase"
      >
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={classNames(controlClass, "min-h-24 py-3", className)}
        {...props}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function Chip({
  selected,
  children,
  ...props
}: { selected: boolean; children: ReactNode } & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed"
>) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={classNames(
        "min-h-[var(--pf-size-control-chip)] rounded-[var(--pf-r-pill)] border px-3 font-medium transition-colors duration-[var(--pf-mo-fast)]",
        selected
          ? "border-[var(--pf-accent-strong)] bg-[var(--pf-accent-dim)] font-semibold text-[var(--pf-accent-strong)]"
          : "border-[var(--pf-border-control)] bg-transparent text-[var(--pf-text-2)]",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
