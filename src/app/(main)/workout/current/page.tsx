import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentWorkout } from "@/server/application/active-workout";
import { EmptyState, PageFrame } from "@/shared/ui";

import { ActiveWorkoutExperience } from "./active-workout-experience";

export const dynamic = "force-dynamic";

export default async function CurrentWorkoutPage() {
  const workout = await getCurrentWorkout();

  if (!workout.ok) {
    return (
      <PageFrame title="Active workout">
        <EmptyState
          title="The workout couldn't be loaded"
          body={workout.error.message}
          action={
            <Link
              href="/workout/current"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  if (workout.value === null) redirect("/today");

  return <ActiveWorkoutExperience initial={workout.value} />;
}
