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
          action={<Link href="/today">Retry</Link>}
        />
      </PageFrame>
    );
  }

  return <TodayExperience today={result.value} />;
}
