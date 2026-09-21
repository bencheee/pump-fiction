"use client";

import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import type { HandoffView } from "@/features/active-workout/ui/set-queue-presentation";
import { Icon, type IconName, usePanelContainer } from "@/shared/ui";

import "./workout-interstitials.css";

/*
 * The three surfaces the set-logging flow raises, ported from the prototype for
 * step 7 of docs/design/redesign-v2/PLAN.md.
 *
 * Prototype sources, read through the Claude Design MCP:
 *   markup        lines 1308-1316 (SET LOGGED FLASH),
 *                 1503-1532 (EXERCISE HANDOFF, `data-screen-label`
 *                 "Exercise handoff"),
 *                 1533-1560 (WORKOUT COMPLETE, "Workout complete")
 *   behaviour     `flashSet` 1837-1842, `afterLog` 1898-1907,
 *                 `startHandoff` 1909-1926, `finishHandoff` 1928-1931,
 *                 `finish` 1933-1958
 *   bound values  3413 (`flashOn`), 3442-3449 (handoff), 3451-3458 (complete)
 *
 * The handoff and the complete screen are the same frame — a badge, a kicker,
 * a name, the chips, a meta line, and a card at the foot — so they are one
 * component with two tones, which is what the prototype writes twice.
 */

/**
 * Screen 22. It carries no control and nothing to read — the segment bar
 * already says the set is recorded — so it is drawn straight into the stage,
 * `pointer-events:none` and out of the accessibility tree, as the prototype
 * draws it.
 */
export function SetLoggedFlash() {
  const container = usePanelContainer();
  if (container === null) return null;

  return createPortal(
    <div data-set-flash="" aria-hidden="true">
      <div data-set-flash-badge="">
        <span data-set-flash-ring="" />
        <span data-set-flash-disc="">
          <Icon name="check" />
        </span>
      </div>
    </div>,
    container,
  );
}

/*
 * The frame both interstitials carry. It is not a panel: neither screen has a
 * close control, an Escape, or a Back — the prototype's own `handoffOn` and
 * `doneOn` are left by `afterLog` and cleared only by the screen's own action.
 * A Radix dialog is still what holds it, so the queue and the bottom
 * navigation under it are inert and focus lands on that action.
 */
function Interstitial({
  screen,
  icon,
  kicker,
  name,
  chips,
  meta,
  children,
}: {
  screen: string;
  icon: IconName;
  kicker: string;
  name: string;
  chips: readonly Readonly<{ key: string; text: string }>[];
  meta: string;
  children: ReactNode;
}) {
  const container = usePanelContainer();

  return (
    <Dialog.Root open>
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Content
          data-interstitial={screen}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div data-interstitial-body="">
            <div data-interstitial-badge="">
              <span data-interstitial-ring="" />
              <span data-interstitial-disc="">
                <Icon name={icon} size={30} />
              </span>
            </div>
            <p data-interstitial-kicker="">{kicker}</p>
            <Dialog.Title data-interstitial-name="">{name}</Dialog.Title>
            <div data-interstitial-chips="">
              {chips.map((chip) => (
                <span key={chip.key} data-interstitial-chip="">
                  {chip.text}
                </span>
              ))}
            </div>
            <Dialog.Description data-interstitial-meta="">
              {meta}
            </Dialog.Description>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Screen 31. `hoStartNow` (3449) is `finishHandoff()` (1928). */
export function ExerciseHandoff({
  view,
  onContinue,
}: {
  view: HandoffView;
  onContinue: () => void;
}) {
  return (
    <Interstitial
      screen="handoff"
      icon="check"
      kicker="Exercise done"
      name={view.doneName}
      chips={view.chips}
      meta={view.doneMeta}
    >
      {/* The arrow the prototype rotates a quarter turn and then bounces. */}
      <div data-handoff-arrow="" aria-hidden="true">
        <Icon name="arrow-left" size={20} />
      </div>
      <div data-interstitial-card="" data-tone="surface">
        <p data-interstitial-card-kicker="">Up next</p>
        <h3 data-interstitial-card-title="">{view.nextName}</h3>
        {/* `{{ hoNextSet }} · {{ hoNextMeta }}` (line 1529) — two bound values
            either side of the separator, which is three text nodes and not
            one string: joined into one the line shapes a fraction of a pixel
            differently. */}
        <p data-interstitial-card-meta="">
          {view.nextMeta === null ? (
            view.nextSet
          ) : (
            <>
              {view.nextSet} · {view.nextMeta}
            </>
          )}
        </p>
        <button
          type="button"
          data-interstitial-card-action=""
          aria-label="Continue to next exercise"
          title="Continue to next exercise"
          onClick={onContinue}
        >
          <Icon name="play" size={18} />
          Continue
        </button>
      </div>
    </Interstitial>
  );
}

/**
 * Screen 32. `doneDone` (3458) is `finish("completed")` (1933), which the
 * prototype is done with the moment it is called; here it is the workout's
 * terminal command and Today is reached once the outbox has drained, so the
 * action holds the screen while it does — the same wait the review panel's
 * Complete workout takes.
 */
export function WorkoutComplete({
  workoutName,
  chips,
  meta,
  rotation,
  finishing,
  onBackToToday,
}: {
  workoutName: string;
  chips: readonly Readonly<{ key: string; text: string }>[];
  meta: string;
  rotation: string;
  finishing: boolean;
  onBackToToday: () => void;
}) {
  return (
    <Interstitial
      screen="complete"
      icon="check-check"
      kicker="All sets done"
      name={workoutName}
      chips={chips}
      meta={meta}
    >
      <div data-interstitial-card="" data-tone="accent">
        <p data-interstitial-card-kicker="">Workout complete</p>
        <h3 data-interstitial-card-title="">Saved to History</h3>
        <p data-interstitial-card-meta="">{rotation}</p>
        <button
          type="button"
          data-interstitial-card-action=""
          aria-label="Back to Today"
          title="Back to Today"
          disabled={finishing}
          onClick={onBackToToday}
        >
          <Icon name="calendar-check" size={18} />
          {finishing ? "Finishing…" : "Back to Today"}
        </button>
      </div>
    </Interstitial>
  );
}
