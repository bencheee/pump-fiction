import Link from "next/link";

import { getToday } from "@/server/application/active-workout";
import { EmptyState, PageFrame } from "@/shared/ui";

import { TodayExperience } from "./today-experience";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const result = await getToday();

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

  return <TodayExperience today={result.value} />;
}
