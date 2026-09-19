import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { fillHydrated, runScreenAction } from "./support/hydration";

test.describe("programs mobile experience", () => {
  test("creates, validates, makes current, reorders, advances on deletion, and deletes", async ({
    page,
  }, testInfo) => {
    const seededProgramId = await rememberSeededProgram();
    const stamp = `${testInfo.project.name} ${Date.now()}`;
    const exerciseA = `Press ${stamp}`;
    const exerciseB = `Row ${stamp}`;
    const program = `Strength ${stamp}`;
    const splitA = `Upper ${stamp}`;
    const splitB = `Lower ${stamp}`;

    try {
      for (const exercise of [exerciseA, exerciseB]) {
        await page.goto("/exercises/new");
        await fillHydrated(page.getByLabel("Name"), exercise);
        await runScreenAction(page, "Exercise actions", "Save exercise");
        await expect(page).toHaveURL(/\/exercises$/);
        await expect(page.getByText("Exercise saved.")).toBeVisible();
      }

      // Saving a new program returns to the list; splits are added by reopening it.
      await page.goto("/programs");
      await page
        .getByRole("link", { name: "Add program", exact: true })
        .click();
      await fillHydrated(page.getByLabel("Program name"), program);
      await runScreenAction(
        page,
        "Program actions",
        /^Save (program|changes)$/,
      );
      await expect(page).toHaveURL(/\/programs$/);
      await expect(page.getByText("Program saved.")).toBeVisible();
      await page.getByRole("link", { name: new RegExp(program) }).click();
      await expect(page).toHaveURL(/\/programs\/[0-9a-f-]+\/edit$/);
      const programEditUrl = page.url();

      // Split validation keeps the form open; a valid save returns to the program.
      await page.getByRole("link", { name: "Add Split" }).click();
      await page.getByLabel("Split name").fill(splitA);
      await page.getByRole("button", { name: "Add exercise" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: exerciseA })
        .click();
      // A new prescription starts at 3 x 8-12; five steps down put the maximum
      // below the minimum.
      const fewerMax = page.getByRole("button", {
        name: `Fewer maximum reps for ${exerciseA}`,
      });
      for (let step = 0; step < 5; step += 1) await fewerMax.click();
      await runScreenAction(page, "Split actions", /^Save (split|changes)$/);
      await expect(
        page.getByText("Maximum reps must be at least the minimum reps."),
      ).toBeVisible();
      const moreMax = page.getByRole("button", {
        name: `More maximum reps for ${exerciseA}`,
      });
      for (let step = 0; step < 5; step += 1) await moreMax.click();
      await runScreenAction(page, "Split actions", /^Save (split|changes)$/);
      await expect(page).toHaveURL(programEditUrl);
      await expect(page.getByText("Split saved.")).toBeVisible();

      await page.getByRole("link", { name: "Add Split" }).click();
      await page.getByLabel("Split name").fill(splitB);
      await page.getByRole("button", { name: "Add exercise" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: exerciseB })
        .click();
      await runScreenAction(page, "Split actions", /^Save (split|changes)$/);
      await expect(page).toHaveURL(programEditUrl);

      // Making the program current chooses the first split of its rotation.
      await runScreenAction(
        page,
        "Program actions",
        "Make this the current program",
      );
      await page
        .getByRole("dialog")
        .getByRole("button", { name: splitB })
        .click();
      await expect(page.getByText("Program is now current.")).toBeVisible();
      await expect(page.getByText("Current program")).toBeVisible();
      await expect(page.getByText("Next", { exact: true })).toBeVisible();

      await page.getByRole("region", { name: splitA }).focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByText("Order saved.")).toBeVisible();
      await runScreenAction(page, "Program actions", "Set the next split");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: splitA })
        .click();
      await expect(page.getByText("Next split updated.")).toBeVisible();

      // Deleting the next split moves the pointer to its successor.
      await page.getByRole("link", { name: new RegExp(splitA) }).click();
      await runScreenAction(page, "Split actions", "Delete this split");
      await expect(page.getByRole("alertdialog")).toContainText(splitB);
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete split" })
        .click();
      await expect(page).toHaveURL(programEditUrl);
      await expect(page.getByText("Split deleted.")).toBeVisible();
      await expect(page.getByText("Next", { exact: true })).toBeVisible();

      // The last split of the current program cannot be deleted.
      await page.getByRole("link", { name: new RegExp(splitB) }).click();
      await page.getByRole("button", { name: "Split actions" }).click();
      await expect(
        page.getByRole("button", {
          name: "Delete — the current program must keep at least one split",
        }),
      ).toBeDisabled();
      await page.goto(programEditUrl);

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      await testInfo.attach(`program-editor-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // Deleting the current program leaves no current program.
      await runScreenAction(page, "Program actions", "Delete this program");
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete program" })
        .click();
      await expect(page).toHaveURL(/\/programs$/);
      await expect(page.getByText("Program deleted.")).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(program) }),
      ).toHaveCount(0);
      await page.goto("/today");
      await expect(page.getByText("No proposed workout")).toBeVisible();
    } finally {
      await cleanUp({
        program,
        exercises: [exerciseA, exerciseB],
        seededProgramId,
      });
    }
  });

  test("rejects malformed program and split routes", async ({ page }) => {
    await page.goto("/programs/not-a-uuid/edit");
    await expect(page.getByText(/not found/i)).toBeVisible();
    await page.goto("/splits/not-a-uuid/edit");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** The scenario makes its own program current; the seeded pointer is restored afterwards. */
async function rememberSeededProgram(): Promise<string | null> {
  const { data, error } = await adminClient()
    .from("app_settings")
    .select("current_program_id")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (data?.current_program_id as string | null) ?? null;
}

async function cleanUp(fixture: {
  program: string;
  exercises: readonly string[];
  seededProgramId: string | null;
}) {
  const client = adminClient();
  await client.from("programs").delete().eq("name", fixture.program);
  await client
    .from("exercises")
    .delete()
    .in("name", [...fixture.exercises]);
  if (fixture.seededProgramId)
    await client
      .from("app_settings")
      .update({ current_program_id: fixture.seededProgramId })
      .eq("id", 1);
}
