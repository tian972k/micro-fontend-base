import { defineConfig, devices } from "@playwright/test";

const SHELL_URL = "http://localhost:8000";
const REACT_URL = "http://localhost:8001";

/**
 * End-to-end tests run against the real dev servers: the shell plus the
 * React MFE (the other MFEs are covered by the same MfeHost code path).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: SHELL_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter app-react dev",
      url: REACT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter shell dev",
      url: SHELL_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
