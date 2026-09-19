import Link from "next/link";

import { getToday } from "@/server/application/active-workout";
import { EmptyState, PageFrame } from "@/shared/ui";

import { TodayExperience } from "./today-experience";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  // Weight and measurements are recorded in Body now, so Today reads only the
  // workout aggregate; `TodayView` and `get_today` stay as `T-014` shaped them.
  const result = await getToday();

  if (!result.ok) {
    return (
      <PageFrame title="Today">
        <EmptyState
          icon="circle-alert"
          title="Today couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/today"
              className="mt-1 flex min-h-11 items-center rounded-full bg-[var(--pf-accent-dim)] px-5 font-semibold text-[var(--pf-accent)]"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  return <TodayExperience today={result.value} />;
}
