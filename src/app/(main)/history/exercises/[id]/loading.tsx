import { LoadingSkeleton, PageFrame, TopBar } from "@/shared/ui";

export default function ExerciseStatisticsLoading() {
  return (
    <div>
      <TopBar
        title="Exercise"
        backHref="/history/exercises"
        backLabel="Exercises"
      />
      <PageFrame title="Exercise">
        <LoadingSkeleton label="Loading exercise progress" />
      </PageFrame>
    </div>
  );
}
