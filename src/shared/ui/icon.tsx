export const iconNames = [
  "archive-restore",
  "archive",
  "arrow-down",
  "arrow-left",
  "arrow-up",
  "calendar-check",
  "calendar",
  "check-check",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "circle-alert",
  "circle-check",
  "circle-x",
  "dot",
  "dumbbell",
  "ellipsis-vertical",
  "equal",
  "grip-vertical",
  "history",
  "info",
  "layout-grid",
  "loader-circle",
  "minus",
  "pause",
  "pencil",
  "play",
  "plus",
  "rotate-ccw",
  "ruler",
  "scale",
  "search",
  "trash-2",
  "trending-down",
  "trending-up",
  "triangle-alert",
  "x",
] as const;

export type IconName = (typeof iconNames)[number];

type IconProps = {
  name: IconName;
  size?: 12 | 13 | 14 | 15 | 16 | 18 | 19 | 20;
  className?: string;
};

export function Icon({ name }: IconProps) {
  return <span aria-hidden="true" data-icon={name} />;
}
