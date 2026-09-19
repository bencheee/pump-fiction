import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function HistoryWorkoutLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
