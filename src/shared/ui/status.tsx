import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";
import "./status.css";

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
  size,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  /**
   * `statistics` is the heading badge of the two statistics screens, which the
   * prototype pads 1px wider on each side than the rows' (lines 486, 616).
   */
  size?: "statistics";
}) {
  return (
    <span data-badge="" data-tone={tone} data-size={size}>
      {children}
    </span>
  );
}

/*
 * The `Unsaved` chip a screen with an edited draft puts in its top bar, added
 * in step 10 of docs/design/redesign-v2/PLAN.md. The prototype writes it four
 * times with the same six declarations and the same word — Correct workout
 * (line 432), Program (781), Split editor (842) and Exercise definition (943)
 * — so it is one surface from here on; steps 14, 15 and 17 take this one.
 */
export function UnsavedChip() {
  return <span data-unsaved-chip="">Unsaved</span>;
}

/*
 * The tinted chip that names the set being worked on. The prototype writes it
 * twice, on the two screens a set is entered from: the Active set queue (line
 * 151) and the Correct set overlay (703). Step 4 wrote the queue's inside
 * `set-queue.css`; step 10 lifts it out so the two are one surface.
 */
export function SetChip({ children }: { children: ReactNode }) {
  return <span data-set-chip="">{children}</span>;
}

/*
 * The card a screen answers a command the server refused with, added in step 9
 * and lifted here in step 10. The prototype has no notion of one, so no screen
 * of its own; it takes the card the Review & finish panel draws its
 * outstanding line in (line 1495). It stays until the press is repeated, which
 * is what separates it from the toast. The margin around it is the screen's.
 */
export function AlertCard({ children }: { children: ReactNode }) {
  return (
    <p data-alert-card="" role="alert">
      <Icon name="circle-alert" size={15} />
      {children}
    </p>
  );
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

/*
 * The stat tile, ported from the prototype for step 9 of
 * docs/design/redesign-v2/PLAN.md and lifted here in step 18.
 *
 * Prototype sources: the Workout detail's pair (lines 375-386) and Body's
 * weight tiles (1024-1033). The two write the same tile; the Workout detail's
 * carries no detail line. Split statistics' tiles (620) state their value at
 * 21px and bind their colours, so they stay that screen's own.
 */
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
    <div data-stat-card="">
      <p>{label}</p>
      <p>{value}</p>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
