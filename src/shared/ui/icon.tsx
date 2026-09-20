import "./icon.css";

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

/** The eleven boxes the prototype draws an icon at. */
export type IconSize = 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 28 | 30;

type IconProps = {
  name: IconName;
  size?: IconSize;
  className?: string;
};

// The glyph, the box and the colour all come from `icon.css`, keyed on these
// two attributes: nothing here carries a style. 16px is the default box, so a
// call that omits `size` leaves `data-icon-size` off and takes it from the
// `[data-icon]` rule.
export function Icon({ name, size, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      data-icon={name}
      data-icon-size={size}
      className={className}
    />
  );
}
