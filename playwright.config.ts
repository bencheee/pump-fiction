import { defineConfig, devices } from "@playwright/test";

// The production server verifies what the phone user gets. Both test-support
// harnesses are hidden unless PF_ENABLE_TEST_SUPPORT is set (ADR-0029), so one
// production server with that flag serves the whole suite, the durability spec
// included.
const productionServer = "http://127.0.0.1:3100";

const chromium = { ...devices["Pixel 5"], deviceScaleFactor: 3 };
const webkit = { ...devices["iPhone 13"], deviceScaleFactor: 3 };

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  reporter: [["line"], ["html", { open: "never" }]],
  use: {
    baseURL: productionServer,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile-chromium", use: chromium },
    { name: "mobile-webkit", use: webkit },
  ],
  webServer: [
    {
      command:
        "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
      url: `${productionServer}/today`,
      env: { PF_ENABLE_TEST_SUPPORT: "1" },
      reuseExistingServer: false,
    },
  ],
});
