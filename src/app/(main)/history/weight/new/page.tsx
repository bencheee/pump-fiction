import { getTodayWeight } from "@/server/application/weight";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { WeightForm } from "../weight-form";

export const dynamic = "force-dynamic";

export default async function NewWeightEntryPage() {
  // Only the configured local date is needed here: it is the default the form
  // opens on and the ceiling every date rule measures against.
  const result = await getTodayWeight();

  if (!result.ok) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar
          title="Add Weight"
          backHref="/history/weight"
          backLabel="Weight"
        />
        <PageFrame title="Weight unavailable" className="pt-5">
          <EmptyState
            title="The form couldn't be opened"
            body={result.error.message}
          />
        </PageFrame>
      </div>
    );
  }

  return <WeightForm localDate={result.value.localDate} />;
}
