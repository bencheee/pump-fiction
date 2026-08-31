import { notFound } from "next/navigation";

import { ActiveWorkoutDurabilityHarness } from "./test-harness";

export default function ActiveWorkoutDurabilityTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ActiveWorkoutDurabilityHarness />;
}
