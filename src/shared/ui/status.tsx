import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";

type SaveState = "clean" | "unsaved" | "saving" | "failure";

const saveStates: Record<
  Exclude<SaveState, "clean">,
  { text: string; icon: IconName; className: string }
> = {
  unsaved: {
    text: "Unsaved changes",
    icon: "circle-alert",
    className: "text-[var(--pf-text-2)]",
  },
  saving: {
    text: "Saving…",
    icon: "loader-circle",
    className: "text-[var(--pf-text-2)]",
  },
  failure: {
    text: "Couldn't save your latest changes",
    icon: "circle-x",
    className: "text-[var(--pf-danger)]",
  },
};

export function SaveStatus({
  state,
  validationMessage,
  onRetry,
}: {
  state: SaveState;
  validationMessage?: string;
  onRetry?: () => void;
}) {
  const current = state === "clean" ? undefined : saveStates[state];
  const failed = state === "failure" && !validationMessage;
  const text = validationMessage ?? current?.text;

  return (
    <div role="status" aria-live="polite">
      {text !== undefined ? (
        <>
          <Icon
            name={
              validationMessage
                ? "triangle-alert"
                : (current?.icon ?? "circle-alert")
            }
            size={14}
          />
          <span>{text}</span>
        </>
      ) : null}
      {failed && onRetry ? (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "danger";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span data-tone={tone}>{children}</span>;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}

export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label}>
      {["70%", "100%", "84%"].map((width) => (
        <div key={width} aria-hidden="true" />
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <section>
      <h2>{label}</h2>
      <p>{value}</p>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}
