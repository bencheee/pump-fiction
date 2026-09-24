import { runScreenAction } from "./support/actions";
import { fillHydrated } from "./support/hydration";
import { expect, test } from "./support/test";

test.describe("exercise library", () => {
  test("creates, searches, validates, edits, and deletes a definition", async ({
    page,
  }, testInfo) => {
    const name = `T-011 ${testInfo.project.name} ${Date.now()}`;

    await page.goto("/exercises");
    // The destination no longer draws its title (PLAN, Owner decision 7), but
    // the h1 still names it for assistive technology.
    await expect(
      page.getByRole("heading", { name: "Exercises", level: 1 }),
    ).toBeAttached();
    await page.getByRole("link", { name: "Add exercise" }).click();

    // Two types, at most one optional addition on top of the implied mode.
    await fillHydrated(page.getByLabel("Exercise name"), name);
    await page
      .getByRole("region", { name: "Type" })
      .getByRole("button", { name: "Bodyweight" })
      .click();
    await page.getByRole("button", { name: "Add weight" }).click();
    await page.getByLabel("Exercise note").fill("Keep the ribs down.");
    await runScreenAction(page, "Save exercise");

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

    // A duplicate name is rejected and the form stays open with the field
    // marked. Step 17 reports a refusal in a toast, which gives the field's
    // own reason.
    await page.goto("/exercises/new");
    await fillHydrated(page.getByLabel("Exercise name"), name);
    await runScreenAction(page, "Save exercise");
    await expect(page.getByLabel("Exercise name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(
      page
        .locator("[data-toast-message]")
        .filter({ hasText: "Another exercise already uses this name." }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/exercises\/new$/);

    // Search narrows the library. Step 16 filters the loaded library in the
    // browser, so the query no longer travels in the URL.
    await page.goto("/exercises");
    await fillHydrated(page.getByLabel("Search exercises"), name);
    await expect(
      page.getByRole("link", { name: new RegExp(name) }),
    ).toHaveCount(1);
    await page.getByLabel("Search exercises").fill(`${name} no such`);
    await expect(
      page.getByText("No exercise matches this search."),
    ).toBeVisible();
    await page.getByLabel("Search exercises").fill(name);
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
    await runScreenAction(page, "Delete exercise");
    const dialog = page.getByRole("alertdialog", { name: `Delete ${name}?` });
    await expect(dialog).toContainText("No split uses it.");
    await dialog.getByRole("button", { name: "Delete exercise" }).click();
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
