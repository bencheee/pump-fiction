import { expect, test } from "@playwright/test";

test.describe("mobile UI foundation", () => {
  test("main shell keeps four accessible destinations inside the fixed phone references", async ({
    page,
  }, testInfo) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 360, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/today");

      const navigation = page.getByRole("navigation", { name: "Primary" });
      const destinations = navigation.getByRole("link");
      await expect(destinations).toHaveCount(4);
      await expect(page.getByRole("link", { name: "Today" })).toHaveAttribute(
        "aria-current",
        "page",
      );

      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        devicePixelRatio: window.devicePixelRatio,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBe(geometry.clientWidth);
      expect(geometry.devicePixelRatio).toBe(3);

      for (const destination of await destinations.all()) {
        const box = await destination.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }

      await testInfo.attach(
        `main-shell-${testInfo.project.name}-${viewport.width}x${viewport.height}.png`,
        {
          body: await page.screenshot(),
          contentType: "image/png",
        },
      );
    }
  });

  test("focused workout shell removes primary navigation", async ({ page }) => {
    await page.goto("/workout/current");
    await expect(page.locator('[data-shell="focused"]')).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).not.toBeAttached();
  });

  test("Back dismisses the topmost sheet before its parent document", async ({
    page,
  }) => {
    await page.goto("/test-support/mobile-ui-foundation");
    await page.getByRole("button", { name: "Open sheet" }).click();
    await expect(
      page.getByRole("dialog", { name: "Choose an option" }),
    ).toBeVisible();

    await page.goBack();
    await expect(
      page.getByRole("dialog", { name: "Choose an option" }),
    ).not.toBeAttached();
    await expect(page).toHaveURL(/\/test-support\/mobile-ui-foundation$/);
  });

  test("destructive dialog starts on Cancel and restores its trigger", async ({
    page,
  }) => {
    await page.goto("/test-support/mobile-ui-foundation");
    const trigger = page.getByRole("button", {
      name: "Open destructive dialog",
    });
    await trigger.click();

    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
});
