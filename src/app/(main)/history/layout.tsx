import type { ReactNode } from "react";

import { HistoryFrame } from "./history-frame";

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return <HistoryFrame>{children}</HistoryFrame>;
}
