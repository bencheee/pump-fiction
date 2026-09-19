import { expect, type Locator } from "@playwright/test";

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
