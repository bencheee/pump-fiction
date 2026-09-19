/** The pill beside the History and Body titles, counting the visible tab. */
export function HistoryCount({ count, noun }: { count: number; noun: string }) {
  return (
    <span className="pf-numeric shrink-0 rounded-full bg-[var(--pf-bg-surface)] px-3 py-[7px] text-[14px] font-semibold text-[var(--pf-text-3)]">
      {count} {noun}
      {count === 1 ? "" : "s"}
    </span>
  );
}
