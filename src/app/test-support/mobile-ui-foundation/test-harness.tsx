"use client";

import { useState } from "react";

import {
  Action,
  DestructiveDialog,
  PageFrame,
  Sheet,
  TextField,
} from "@/shared/ui";

export function MobileUiFoundationHarness() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className="h-dvh overflow-y-auto bg-[var(--pf-bg-canvas)]">
      <PageFrame title="UI foundation test support">
        <TextField id="test-name" label="Name" error="Enter a name." />
        <Sheet
          trigger={<Action variant="secondary">Open sheet</Action>}
          title="Choose an option"
          description="Transient test surface"
        >
          <button type="button" className="min-h-11 w-full">
            First option
          </button>
        </Sheet>
        <DestructiveDialog
          trigger={<Action variant="danger">Open destructive dialog</Action>}
          title="Discard changes?"
          description="Your pending changes will not be recorded."
          confirmLabel="Discard changes"
          onConfirm={() => setConfirmed(true)}
        />
        <output aria-live="polite">
          {confirmed ? "Discard confirmed" : "No destructive action"}
        </output>
      </PageFrame>
    </main>
  );
}
