import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function HistoryWorkoutLoading() {
  return (
    <div>
      <TopBar
        title="Workout"
        backHref="/history/workouts"
        backLabel="Workouts"
      />
      <PageFrame title="Workout">
        <LoadingSkeleton label="Loading the saved workout" />
      </PageFrame>
    </div>
  );
}
