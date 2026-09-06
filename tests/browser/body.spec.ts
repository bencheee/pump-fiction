import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { fillHydrated } from "./support/hydration";

// Measurement types are unique by name and their entries unique per date, so
// this suite owns suffixed names and dates in a fixed past month, and removes
// both again.
const stamp = randomUUID().slice(0, 8);
const waist = `T-042 Waist ${stamp}`;
const spare = `T-042 Spare ${stamp}`;
const seededDates = ["2026-05-04", "2026-05-18"];
const created = "2026-05-25";

test.describe("Body experience", () => {
  test("covers S21, S22, S23, and S24 create, edit, and delete", async ({
    page,
  }, testInfo) => {
    await seedMeasurements();

    try {
      // S21 lists the measurement with its latest value and change, and offers
      // no archived state: ADR-0024 removed it.
      await page.goto("/history/body");
      const list = page.getByRole("list", { name: "Measurements" });
      const row = list.getByRole("link", { name: new RegExp(waist) });
      await expect(row).toBeVisible();
      await expect(row).toContainText("84.5 cm");
      await expect(row).toContainText("−0.5 cm");
      await expect(page.getByText(/neither good nor bad/)).toBeVisible();
      await expect(page.getByText(/Archived/i)).toHaveCount(0);
      await testInfo.attach(`body-s21-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // S23 shows the latest value and both changes, and its chart is never the
      // only representation of the data.
      await row.click();
      await expect(page).toHaveURL(/\/history\/body\/[0-9a-f-]+$/);
      for (const label of ["Latest", "Latest change", "Total change"])
        await expect(page.getByText(label, { exact: true })).toBeVisible();
      await expect(
        page.getByText(/2 entries from 85 cm to 84.5 cm/),
      ).toBeVisible();
      await page.getByText("Chart values").click();
      await expect(
        page.getByRole("list", { name: "Chart values" }).getByText("85 cm"),
      ).toBeVisible();
      await testInfo.attach(`body-s23-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // A range that excludes the entries says so instead of drawing nothing.
      await page.getByRole("button", { name: "Month" }).click();
      await expect(
        page.getByText(/No entry falls inside this range/),
      ).toBeVisible();
      await page.getByRole("button", { name: "All" }).click();

      // S24 records a retrospective measurement and returns recalculated.
      await page.getByRole("link", { name: "Add entry" }).click();
      await page.getByLabel("Date").fill(created);
      await fillHydrated(page.getByLabel("Measurement (cm)"), "84");
      await page.getByRole("button", { name: "Save Entry" }).click();
      await expect(page).toHaveURL(/\/history\/body\/[0-9a-f-]+$/);
      await expect(
        page.getByRole("list", { name: "Entries" }).getByRole("link"),
      ).toHaveCount(3);
      await expect(page.getByText("−1.0 cm")).toBeVisible();

      // The database owns per-type-and-date uniqueness.
      await page.getByRole("link", { name: "Add entry" }).click();
      await page.getByLabel("Date").fill(created);
      await fillHydrated(page.getByLabel("Measurement (cm)"), "83");
      await page.getByRole("button", { name: "Save Entry" }).click();
      await expect(
        page.getByText("That date already has a measurement."),
      ).toBeVisible();
      await page.goBack();

      // A correction and a deletion both return to a recalculated S23.
      await page
        .getByRole("list", { name: "Entries" })
        .getByRole("link")
        .first()
        .click();
      await expect(page).toHaveURL(/\/edit$/);
      await fillHydrated(page.getByLabel("Measurement (cm)"), "83.5");
      await expect(page.getByText("Unsaved changes")).toBeVisible();
      await page.getByRole("button", { name: "Save Entry" }).click();
      await expect(page.getByText("83.5 cm").first()).toBeVisible();

      await page
        .getByRole("list", { name: "Entries" })
        .getByRole("link")
        .first()
        .click();
      await page.getByRole("button", { name: "Delete Entry" }).click();
      await expect(page.getByText("Delete this entry?")).toBeVisible();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete Entry" })
        .click();
      await expect(
        page.getByRole("list", { name: "Entries" }).getByRole("link"),
      ).toHaveCount(2);

      // S22 renames the measurement and keeps everything recorded for it, and
      // refuses to delete it while those entries exist.
      await page.getByRole("link", { name: "Edit measurement" }).click();
      await expect(page).toHaveURL(/\/history\/body\/types\/[0-9a-f-]+\/edit$/);
      await expect(page.getByText("2 measurements recorded")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Delete Measurement" }),
      ).toHaveCount(0);
      await testInfo.attach(`body-s22-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
      await fillHydrated(page.getByLabel("Name"), `${waist} at navel`);
      await page.getByRole("button", { name: "Save Measurement" }).click();
      await expect(page).toHaveURL(/\/history\/body$/);
      await expect(
        page.getByRole("link", { name: new RegExp(`${waist} at navel`) }),
      ).toContainText("84.5 cm");

      // A measurement with nothing recorded can be deleted.
      await page.getByRole("link", { name: new RegExp(spare) }).click();
      await page.getByRole("link", { name: "Edit measurement" }).click();
      await page.getByRole("button", { name: "Delete Measurement" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete Measurement" })
        .click();
      await expect(page).toHaveURL(/\/history\/body$/);
      await expect(
        page.getByRole("link", { name: new RegExp(spare) }),
      ).toHaveCount(0);
      await testInfo.attach(`body-s21-after-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // The list reflows to the narrow end of the supported phone range.
      await page.setViewportSize({ width: 320, height: 720 });
      await expect(
        page.getByText("Body", { exact: true }).first(),
      ).toBeVisible();
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

async function seedMeasurements() {
  const client = adminClient();
  await removeFixtures();
  const { data, error } = await client.rpc("create_measurement_type", {
    p_name: waist,
  });
  if (error) throw error;
  const typeId = (data as { id: string }).id;
  for (const [index, entryDate] of seededDates.entries()) {
    const { error: entryError } = await client.rpc("create_measurement_entry", {
      p_measurement_type_id: typeId,
      p_entry_date: entryDate,
      p_value_cm: index === 0 ? 85 : 84.5,
    });
    if (entryError) throw entryError;
  }
  const { error: spareError } = await client.rpc("create_measurement_type", {
    p_name: spare,
  });
  if (spareError) throw spareError;
}

async function removeFixtures() {
  const client = adminClient();
  const { data } = await client
    .from("measurement_types")
    .select("id")
    .like("name", `T-042 %${stamp}%`);
  const ids = (data ?? []).map((row) => row.id as string);
  if (ids.length > 0) {
    await client
      .from("measurement_entries")
      .delete()
      .in("measurement_type_id", ids);
    await client.from("measurement_types").delete().in("id", ids);
  }
}
