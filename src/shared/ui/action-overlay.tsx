"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { classNames } from "./class-names";
import { Icon, type IconName } from "./icon";
import { Overlay } from "./overlays";

export type OverlayAction = Readonly<{
  key: string;
  label: string;
  icon: IconName;
  disabled?: boolean;
  onRun: () => void;
}>;

/** The full-width `···` control that opens a screen's actions. */
export function ActionsTrigger({
  label = "Actions",
  tone = "accent",
  ...props
}: {
  label?: string;
  tone?: "accent" | "muted";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={classNames(
        "flex h-[58px] w-full items-center justify-center rounded-full pb-2 text-[24px] leading-none font-bold tracking-[0.12em] transition-[background-color,color,transform] duration-[var(--pf-mo-base)] ease-[var(--pf-ease)] active:scale-[0.99]",
        tone === "accent"
          ? "bg-[var(--pf-accent-dim)] text-[var(--pf-accent)]"
          : "bg-[var(--pf-bg-surface)] text-[var(--pf-glyph-dim)]",
      )}
      {...props}
    >
      <span aria-hidden="true">···</span>
    </button>
  );
}

/**
 * The redesign's two-step action surface: every screen-level action lives here,
 * you pick one, and Continue commits it. Picking and committing are separate so
 * a destructive action is never one stray tap away.
 */
export function ActionOverlay({
  trigger,
  title,
  meta,
  actions,
  continueLabel = "Continue",
}: {
  trigger: ReactElement;
  title: string;
  meta?: string;
  actions: readonly OverlayAction[];
  continueLabel?: string;
}) {
  const [picked, setPicked] = useState<string>();
  const chosen = actions.find((action) => action.key === picked);

  return (
    <Overlay
      title="Actions"
      trigger={trigger}
      onOpenChange={(open) => {
        if (!open) setPicked(undefined);
      }}
      footer={(close) => (
        <button
          type="button"
          disabled={!chosen}
          onClick={() => {
            if (!chosen) return;
            setPicked(undefined);
            close();
            chosen.onRun();
          }}
          className={classNames(
            "flex h-[var(--pf-size-primary-action)] items-center justify-center gap-2.5 rounded-full text-[17px] font-semibold transition-colors duration-[var(--pf-mo-base)] ease-linear",
            chosen
              ? "bg-[var(--pf-accent)] text-[var(--pf-on-accent)]"
              : "bg-[var(--pf-bg-surface)] text-[var(--pf-glyph-dim)]",
          )}
        >
          <Icon name="chevron-right" size={18} />
          {continueLabel}
        </button>
      )}
    >
      <h2 className="text-[24px] leading-[1.14] font-semibold tracking-[-0.01em] [text-wrap:pretty]">
        {title}
      </h2>
      {meta ? (
        <p className="pf-numeric mt-2 text-[16px] text-[var(--pf-text-3)]">
          {meta}
        </p>
      ) : null}
      <div className="mt-5.5 flex flex-col gap-2">
        {actions.map((action, index) => {
          const on = action.key === picked;

          return (
            <button
              key={action.key}
              type="button"
              disabled={action.disabled}
              aria-pressed={on}
              onClick={() => setPicked(action.key)}
              style={{ animationDelay: `${40 + index * 45}ms` }}
              className={classNames(
                "flex min-h-[68px] items-center gap-3.5 rounded-[var(--pf-r3)] border px-[18px] py-3.5 text-left text-[15.5px] font-semibold transition-[background-color,border-color,color,transform] duration-[var(--pf-mo-base)] ease-[var(--pf-ease)] motion-safe:animate-[pf-row-in_260ms_var(--pf-ease)_both]",
                action.disabled
                  ? "border-[var(--pf-border)] bg-[var(--pf-bg-surface)] text-[var(--pf-glyph-dim)]"
                  : on
                    ? "scale-[0.985] border-[var(--pf-accent)] bg-[var(--pf-accent)] text-[var(--pf-on-accent)]"
                    : "border-[var(--pf-border)] bg-[var(--pf-bg-surface)] text-[var(--pf-text)]",
              )}
            >
              <Icon name={action.icon} size={20} />
              <span className="min-w-0 flex-1 [text-wrap:pretty]">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </Overlay>
  );
}
