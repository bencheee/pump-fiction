import Link from "next/link";

import { listExercises } from "@/server/application/exercises";
import { EmptyState, TopBar } from "@/shared/ui";

import { OneTimeWorkoutForm } from "./one-time-workout-form";

export const dynamic = "force-dynamic";

export default async function OneTimeWorkoutPage() {
  const result = await listExercises(false);
  if (!result.ok) {
    return (
      <div className="min-h-full">
        <TopBar
          title="One-Time Workout"
          backHref="/today"
          backLabel="Back to Today"
        />
        <div className="px-[var(--pf-gutter)] pt-6">
          <EmptyState
            title="Exercises couldn't be loaded"
            body={result.error.message}
            action={
              <Link
                href="/today/one-time"
                className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
              >
                Retry
              </Link>
            }
          />
        </div>
      </div>
    );
  }
  return <OneTimeWorkoutForm exercises={result.value} />;
}
