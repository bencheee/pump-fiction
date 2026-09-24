import Link from "next/link";

import { getToday } from "@/server/application/active-workout";
import { renderedAt } from "@/server/application/rendered-at";
import { PageFrame } from "@/shared/ui";

import { TodayExperience } from "./today-experience";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const result = await getToday();

  if (!result.ok) {
    return (
      // A read that failed, which the prototype has no notion of: the note
      // card every ported screen answers such a state with (step 21).
      <PageFrame screen="today" title="Today">
        <p data-note-card="">
          {result.error.message}
          <Link href="/today">Try again</Link>
        </p>
      </PageFrame>
    );
  }

  // The baseline the restore card's clock has to agree with on its first
  // client render.
  return (
    <TodayExperience today={result.value} serverNow={await renderedAt()} />
  );
}
