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
      <PageFrame title="Weight" className="pt-6">
        <EmptyState
          title="Weight couldn't be loaded"
          body={result.error.message}
          action={
            <Link
              href="/body/weight"
              className="min-h-11 rounded-[var(--pf-r2)] border border-[var(--pf-border-control)] px-4 py-3 font-semibold"
            >
              Retry
            </Link>
          }
        />
      </PageFrame>
    );
  }

  return (
    <WeightView progress={result.value} initialRange={defaultWeightRange} />
  );
}
