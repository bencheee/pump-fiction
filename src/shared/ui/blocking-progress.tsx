import { Icon } from "./icon";

export function BlockingProgress({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label={label}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/65 px-6 backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-3 rounded-[var(--pf-r3)] border border-[var(--pf-border)] bg-[var(--pf-bg-surface-2)] px-4 py-3 font-semibold shadow-[var(--pf-shadow-toast)]">
        <Icon name="loader-circle" size={18} className="animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}
