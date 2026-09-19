import type { CSSProperties } from "react";

import { classNames } from "./class-names";

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

export function Icon({ name, size = 16, className }: IconProps) {
  const style = {
    width: size,
    height: size,
    WebkitMaskImage: `url(/assets/icons/${name}.svg)`,
    maskImage: `url(/assets/icons/${name}.svg)`,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-block shrink-0 bg-current [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]",
        className,
      )}
      style={style}
    />
  );
}
