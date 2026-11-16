import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("search jumps to an app", async ({ page }) => {
  const search = page.getByRole("combobox", { name: "Search apps and pages" });
  await search.fill("settings");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/dashboard\/settings$/);
});

test("settings switch theme and keep the language across reloads", async ({
  page,
}) => {
  await page.goto("/dashboard/settings");
  await page.waitForLoadState("networkidle");

  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("radio", { name: "Tiếng Việt" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cài đặt");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cài đặt");
});
