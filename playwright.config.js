import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: process.env.CI ? undefined : "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: process.env.TEST_PREVIEW
      ? "npm run preview -- --port 4173 --strictPort"
      : "npm run dev -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI && !process.env.TEST_PREVIEW,
  },
});
