import { expect, test } from "@playwright/test";
import { login } from "./helpers";
import { E2E_MFE } from "./target";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test(`mounts ${E2E_MFE.id} inside the shell`, async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto(`/dashboard/${E2E_MFE.id}`);
  const host = page.locator(`#mfe-host-${E2E_MFE.id}`);
  await expect(host).toBeVisible();
  // The MFE renders its own DOM into the host container.
  await expect(host.locator("*").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Invalid MFE host|Timeout waiting/)).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});
