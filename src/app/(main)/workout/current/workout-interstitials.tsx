"use client";

import { Icon } from "@/shared/ui";

/**
 * The moment a set is banked. The check pops, a ring expands past it, and the
 * stage behind it fades out and back in with the next set, so the beat reads as
 * progress rather than as a page change.
 */
export function SetLoggedFlash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center"
    >
      <div className="relative flex size-26 items-center justify-center motion-safe:animate-[pf-flash-in_2150ms_ease-out_400ms_both]">
        <span className="absolute inset-0 rounded-full border-2 border-[var(--pf-accent)] motion-safe:animate-[pf-flash-ring_1100ms_var(--pf-ease)_700ms]" />
        <span className="flex size-21 items-center justify-center rounded-full bg-[var(--pf-accent)] text-[var(--pf-on-accent)] shadow-[var(--pf-shadow-flash)]">
          <Icon name="check" size={36} />
        </span>
      </div>
    </div>
  );
}

function Celebration({
  icon,
  kicker,
  title,
  chips,
  meta,
  children,
  label,
}: {
  icon: "check" | "check-check";
  kicker: string;
  title: string;
  chips: readonly string[];
  meta: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="absolute inset-0 z-30 flex flex-col bg-[var(--pf-bg-canvas)] motion-safe:animate-[pf-fade-in_180ms_linear]"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-6 pt-4">
        <div className="relative flex size-21 shrink-0 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-[var(--pf-accent)] motion-safe:animate-[pf-handoff-ring_1300ms_var(--pf-ease)_160ms_2]"
          />
          <span className="flex size-[66px] items-center justify-center rounded-full bg-[var(--pf-accent)] text-[var(--pf-on-accent)] motion-safe:animate-[pf-handoff-pop_440ms_var(--pf-ease-pop)]">
            <Icon name={icon} size={30} />
          </span>
        </div>
        <p className="shrink-0 text-[11.5px] font-semibold tracking-[0.14em] text-[var(--pf-accent)] uppercase motion-safe:animate-[pf-handoff-in_320ms_var(--pf-ease)_140ms_both]">
          {kicker}
        </p>
        <h2 className="shrink-0 text-center text-[25px] leading-[1.14] font-semibold tracking-[-0.01em] [text-wrap:pretty] motion-safe:animate-[pf-handoff-in_320ms_var(--pf-ease)_200ms_both]">
          {title}
        </h2>
        <div className="flex shrink-0 flex-wrap justify-center gap-1.5 motion-safe:animate-[pf-handoff-in_320ms_var(--pf-ease)_280ms_both]">
          {chips.map((chip) => (
            <span
              key={chip}
              className="pf-numeric rounded-full bg-[var(--pf-bg-surface)] px-3 py-[7px] text-[15px] text-[var(--pf-text-2)]"
            >
              {chip}
            </span>
          ))}
        </div>
        <p className="shrink-0 text-center text-[12.5px] text-[var(--pf-text-4)] motion-safe:animate-[pf-handoff-in_320ms_var(--pf-ease)_340ms_both]">
          {meta}
        </p>
      </div>
      <div className="flex shrink-0 justify-center py-1.5">
        <Icon
          name="arrow-left"
          size={20}
          className="-rotate-90 text-[var(--pf-border-strong)] motion-safe:animate-[pf-handoff-arrow_1200ms_ease-in-out_400ms_infinite]"
        />
      </div>
      {children}
    </div>
  );
}

/** Between two exercises: what was finished, and what is waiting. */
export function ExerciseHandoff({
  doneName,
  doneMeta,
  chips,
  nextName,
  nextSet,
  nextMeta,
  onContinue,
}: {
  doneName: string;
  doneMeta: string;
  chips: readonly string[];
  nextName: string;
  nextSet: string;
  nextMeta: string;
  onContinue: () => void;
}) {
  return (
    <Celebration
      label="Exercise done"
      icon="check"
      kicker="Exercise done"
      title={doneName}
      chips={chips}
      meta={doneMeta}
    >
      <div className="mx-4 mb-4.5 flex shrink-0 flex-col gap-3 rounded-[var(--pf-r5)] bg-[var(--pf-bg-surface)] p-[22px] motion-safe:animate-[pf-handoff-in_360ms_var(--pf-ease)_420ms_both]">
        <p className="text-[11.5px] font-semibold tracking-[0.14em] text-[var(--pf-accent)] uppercase">
          Up next
        </p>
        <h3 className="text-[21px] leading-[1.2] font-semibold [text-wrap:pretty]">
          {nextName}
        </h3>
        <p className="pf-numeric text-[15px] text-[var(--pf-text-3)]">
          {nextSet} · {nextMeta}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-1 flex h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-[var(--pf-accent)] text-[17px] font-semibold text-[var(--pf-on-accent)]"
        >
          <Icon name="play" size={18} />
          Continue
        </button>
      </div>
    </Celebration>
  );
}

/** Every planned set is recorded; the workout is one action from History. */
export function WorkoutComplete({
  workoutName,
  chips,
  meta,
  rotationLine,
  onDone,
}: {
  workoutName: string;
  chips: readonly string[];
  meta: string;
  rotationLine: string;
  onDone: () => void;
}) {
  return (
    <Celebration
      label="All sets done"
      icon="check-check"
      kicker="All sets done"
      title={workoutName}
      chips={chips}
      meta={meta}
    >
      <div className="mx-4 mb-4.5 flex shrink-0 flex-col gap-2.5 rounded-[var(--pf-r5)] bg-[var(--pf-accent)] p-[22px] text-[var(--pf-on-accent)] motion-safe:animate-[pf-handoff-in_360ms_var(--pf-ease)_420ms_both]">
        <p className="text-[11.5px] font-bold tracking-[0.14em] uppercase opacity-[0.72]">
          Workout complete
        </p>
        <h3 className="text-[21px] leading-[1.2] font-bold">Save to History</h3>
        <p className="pf-numeric text-[15px] font-semibold opacity-80">
          {rotationLine}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-1.5 flex h-[60px] w-full items-center justify-center gap-2.5 rounded-full bg-[var(--pf-on-accent)] text-[17px] font-semibold text-[var(--pf-accent)]"
        >
          <Icon name="calendar-check" size={18} />
          Finish and go to Today
        </button>
      </div>
    </Celebration>
  );
}
