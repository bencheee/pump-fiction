import { expect, test } from "@playwright/test";

test.describe("programs mobile experience", () => {
  test("creates, validates, activates, reorders, advances on archive, and reactivates", async ({
    page,
  }, testInfo) => {
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const exerciseA = `Press ${stamp}`;
    const exerciseB = `Row ${stamp}`;
    const program = `Strength ${stamp}`;
    const splitA = `Upper ${stamp}`;
    const splitB = `Lower ${stamp}`;

    for (const exercise of [exerciseA, exerciseB]) {
      await page.goto("/exercises/new");
      await page.getByLabel("Name").fill(exercise);
      await page.getByRole("button", { name: "Save Exercise" }).click();
      await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    }

    await page.goto("/programs");
    await page.getByRole("link", { name: "Add program", exact: true }).click();
    await page.getByLabel("Program name").fill(program);
    await page.getByRole("button", { name: "Save as Draft" }).click();
    await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Add Split" }).click();
    await page.getByLabel("Split name").fill(splitA);
    await page.getByRole("button", { name: "Add Exercise" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: exerciseA })
      .click();
    await page.getByLabel("Max reps").fill("4");
    await page.getByRole("button", { name: "Save Split" }).click();
    await expect(
      page.getByText("Maximum reps must be at least the minimum reps."),
    ).toBeVisible();
    await page.getByLabel("Max reps").fill("12");
    await page.getByRole("button", { name: "Save Split" }).click();
    await expect(page).toHaveURL(/\/splits\/[0-9a-f-]+\/edit$/);
    await page.getByRole("link", { name: program }).click();

    await page.getByRole("link", { name: "Add Split" }).click();
    await page.getByLabel("Split name").fill(splitB);
    await page.getByRole("button", { name: "Add Exercise" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: exerciseB })
      .click();
    await page.getByRole("button", { name: "Save Split" }).click();
    await page.getByRole("link", { name: program }).click();

    await page.getByRole("button", { name: "Activate Program" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: splitB })
      .click();
    await expect(page.getByText("Program activated.")).toBeVisible();
    await expect(page.getByText("Next", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: `Move ${splitA} down` }).click();
    await expect(page.getByText("Order saved.")).toBeVisible();
    await page.getByRole("button", { name: "Set Next Split" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: splitA })
      .click();
    await expect(page.getByText("Next split updated.")).toBeVisible();

    await page.getByRole("link", { name: new RegExp(splitA) }).click();
    await page.getByRole("button", { name: "Archive Split" }).click();
    await expect(page.getByRole("alertdialog")).toContainText(splitB);
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Archive Split" })
      .click();
    await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit/);
    await expect(page.getByText("Next", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: new RegExp(splitB) }).click();
    await expect(
      page.getByRole("button", { name: "Archive Split" }),
    ).toBeDisabled();
    await expect(
      page.getByText("At least one active split must remain in the program."),
    ).toBeVisible();
    await page.getByRole("link", { name: program }).click();

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBe(geometry.clientWidth);
    await testInfo.attach(`program-editor-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await page.getByRole("button", { name: "Archive Program" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Archive Program" })
      .click();
    await page.getByRole("button", { name: "Reactivate Program" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: splitB })
      .click();
    await expect(page.getByText("Program activated.")).toBeVisible();
    await page.getByRole("button", { name: "Archive Program" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Archive Program" })
      .click();
  });

  test("rejects malformed program and split routes", async ({ page }) => {
    await page.goto("/programs/not-a-uuid/edit");
    await expect(page.getByText(/not found/i)).toBeVisible();
    await page.goto("/splits/not-a-uuid/edit");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
