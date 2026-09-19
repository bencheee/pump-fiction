import type { ReactNode } from "react";

import { BodyNavigation } from "./body-navigation";

export default function BodyLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <BodyNavigation />
      <div>{children}</div>
    </div>
  );
}
