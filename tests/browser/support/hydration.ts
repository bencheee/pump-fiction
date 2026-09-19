import { expect, type Locator, type Page } from "@playwright/test";

// A production page can finish loading before React hydrates it. A value typed
// into a controlled field before that point never reaches React, which then
// renders its own empty state over it; a click lands on a button without its
// handler. WebKit shows this on the first entry after a full navigation, so
// that entry waits until React has attached its props to the element.
export async function awaitHydration(target: Locator): Promise<void> {
  await expect
    .poll(
      () =>
        target.evaluate((node) =>
          Object.keys(node).some((key) => key.startsWith("__reactProps$")),
        ),
      { message: "React has hydrated the element" },
    )
    .toBe(true);
}

export async function fillHydrated(
  field: Locator,
  value: string,
): Promise<void> {
  await awaitHydration(field);
  await field.fill(value);
}

/**
 * Screen-level actions live behind the `···` panel: one is picked there and
 * Continue commits it. Every definition screen and the workout detail use it.
 */
export async function runScreenAction(
  page: Page,
  trigger: string,
  action: string | RegExp,
): Promise<void> {
  await page.getByRole("button", { name: trigger }).click();
  await page.getByRole("button", { name: action }).click();
  await page.getByRole("button", { name: "Continue" }).click();
}
