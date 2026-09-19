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
  "h-[var(--pf-size-input)] w-full rounded-[var(--pf-r2)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[18px] text-[length:var(--pf-type-input-size)] text-[var(--pf-text)] transition-colors duration-[var(--pf-mo-base)] ease-linear placeholder:text-[var(--pf-text-4)] focus:border-[var(--pf-border-strong)] disabled:cursor-not-allowed disabled:opacity-[var(--pf-opacity-disabled)] aria-invalid:border-[var(--pf-danger)]";

const labelClass =
  "text-[length:var(--pf-type-label-size)] font-semibold tracking-[0.1em] text-[var(--pf-text-4)] uppercase";

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
          className="flex items-start gap-1.5 text-[12.5px] leading-[1.5] font-medium text-[var(--pf-danger)]"
        >
          <Icon name="triangle-alert" size={14} className="mt-0.5" />
          {error}
        </p>
      ) : null}
      {hint ? (
        <p
          id={`${id}-hint`}
          className="text-[12.5px] leading-[1.5] text-[var(--pf-text-4)]"
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
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClass}>
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
      className={classNames(
        "pf-numeric text-[20px] font-semibold",
        props.className,
      )}
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
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={classNames(
          controlClass,
          "h-[120px] resize-none rounded-[var(--pf-r3)] py-4 text-[16px] leading-[1.45]",
          className,
        )}
        {...props}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

/** The 52px pill search field used by Exercises, History and Add exercise. */
export function SearchField({
  id,
  label,
  onClear,
  clearLabel = "Clear search",
  className,
  ...props
}: {
  id: string;
  label: string;
  onClear?: () => void;
  clearLabel?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const hasValue = typeof props.value === "string" && props.value.length > 0;

  return (
    <div className="relative shrink-0">
      <input
        id={id}
        aria-label={label}
        className={classNames(
          "h-[var(--pf-size-search)] w-full rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg-surface)] px-[46px] text-[16px] text-[var(--pf-text)] transition-colors duration-[var(--pf-mo-base)] ease-linear placeholder:text-[var(--pf-text-4)] focus:border-[var(--pf-border-strong)]",
          className,
        )}
        {...props}
      />
      <Icon
        name="search"
        size={17}
        className="absolute top-1/2 left-[18px] -translate-y-1/2 text-[var(--pf-text-4)]"
      />
      {hasValue && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          className="absolute top-1/2 right-1.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-[var(--pf-text-3)] motion-safe:animate-[pf-fade-in_var(--pf-mo-fast)_linear]"
        >
          <Icon name="x" size={14} />
        </button>
      ) : null}
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
        "min-h-[var(--pf-size-control-chip)] rounded-full border px-[15px] text-[13.5px] font-semibold transition-[background-color,border-color,color] duration-[var(--pf-mo-base)] ease-linear",
        selected
          ? "border-[var(--pf-accent)] bg-[var(--pf-accent)] text-[var(--pf-on-accent)]"
          : "border-[var(--pf-border)] bg-transparent text-[var(--pf-text-2)]",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
