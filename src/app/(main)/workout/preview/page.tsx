import { redirect } from "next/navigation";

import { getToday } from "@/server/application/active-workout";
import { PageFrame } from "@/shared/ui";

import { WorkoutPreview } from "./workout-preview";

export const dynamic = "force-dynamic";

export default async function WorkoutPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ split?: string }>;
}) {
  const { split: splitId } = await searchParams;
  const result = await getToday();
  if (!result.ok) {
    return (
      <PageFrame title="Workout">
        <p data-note-card="">{result.error.message}</p>
      </PageFrame>
    );
  }
  if (result.value.currentWorkout) redirect("/workout/current");
  const split = [
    result.value.proposedSplit,
    ...result.value.alternateSplits,
  ].find((item) => item?.splitId === splitId);
  if (!split) redirect("/today");

  return (
    <WorkoutPreview
      split={split}
      sourceKind={
        split.splitId === result.value.proposedSplit?.splitId
          ? "proposed_split"
          : "alternate_split"
      }
    />
  );
}
