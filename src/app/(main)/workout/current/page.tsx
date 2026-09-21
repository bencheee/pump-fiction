import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentWorkout } from "@/server/application/active-workout";
import { EmptyState, PageFrame } from "@/shared/ui";

import { ActiveWorkoutExperience } from "./active-workout-experience";

export const dynamic = "force-dynamic";

/*
 * Which of the two screens this route opens with. The prototype decides it by
 * the action taken: `startSplit` (line 3301) and `startOneTime` (line 3326)
 * both land on `screen: "overview"`, and only `resumeWorkout` (line 3331) —
 * Today's restored-workout card — goes straight to the set queue. One route
 * holds both screens here, so the action carries it in the URL, where a reload
 * and the Back button can still read it.
 */
type SearchParams = Promise<{
  view?: string | string[];
  panel?: string | string[];
}>;

export default async function CurrentWorkoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const view = Array.isArray(params.view) ? params.view[0] : params.view;
  const panel = Array.isArray(params.panel) ? params.panel[0] : params.panel;
  // `?panel=finish` is where `/workout/current/finish` lands. The review is a
  // panel over the set queue, so it brings its screen with it.
  const initialPanel = panel === "finish" ? ("finish" as const) : undefined;
  const initialView =
    initialPanel === undefined && view === "overview" ? "overview" : "queue";
  const workout = await getCurrentWorkout();

  if (!workout.ok) {
    return (
      <PageFrame title="Active workout">
        <EmptyState
          title="The workout couldn't be loaded"
          body={workout.error.message}
          action={<Link href="/workout/current">Retry</Link>}
        />
      </PageFrame>
    );
  }

  if (workout.value === null) redirect("/today");

  return (
    <ActiveWorkoutExperience
      initial={workout.value}
      initialView={initialView}
      initialPanel={initialPanel}
    />
  );
}
