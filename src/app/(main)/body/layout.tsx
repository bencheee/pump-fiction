import type { ReactNode } from "react";

import { BodyNavigation } from "./body-navigation";

export default function BodyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <BodyNavigation />
      <div className="flex-1">{children}</div>
    </div>
  );
}
