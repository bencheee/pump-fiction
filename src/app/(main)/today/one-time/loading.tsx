import { LoadingSkeleton, TopBar } from "@/shared/ui";

export default function OneTimeWorkoutLoading() {
  return (
    <div className="min-h-full">
      <TopBar
        title="One-Time Workout"
        backHref="/today"
        backLabel="Back to Today"
      />
      <div className="px-[var(--pf-gutter)] pt-5">
        <LoadingSkeleton label="Loading one-time workout builder" />
      </div>
    </div>
  );
}
