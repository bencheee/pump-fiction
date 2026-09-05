import type { ReactNode } from "react";

import { HistoryNavigation } from "./history-navigation";

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <HistoryNavigation />
      <div className="flex-1">{children}</div>
    </div>
  );
}
