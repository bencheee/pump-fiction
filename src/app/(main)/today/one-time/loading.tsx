import { LoadingSkeleton, TopBar } from "@/shared/ui";

export default function OneTimeWorkoutLoading() {
  return (
    <div>
      <TopBar
        title="One-Time Workout"
        backHref="/today"
        backLabel="Back to Today"
      />
      <div>
        <LoadingSkeleton label="Loading one-time workout builder" />
      </div>
    </div>
  );
}
