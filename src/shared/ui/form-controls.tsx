import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { Icon } from "./icon";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

function FieldMessage({
  id,
  hint,
  error,
}: Pick<FieldProps, "id" | "hint" | "error">) {
  if (!error && !hint) return null;

  return (
    <>
      {error ? (
        <p id={`${id}-error`} role="alert">
          <Icon name="triangle-alert" size={14} />
          {error}
        </p>
      ) : null}
      {hint ? <p id={`${id}-hint`}>{hint}</p> : null}
    </>
  );
}

export function TextField({
  id,
  label,
  hint,
  error,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}

export function NumericField(
  props: FieldProps & InputHTMLAttributes<HTMLInputElement>,
) {
  return <TextField inputMode="decimal" {...props} />;
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
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
    <button type="button" aria-pressed={selected} {...props}>
      {children}
    </button>
  );
}
