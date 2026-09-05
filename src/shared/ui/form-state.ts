"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useToast } from "./toast";

export type SavePhase = "editing" | "saving" | "failure";

export function useSavedSnapshot(initialSnapshot: string) {
  const [savedSnapshot, setSavedSnapshot] = useState(initialSnapshot);
  const acceptAsSaved = useCallback(
    (snapshot: string) => setSavedSnapshot(snapshot),
    [],
  );
  return { savedSnapshot, acceptAsSaved } as const;
}

export function useSaveOutcome(parentHref: string) {
  const router = useRouter();
  const { showToast } = useToast();

  const returnToParent = useCallback(
    (message: string) => {
      showToast(message);
      router.replace(parentHref);
      router.refresh();
    },
    [parentHref, router, showToast],
  );

  const reportFailure = useCallback(
    (message: string) => showToast(message),
    [showToast],
  );

  return { returnToParent, reportFailure } as const;
}
