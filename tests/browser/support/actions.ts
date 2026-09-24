import { expect, type Locator, type Page } from "@playwright/test";

import { awaitHydration } from "./hydration";

/*
 * A screen's own actions live in its Actions panel since steps 9 and 21 of
 * docs/design/redesign-v2/PLAN.md: the `···` pill opens it, a press picks an
 * entry and Continue runs it. The panel closes before the entry runs. A panel
 * that carries its own pill, such as Body's entry panel, passes itself as
 * `scope`.
 */
export async function runScreenAction(
  page: Page,
  entry: string | RegExp,
  scope?: Locator,
): Promise<void> {
  const panel = await openScreenActions(page, scope);
  await panel.getByRole("button", { name: entry, exact: true }).click();
  await panel.getByRole("button", { name: "Continue" }).click();
  await expect(panel).not.toBeAttached();
}

export async function openScreenActions(
  page: Page,
  scope?: Locator,
): Promise<Locator> {
  const trigger = (scope ?? page).getByRole("button", {
    name: "Actions",
    exact: true,
  });
  await awaitHydration(trigger);
  await trigger.click();
  const panel = page.getByRole("dialog", { name: "Actions" });
  await expect(panel).toBeVisible();
  return panel;
}
