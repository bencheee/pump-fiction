import type { ReactNode } from "react";

import { FocusedShell } from "@/shared/ui";

export default function CurrentWorkoutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FocusedShell>{children}</FocusedShell>;
}
