import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("redirects unauthenticated users to the login page", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("logs in and lands on the dashboard", async ({ page }) => {
  await login(page);
});
