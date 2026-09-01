// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DestructiveDialog, Sheet } from "./overlays";

describe("shared transient overlays", () => {
  it("opens a sheet as a modal and restores focus after Escape", async () => {
    const user = userEvent.setup();
    render(
      <Sheet
        trigger={<button type="button">Open choices</button>}
        title="Choices"
      >
        <button type="button">Choice one</button>
      </Sheet>,
    );

    const trigger = screen.getByRole("button", { name: "Open choices" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Choices" })).toBeVisible();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("places cancel-safe focus first in destructive confirmation", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DestructiveDialog
        trigger={<button type="button">Remove item</button>}
        title="Remove item?"
        description="This cannot be undone."
        confirmLabel="Remove item"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove item" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
