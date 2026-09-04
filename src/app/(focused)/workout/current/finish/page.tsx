import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentWorkout } from "@/server/application/active-workout";
import { EmptyState, PageFrame } from "@/shared/ui";

import { FinishReview } from "./finish-review";

export const dynamic = "force-dynamic";

export default async function FinishWorkoutPage() {
  const workout = await getCurrentWorkout();

  if (!workout.ok) {
    return (
      <PageFrame title="Review & Finish">
        <EmptyState
          title="The review couldn't be loaded"
          body={workout.error.message}
          action={
            <Link
              href="/workout/current/finish"
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

  return <FinishReview initial={workout.value} />;
}
