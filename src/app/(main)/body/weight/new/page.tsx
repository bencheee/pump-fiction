import { redirect } from "next/navigation";

import { getTodayWeight } from "@/server/application/weight";
import { EmptyState, PageFrame, TopBar } from "@/shared/ui";

import { WeightForm } from "../weight-form";

export const dynamic = "force-dynamic";

/*
 * `bwAdd` (prototype line 3068): Body's `Add` opens a new weigh-in for today.
 * The prototype opens its Body entry panel, which step 20 of
 * docs/design/redesign-v2/PLAN.md ports; until then it is the application's
 * weight form on a route of its own.
 */
export default async function NewWeightEntryPage() {
  const today = await getTodayWeight();
  if (!today.ok) {
    return (
      <div>
        <TopBar title="Add weigh-in" backHref="/body/weight" backLabel="Back" />
        <PageFrame title="Weigh-in unavailable">
          <EmptyState
            title="Today couldn't be loaded"
            body={today.error.message}
          />
        </PageFrame>
      </div>
    );
  }
  // At most one weigh-in a day: once today's exists, `Add` opens that one.
  if (today.value.entry !== null)
    redirect(`/body/weight/${today.value.localDate}/edit`);
  return <WeightForm localDate={today.value.localDate} />;
}
