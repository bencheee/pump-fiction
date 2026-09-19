import type { ReactNode } from "react";

import { HistoryNavigation } from "./history-navigation";

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <HistoryNavigation />
      <div>{children}</div>
    </div>
  );
}
