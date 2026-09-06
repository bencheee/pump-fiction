import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { fillHydrated } from "./support/hydration";

// Weigh-ins are unique per local date, so the fixtures sit in a fixed past
// month this suite owns end to end, and it removes that month again. Nothing
// touches today, which may hold a real weigh-in.
const seeded = { first: "2026-06-08", second: "2026-06-10" };
const created = "2026-06-20";
const fixtureFrom = "2026-06-01";
const fixtureTo = "2026-06-30";

test.describe("Weight experience", () => {
  test("covers S19 summaries, the chart, and S20 create, edit, and delete", async ({
    page,
  }, testInfo) => {
    await seedWeighIns();

    try {
      // S19 lists the seeded weigh-ins newest first, each with its change.
      await page.goto("/history/weight");
      const entries = page.getByRole("list", { name: "Weigh-ins" });
      await expect(entries.getByRole("link")).toHaveCount(2);
      const newest = entries.getByRole("link").first();
      await expect(newest).toContainText("83 kg");
      await expect(newest).toContainText("+1.0 kg");

      // The chart is never the only representation of its data, and its two
      // series are named rather than distinguished by color alone.
      await page.getByRole("button", { name: "Year" }).click();
      await expect(
        page.getByText(/2 weigh-ins from 82 kg to 83 kg/),
      ).toBeVisible();
      const legend = page.getByRole("list", { name: "Chart legend" });
      await expect(legend.getByText("Weight, solid line")).toBeVisible();
      await expect(
        legend.getByText("Weekly average, dashed line"),
      ).toBeVisible();
      await page.getByText("Chart values").click();
      await expect(
        page.getByRole("list", { name: "Chart values" }).getByText("83 kg"),
      ).toBeVisible();
      await expect(
        page
          .getByRole("list", { name: "Weekly averages" })
          .getByText(/Week of/),
      ).toBeVisible();
      await testInfo.attach(`weight-s19-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // A range that excludes them says so instead of drawing an empty chart.
      await page.getByRole("button", { name: "Week" }).click();
      await expect(
        page.getByText(/No weigh-in falls inside this range/),
      ).toBeVisible();

      // S20 creates a retrospective weigh-in and returns to S19 recalculated.
      await page.getByRole("link", { name: "Add weigh-in" }).click();
      await expect(page).toHaveURL(/\/history\/weight\/new$/);
      await testInfo.attach(`weight-s20-new-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
      await page.getByLabel("Date").fill(created);
      await fillHydrated(page.getByLabel("Weight (kg)"), "80.5");
      await page.getByRole("button", { name: "Save Weight" }).click();
      await expect(page).toHaveURL(/\/history\/weight$/);
      await expect(
        page.getByRole("list", { name: "Weigh-ins" }).getByRole("link"),
      ).toHaveCount(3);
      await expect(
        page.getByRole("list", { name: "Weigh-ins" }).getByRole("link").first(),
      ).toContainText("80.5 kg");

      // The database owns per-date uniqueness, and it reaches the date field.
      await page.getByRole("link", { name: "Add weigh-in" }).click();
      await page.getByLabel("Date").fill(created);
      await fillHydrated(page.getByLabel("Weight (kg)"), "79");
      await page.getByRole("button", { name: "Save Weight" }).click();
      await expect(
        page.getByText("That date already has a weigh-in."),
      ).toBeVisible();
      await expect(page.getByLabel("Weight (kg)")).toHaveValue("79");
      await testInfo.attach(`weight-s20-refused-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // A correction recalculates the change the next weigh-in carries.
      await page.goto(`/history/weight/${created}/edit`);
      await fillHydrated(page.getByLabel("Weight (kg)"), "79.5");
      await expect(page.getByText("Unsaved changes")).toBeVisible();
      await page.getByRole("button", { name: "Save Weight" }).click();
      await expect(page).toHaveURL(/\/history\/weight$/);
      await expect(
        page.getByRole("list", { name: "Weigh-ins" }).getByRole("link").first(),
      ).toContainText("79.5 kg");

      // Deleting asks first and returns to a recalculated S19.
      await page.goto(`/history/weight/${created}/edit`);
      await page.getByRole("button", { name: "Delete Entry" }).click();
      await expect(page.getByText("Delete this weigh-in?")).toBeVisible();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete Entry" })
        .click();
      await expect(page).toHaveURL(/\/history\/weight$/);
      await expect(
        page.getByRole("list", { name: "Weigh-ins" }).getByRole("link"),
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
