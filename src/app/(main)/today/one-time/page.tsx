import Link from "next/link";

import { listExercises } from "@/server/application/exercises";
import { EmptyState, TopBar } from "@/shared/ui";

import { OneTimeWorkoutForm } from "./one-time-workout-form";

export const dynamic = "force-dynamic";

export default async function OneTimeWorkoutPage() {
  const result = await listExercises();
  if (!result.ok) {
    return (
      <div>
        <TopBar
          title="One-Time Workout"
          backHref="/today"
          backLabel="Back to Today"
        />
        <div>
          <EmptyState
            title="Exercises couldn't be loaded"
            body={result.error.message}
            action={<Link href="/today/one-time">Retry</Link>}
          />
        </div>
      </div>
    );
  }
  return <OneTimeWorkoutForm exercises={result.value} />;
}
