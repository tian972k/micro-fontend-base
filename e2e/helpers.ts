import { expect, type Page } from "@playwright/test";

export const DEMO_USER = { email: "demo@example.com", password: "demo1234" };

/** Log in through the real form. Waits for hydration before typing. */
export async function login(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator('input[name="email"]').fill(DEMO_USER.email);
  await page.locator('input[name="password"]').fill(DEMO_USER.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/);
}
