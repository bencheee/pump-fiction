import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test-support/active-workout-durability");
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase("pump-fiction-active-workout");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
  await page.reload();
});

test("keeps a failed command across reload and removes it only after acknowledgement", async ({
  page,
}) => {
  await page.evaluate(() => localStorage.setItem("delivery-mode", "retry"));
  await page.getByRole("button", { name: "Enqueue command" }).click();
  await expect(page.getByTestId("save-state")).toHaveText("save_failed");
  await expect(page.getByTestId("pending-count")).toHaveText("1");

  await page.evaluate(() =>
    localStorage.setItem("delivery-mode", "acknowledge"),
  );
  await page.reload();

  await expect(page.getByTestId("save-state")).toHaveText("saved");
  await expect(page.getByTestId("pending-count")).toHaveText("0");
});

test("replays pending commands in FIFO order", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("delivery-mode", "retry"));
  await page.getByRole("button", { name: "Enqueue command" }).click();
  await expect(page.getByTestId("save-state")).toHaveText("save_failed");
  await page.getByRole("button", { name: "Enqueue command" }).click();
  await expect(page.getByTestId("pending-count")).toHaveText("2");

  await page.evaluate(() =>
    localStorage.setItem("delivery-mode", "acknowledge"),
  );
  await page.getByRole("button", { name: "Retry delivery" }).click();
  await expect(page.getByTestId("save-state")).toHaveText("saved");

  const logs = await page.evaluate(() => ({
    enqueued: JSON.parse(localStorage.getItem("enqueued") ?? "[]") as string[],
    deliveries: JSON.parse(localStorage.getItem("deliveries") ?? "[]") as {
      commandId: string;
      mode: string;
    }[],
  }));
  const acknowledgedOrder = logs.deliveries
    .filter((delivery) => delivery.mode === "acknowledge")
    .map((delivery) => delivery.commandId);

  expect(acknowledgedOrder).toEqual(logs.enqueued);
});

test("retains a conflicting command and exposes refresh-and-replay recovery", async ({
  page,
}) => {
  await page.evaluate(() => localStorage.setItem("delivery-mode", "conflict"));
  await page.getByRole("button", { name: "Enqueue command" }).click();

  await expect(page.getByTestId("save-state")).toHaveText("save_failed");
  await expect(page.getByTestId("pending-count")).toHaveText("1");
  await expect(page.getByTestId("recovery")).toHaveText("refresh_and_replay");
});
