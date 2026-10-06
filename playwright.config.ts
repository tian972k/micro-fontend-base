import { defineConfig, devices } from "@playwright/test";
import { E2E_MFE } from "./e2e/target";

const SHELL_URL = "http://localhost:8000";
const MFE_URL = `http://localhost:${E2E_MFE.port}`;

/**
 * End-to-end tests run against the real dev servers: the shell plus one
 * MFE from the registry (see e2e/target.ts; the others use the same
 * MfeHost / federation code path).
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
      command: `pnpm --filter ${E2E_MFE.id} dev`,
      url: MFE_URL,
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
