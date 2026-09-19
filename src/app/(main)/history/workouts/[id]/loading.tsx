import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function HistoryWorkoutLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title="Workout"
        backHref="/history/workouts"
        backLabel="Workouts"
      />
      <PageFrame title="Workout" className="pt-5">
        <LoadingSkeleton label="Loading the saved workout" />
      </PageFrame>
    </div>
  );
}
