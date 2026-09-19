import type { ReactNode } from "react";

/**
 * Each History screen owns its own frame, because the count beside the title
 * belongs to the tab being shown. The layout only keeps the column.
 */
export default function HistoryLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
