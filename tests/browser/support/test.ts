import { test as base, type Page } from "@playwright/test";

export { expect } from "@playwright/test";

/*
 * A full load of a production page streams its screen in: React first writes
 * the resolved markup into a hidden holding element (`<div hidden id="S:0">`)
 * and moves it into place a moment later. For that moment every text on the
 * screen exists twice, once hidden, and a text locator fails its strict-mode
 * check. The page every spec receives therefore waits after `goto` and
 * `reload` until React has emptied those holding elements, so an assertion
 * reads the screen the phone user sees.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = (async (...args: Parameters<Page["goto"]>) => {
      const response = await goto(...args);
      await streamed(page);
      return response;
    }) as Page["goto"];
    page.reload = (async (...args: Parameters<Page["reload"]>) => {
      const response = await reload(...args);
      await streamed(page);
      return response;
    }) as Page["reload"];
    await provide(page);
  },
});

async function streamed(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.querySelector('div[hidden][id^="S:"]') === null,
  );
}
