import { defineConfig, devices } from "@playwright/test";

// The production server verifies what the phone user gets. The T-008 durability
// harness is production-hidden by design (active-workout-durability.md), so its
// spec alone runs against a development server started beside it.
const productionServer = "http://127.0.0.1:3100";
const developmentServer = "http://127.0.0.1:3101";
const durabilitySpec = /active-workout-durability\.spec\.ts$/;

const chromium = { ...devices["Pixel 5"], deviceScaleFactor: 3 };
const webkit = { ...devices["iPhone 13"], deviceScaleFactor: 3 };

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  reporter: [["line"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-chromium",
      testIgnore: durabilitySpec,
      use: { ...chromium, baseURL: productionServer },
    },
    {
      name: "mobile-webkit",
      testIgnore: durabilitySpec,
      use: { ...webkit, baseURL: productionServer },
    },
    {
      name: "durability-chromium",
      testMatch: durabilitySpec,
      use: { ...chromium, baseURL: developmentServer },
    },
    {
      name: "durability-webkit",
      testMatch: durabilitySpec,
      use: { ...webkit, baseURL: developmentServer },
    },
  ],
  webServer: [
    {
      command:
        "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
      url: `${productionServer}/today`,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3101",
      url: `${developmentServer}/test-support/active-workout-durability`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
