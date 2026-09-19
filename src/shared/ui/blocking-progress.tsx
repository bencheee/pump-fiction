import { Icon } from "./icon";

export function BlockingProgress({ label }: { label: string }) {
  return (
    <div role="status" aria-live="assertive" aria-label={label}>
      <div>
        <Icon name="loader-circle" size={18} />
        <span>{label}</span>
      </div>
    </div>
  );
}
