import { expect, test } from "@playwright/test";

import { fillHydrated } from "./support/hydration";

test.describe("exercise library", () => {
  test("creates, searches, validates, edits, and deletes a definition", async ({
    page,
  }, testInfo) => {
    const name = `T-011 ${testInfo.project.name} ${Date.now()}`;

    await page.goto("/exercises");
    await expect(
      page.getByRole("heading", { name: "Exercises" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Add exercise" }).click();

    // Two types, at most one optional addition on top of the implied mode.
    await fillHydrated(page.getByLabel("Name"), name);
    await page
      .getByRole("group", { name: "Exercise type" })
      .getByRole("button", { name: "Bodyweight" })
      .click();
    await page
      .getByRole("button", { name: /Added kilograms and reps/ })
      .click();
    await page.getByLabel("Exercise note").fill("Keep the ribs down.");
    await page.getByRole("button", { name: "Save Exercise" }).click();

    // Saving returns to the library with a toast.
    await expect(page).toHaveURL(/\/exercises$/);
    await expect(page.getByText("Exercise saved.")).toBeVisible();

    // The edit form states the impact of a change.
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(/\/exercises\/[0-9a-f-]+\/edit$/);
    await expect(page.getByText("Used in 0 splits")).toBeVisible();
    await expect(
      page.getByText(/Changes affect future workouts only/),
    ).toBeVisible();

    // A duplicate name is rejected and the form stays open.
    await page.goto("/exercises/new");
    await fillHydrated(page.getByLabel("Name"), name);
    await page.getByRole("button", { name: "Save Exercise" }).click();
    await expect(
      page.getByText("Another exercise already uses this name."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/exercises\/new$/);

    // Search narrows the library.
    await page.goto("/exercises");
    await page.getByLabel("Search exercises").fill(name);
    await page.getByLabel("Search exercises").press("Enter");
    await expect(page).toHaveURL(/\/exercises\?q=/);
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page).toHaveURL(/\/exercises\/[0-9a-f-]+\/edit$/);

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBe(geometry.clientWidth);
    await testInfo.attach(`exercise-editor-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    // Deletion replaced archiving under ADR-0024: it asks, names the split
    // count, and removes the definition from the library.
    await page.getByRole("button", { name: "Delete Exercise" }).click();
    const dialog = page.getByRole("alertdialog", { name: "Delete exercise?" });
    await expect(dialog).toContainText("No split uses it.");
    await dialog.getByRole("button", { name: "Delete Exercise" }).click();
    await expect(page).toHaveURL(/\/exercises$/);
    await expect(page.getByText("Exercise deleted.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(name) }),
    ).toHaveCount(0);
  });

  test("rejects malformed and missing exercise routes", async ({ page }) => {
    await page.goto("/exercises/not-a-uuid/edit");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
