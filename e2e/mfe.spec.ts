import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("mounts the React micro-frontend inside the shell", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/dashboard/app-react");
  const host = page.locator("#mfe-host-app-react");
  await expect(host).toBeVisible();
  // The MFE renders its own DOM into the host container.
  await expect(host.locator("*").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Invalid MFE host|Timeout waiting/)).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});
