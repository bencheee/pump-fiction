import Link from "next/link";

import { getToday } from "@/server/application/active-workout";
import { getTodayMeasurements } from "@/server/application/body";
import { getSplit } from "@/server/application/programs";
import { getTodayWeight } from "@/server/application/weight";
import { EmptyState, PageFrame } from "@/shared/ui";

import { TodayExperience } from "./today-experience";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  // The weigh-in and the measurements are reads beside the Today aggregate
  // rather than part of it, so `TodayView` and `get_today` stay exactly as
  // `T-014` shaped them.
  const [result, weight, measurements] = await Promise.all([
    getToday(),
    getTodayWeight(),
    getTodayMeasurements(),
  ]);

  if (!result.ok) {
    return (
      <PageFrame title="Today">
        <EmptyState
          title="Today couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/today"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  const splitResults = await Promise.all(
    [result.value.proposedSplit, ...result.value.alternateSplits]
      .filter((split) => split !== null)
      .map(
        async (split) =>
          [split.splitId, await getSplit(split.splitId)] as const,
      ),
  );
  const failedSplit = splitResults.find(([, split]) => !split.ok);
  if (failedSplit && !failedSplit[1].ok) {
    return (
      <PageFrame title="Today">
        <EmptyState
          title="Today couldn't be loaded"
          body={failedSplit[1].error.message}
          action={
            <Link
              href="/today"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }
  const splitExercises = Object.fromEntries(
    splitResults.map(([splitId, split]) => [
      splitId,
      split.ok ? split.value.exercises : [],
    ]),
  );

  // Both are secondary here: if either cannot be read, Today still starts a
  // workout and simply shows no card for it.
  return (
    <TodayExperience
      today={result.value}
      weight={weight.ok ? weight.value : null}
      measurements={measurements.ok ? measurements.value : null}
      splitExercises={splitExercises}
    />
  );
}
