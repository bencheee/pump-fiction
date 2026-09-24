import { createClient } from "@supabase/supabase-js";

import { runScreenAction } from "./support/actions";
import { fillHydrated } from "./support/hydration";
import { expect, test } from "./support/test";

// Weigh-ins are unique per local date, so the fixtures sit in a fixed past
// month this suite owns end to end, and it removes that month again. Nothing
// touches today, which may hold a real weigh-in; the scenario adds its own on
// 20 June through the entry panel's date picker.
const seeded = { first: "2026-06-08", second: "2026-06-10" };
const fixtureFrom = "2026-06-01";
const fixtureTo = "2026-06-30";

test.describe("Weight experience", () => {
  test("covers S19 summaries, the chart, and S20 create, edit, and delete", async ({
    page,
  }, testInfo) => {
    await seedWeighIns();

    try {
      // S19 lists the seeded weigh-ins newest first, each with its change. A
      // row is a button that opens the weigh-in in Body's entry panel (step
      // 20); the old per-date edit route is gone.
      await page.goto("/body/weight");
      const second = page.getByRole("button", {
        name: /^Edit weigh-in Wed 10 Jun/,
      });
      await expect(second).toContainText("83 kg");
      await expect(second).toContainText("+1.0 kg");
      await expect(
        page.getByRole("button", { name: /^Edit weigh-in Mon 8 Jun/ }),
      ).toContainText("82 kg");

      // The chart is never the only representation of its data: every bar is
      // a named button and its values are listed (ADR-0033).
      await page
        .getByRole("group", { name: "Time range" })
        .getByRole("button", { name: "Year" })
        .click();
      await expect(
        page.getByRole("button", { name: "Wed 10 Jun · 83 kg" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Chart values" }).click();
      await expect(
        page
          .getByRole("list", { name: "Chart values" })
          .getByRole("listitem")
          .filter({ hasText: /10 Jun/ }),
      ).toContainText("83 kg");
      // Weekly averages are the chart's other view now (Owner decision 4
      // after step 21), where they used to be a list of their own: the two
      // weigh-ins share the week of Mon 8 Jun.
      await page
        .getByRole("group", { name: "Chart" })
        .getByRole("button", { name: "Weekly average" })
        .click();
      await expect(
        page.getByRole("button", {
          name: /^Week of Mon 8 Jun · 82\.5 kg · 2\/7 days/,
        }),
      ).toBeVisible();
      await testInfo.attach(`weight-s19-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
      await page
        .getByRole("group", { name: "Chart" })
        .getByRole("button", { name: "Daily" })
        .click();

      // A range that excludes them draws none of them.
      await page
        .getByRole("group", { name: "Time range" })
        .getByRole("button", { name: "Week" })
        .click();
      await expect(
        page.getByRole("button", { name: /^Wed 10 Jun · / }),
      ).toHaveCount(0);

      // Body records its own weigh-ins, for today or any earlier date
      // (ADR-0032, which superseded ADR-0030's entry on Today).
      await page.getByRole("button", { name: "Add weigh-in" }).click();
      const entry = page.getByRole("dialog", { name: /weigh-in/ });
      await entry.getByRole("button", { name: "Choose date" }).click();
      const picker = page.getByRole("dialog", { name: "Choose date" });
      while (
        (await picker.getByRole("group", { name: "June 2026" }).count()) === 0
      )
        await picker.getByRole("button", { name: "Previous month" }).click();
      await picker.getByRole("button", { name: /^Sat 20 Jun/ }).click();
      await expect(picker).not.toBeAttached();
      await expect(
        entry.getByRole("button", { name: "Choose date" }),
      ).toContainText("20 Jun");
      await fillHydrated(entry.getByLabel("Weight (kg)"), "80.5");
      await runScreenAction(page, "Save weigh-in", entry);
      await expect(page.getByText("Weigh-in saved.")).toBeVisible();
      await expect(entry).not.toBeAttached();
      const created = page.getByRole("button", {
        name: /^Edit weigh-in Sat 20 Jun/,
      });
      await expect(created).toContainText("80.5 kg");
      await expect(created).toContainText("\u22122.5 kg");

      // A correction recalculates the change the weigh-in carries.
      await created.click();
      const edit = page.getByRole("dialog", { name: "Edit weigh-in" });
      await expect(edit.getByLabel("Weight (kg)")).toHaveValue("80.5");
      await fillHydrated(edit.getByLabel("Weight (kg)"), "79.5");
      await runScreenAction(page, "Save weigh-in", edit);
      await expect(edit).not.toBeAttached();
      await expect(created).toContainText("79.5 kg");
      await expect(created).toContainText("\u22123.5 kg");

      // Deleting returns to a recalculated S19. Step 20: the Actions panel's
      // pick-then-Continue is the confirmation, and no dialog asks again.
      await created.click();
      await runScreenAction(page, "Delete entry", edit);
      await expect(page.getByText("Weigh-in deleted.")).toBeVisible();
      await expect(created).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: /^Edit weigh-in .* Jun$/ }),
      ).toHaveCount(2);
      await testInfo.attach(`weight-s19-after-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // The screen reflows to the narrow end of the supported phone range.
      await page.setViewportSize({ width: 320, height: 720 });
      await expect(page.getByText("Trend", { exact: true })).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    } finally {
      await removeFixtures();
    }
  });
});

function adminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Local Supabase environment is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function seedWeighIns() {
  const client = adminClient();
  await removeFixtures();
  for (const [entryDate, weightKg] of [
    [seeded.first, 82],
    [seeded.second, 83],
  ] as const) {
    const { error } = await client.rpc("create_weight_entry", {
      p_entry_date: entryDate,
      p_weight_kg: weightKg,
    });
    if (error) throw error;
  }
}

async function removeFixtures() {
  const client = adminClient();
  const { error } = await client
    .from("weight_entries")
    .delete()
    .gte("entry_date", fixtureFrom)
    .lte("entry_date", fixtureTo);
  if (error) throw error;
}
