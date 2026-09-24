import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { runScreenAction } from "./support/actions";
import { fillHydrated } from "./support/hydration";
import { expect, test } from "./support/test";

// Measurement types are unique by name and their entries unique per date, so
// this suite owns suffixed names and dates in a fixed past month, and removes
// both again. The spare type and the third entry are created through the
// screens themselves.
const stamp = randomUUID().slice(0, 8);
const waist = `T-042 Waist ${stamp}`;
const spare = `T-042 Spare ${stamp}`;
const seededDates = ["2026-05-04", "2026-05-18"];

test.describe("Body experience", () => {
  test("covers S21, S22, S23, and S24 create, edit, and delete", async ({
    page,
  }, testInfo) => {
    await seedMeasurements();

    try {
      // S22 creates a measurement from the tab itself, in Body's entry panel
      // (step 20); the old /body/measurements/types/new route is gone.
      await page.goto("/body/measurements");
      await page.getByRole("button", { name: "Add measurement" }).click();
      const addType = page.getByRole("dialog", { name: "Add measurement" });
      await expect(addType.getByText("Recorded in centimetres.")).toBeVisible();
      await fillHydrated(addType.getByLabel("Measurement name"), spare);
      await runScreenAction(page, "Add measurement", addType);
      await expect(page.getByText("Measurement added.")).toBeVisible();
      await expect(addType).not.toBeAttached();
      await expect(
        page.getByRole("link", { name: new RegExp(spare) }),
      ).toContainText("No measurement recorded yet");

      // S21 lists the measurement with its latest value and change, and offers
      // no archived state: ADR-0024 removed it.
      const row = page.getByRole("link", { name: new RegExp(waist) });
      await expect(row).toBeVisible();
      await expect(row).toContainText("84.5 cm");
      await expect(row).toContainText("\u22120.5 cm");
      await expect(page.getByText(/neither good nor bad/)).toBeVisible();
      await expect(page.getByText(/Archived/i)).toHaveCount(0);
      await testInfo.attach(`body-s21-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // S23 shows the latest value with its change, and its chart is never
      // the only representation of the data: every bar is a named button, and
      // the entry list under it states each value (step 19, ADR-0033).
      await row.click();
      await expect(page).toHaveURL(/\/body\/measurements\/[0-9a-f-]+$/);
      await expect(page.getByText("Latest", { exact: true })).toBeVisible();
      await expect(
        page.getByText(
          "Mon 18 May \u00b7 \u22120.5 cm since the previous entry",
        ),
      ).toBeVisible();
      // Owner decision 5 after step 21: the ranges run week to year and open
      // on the quarter, which holds none of these May entries.
      await page
        .getByRole("group", { name: "Time range" })
        .getByRole("button", { name: "Year" })
        .click();
      await expect(page.getByText(/^2 entries in range/)).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Mon 4 May \u00b7 85 cm" }),
      ).toBeVisible();
      await testInfo.attach(`body-s23-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });

      // A range that excludes the entries says so instead of drawing nothing.
      await page
        .getByRole("group", { name: "Time range" })
        .getByRole("button", { name: "Month" })
        .click();
      await expect(
        page.getByText(/No entry falls inside this range/),
      ).toBeVisible();
      await page
        .getByRole("group", { name: "Time range" })
        .getByRole("button", { name: "Year" })
        .click();

      // S24 records an entry for an earlier date from Body itself (ADR-0032,
      // superseding ADR-0030's entry on Today). The unit is the field's label.
      await page.getByRole("button", { name: "Record measurement" }).click();
      const record = page.getByRole("dialog", { name: "Record measurement" });
      await record.getByRole("button", { name: "Choose date" }).click();
      const picker = page.getByRole("dialog", { name: "Choose date" });
      while (
        (await picker.getByRole("group", { name: "May 2026" }).count()) === 0
      )
        await picker.getByRole("button", { name: "Previous month" }).click();
      await picker.getByRole("button", { name: /^Mon 25 May/ }).click();
      await expect(picker).not.toBeAttached();
      await fillHydrated(record.getByLabel("Measurement (cm)"), "84");
      await runScreenAction(page, "Save entry", record);
      await expect(page.getByText("Measurement saved.")).toBeVisible();
      await expect(record).not.toBeAttached();
      const created = page.getByRole("button", {
        name: /^Edit entry Mon 25 May/,
      });
      await expect(created).toContainText("84 cm");
      await expect(created).toContainText("\u22120.5 cm");

      // A correction and a deletion both return to a recalculated S23.
      await created.click();
      const edit = page.getByRole("dialog", { name: "Edit entry" });
      await expect(edit.getByLabel("Measurement (cm)")).toHaveValue("84");
      await fillHydrated(edit.getByLabel("Measurement (cm)"), "83.5");
      await runScreenAction(page, "Save entry", edit);
      await expect(edit).not.toBeAttached();
      await expect(created).toContainText("83.5 cm");
      await expect(created).toContainText("\u22121.0 cm");

      // Step 20: the Actions panel's pick-then-Continue is the confirmation.
      await created.click();
      await runScreenAction(page, "Delete entry", edit);
      await expect(page.getByText("Entry deleted.")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^Edit entry / }),
      ).toHaveCount(2);

      // S22 renames the measurement and keeps everything recorded for it. It
      // offers the deletion while entries exist and the server refuses it
      // with MVP-BOD-001's reason (step 20), where the old form hid it.
      await page.getByRole("button", { name: "Edit measurement" }).click();
      const type = page.getByRole("dialog", { name: "Edit measurement" });
      await expect(type.getByText(/Archive/i)).toHaveCount(0);
      await runScreenAction(page, "Delete measurement", type);
      await expect(
        page.getByText(/This measurement has entries/).first(),
      ).toBeVisible();
      await expect(type).toBeVisible();
      await testInfo.attach(`body-s22-${testInfo.project.name}.png`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png",
      });
      await fillHydrated(
        type.getByLabel("Measurement name"),
        `${waist} at navel`,
      );
      await runScreenAction(page, "Save changes", type);
      await expect(page.getByText("Measurement renamed.")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^Edit entry / }),
      ).toHaveCount(2);
      await page.getByRole("link", { name: "Back" }).click();
      await expect(page).toHaveURL(/\/body\/measurements$/);
      await expect(
        page.getByRole("link", { name: new RegExp(`${waist} at navel`) }),
      ).toContainText("84.5 cm");

      // A measurement with nothing recorded can be deleted.
      await page.getByRole("link", { name: new RegExp(spare) }).click();
      await page.getByRole("button", { name: "Edit measurement" }).click();
      await runScreenAction(
        page,
        "Delete measurement",
        page.getByRole("dialog", { name: "Edit measurement" }),
      );
      await expect(page.getByText("Measurement deleted.")).toBeVisible();
      await expect(page).toHaveURL(/\/body\/measurements$/);
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
        page.getByRole("link", { name: new RegExp(`${waist} at navel`) }),
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
