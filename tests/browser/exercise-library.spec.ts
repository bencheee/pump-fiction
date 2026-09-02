import { expect, test } from "@playwright/test";

test.describe("exercise library", () => {
  test("creates, searches, validates, archives, and reactivates a definition", async ({
    page,
  }, testInfo) => {
    const name = `T-011 ${testInfo.project.name} ${Date.now()}`;

    await page.goto("/exercises");
    await expect(
      page.getByRole("heading", { name: "Exercises" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Add exercise" }).click();

    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Bodyweight" }).click();
    await page
      .getByRole("button", { name: /Bodyweight \+ added weight/ })
      .click();
    await page.getByLabel("Exercise note").fill("Keep the ribs down.");
    await page.getByRole("button", { name: "Save Exercise" }).click();

    await expect(page).toHaveURL(/\/exercises\/[0-9a-f-]+\/edit$/);
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await expect(
      page.getByText(/Changes affect future workouts only/),
    ).toBeVisible();

    await page.goto("/exercises/new");
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save Exercise" }).click();
    await expect(
      page.getByText("An active exercise already uses this name."),
    ).toBeVisible();

    await page.goto("/exercises");
    await page.getByLabel("Search exercises").fill(name);
    await page.getByLabel("Search exercises").press("Enter");
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await page.getByRole("button", { name: "Archive Exercise" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Archive Exercise" })
      .click();
    await expect(page.getByText("Archived exercise")).toBeVisible();

    await page.goto(`/exercises?status=archived&q=${encodeURIComponent(name)}`);
    await expect(
      page.getByRole("link", { name: new RegExp(name) }),
    ).toBeVisible();
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await page.getByRole("button", { name: "Reactivate Exercise" }).click();
    await expect(
      page.getByRole("button", { name: "Archive Exercise" }),
    ).toBeVisible();

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBe(geometry.clientWidth);

    await testInfo.attach(`exercise-editor-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await page.getByRole("button", { name: "Archive Exercise" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Archive Exercise" })
      .click();
  });

  test("rejects malformed and missing exercise routes", async ({ page }) => {
    await page.goto("/exercises/not-a-uuid/edit");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
