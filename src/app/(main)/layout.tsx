import type { ReactNode } from "react";

import { MainShell } from "@/shared/ui";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainShell>{children}</MainShell>;
}
