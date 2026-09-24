import Link from "next/link";

import { getWeightProgress } from "@/server/application/weight";
import { TabbedCount, TabbedPanel } from "@/shared/ui";

import { WeightView } from "./weight-view";

export const dynamic = "force-dynamic";

export default async function WeightHistoryPage() {
  const result = await getWeightProgress();

  if (!result.ok) {
    // A read that failed, which the prototype has no notion of: the note card
    // every ported list answers such a state with.
    return (
      <>
        <TabbedCount>—</TabbedCount>
        <TabbedPanel>
          <p data-note-card="">
            {result.error.message}
            <Link href="/body/weight">Try again</Link>
          </p>
        </TabbedPanel>
      </>
    );
  }

  return <WeightView overview={result.value.overview} />;
}
