import Link from "next/link";

import { defaultWeightRange } from "@/features/history/application/weight-operations";
import { getWeightProgress } from "@/server/application/weight";
import { EmptyState, PageFrame } from "@/shared/ui";

import { WeightView } from "./weight-view";

export const dynamic = "force-dynamic";

export default async function WeightHistoryPage() {
  const result = await getWeightProgress({ range: defaultWeightRange });

  if (!result.ok) {
    return (
      <PageFrame title="Weight">
        <EmptyState
          title="Weight couldn't be loaded"
          body={result.error.message}
          action={<Link href="/body/weight">Retry</Link>}
        />
      </PageFrame>
    );
  }

  return (
    <WeightView progress={result.value} initialRange={defaultWeightRange} />
  );
}
