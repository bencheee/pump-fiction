import { PageFrame, TopBar } from "@/shared/ui";

export default function FinishWorkoutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title="Finish workout"
        backHref="/workout/current"
        backLabel="Back to active workout"
      />
      <PageFrame title="Review" className="min-h-0 flex-1 pt-6" />
    </div>
  );
}
