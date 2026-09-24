import { test, expect } from "@playwright/test";

test("real Stockfish game, review, PGN export and saved history", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Play fast. Think after." }),
  ).toBeVisible();
  await expect(page.locator("[data-square]")).toHaveCount(64);
  await page.screenshot({
    path: "test-results/setup-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.locator("#status")).toHaveText("Your move", {
    timeout: 20000,
  });
  await expect(
    page.getByRole("button", { name: "Analyze full game" }),
  ).toHaveCount(0);
  await page.locator('[data-square="e2"]').click();
  await expect(page.locator('[data-square="e4"]')).toHaveAttribute(
    "aria-label",
    /legal destination/,
  );
  await page.locator('[data-square="e4"]').click();
  await expect(page.locator(".move")).toHaveCount(2, { timeout: 15000 });
  await expect(page.locator("#status")).toContainText("Your move");
  // Confirm original artwork loads, not just board containers.
  expect(
    await page
      .locator(".square img")
      .evaluateAll((images) =>
        images.every((img) => img.complete && img.naturalWidth > 0),
      ),
  ).toBe(true);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Resign game" }).click();
  await expect(
    page.getByRole("heading", { name: "Black wins." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Analyze full game" }).click();
  await expect(page.locator(".eval-chart")).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".move-tag")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Starting position", exact: true })
    .click();
  await expect(page.locator('[data-square="e2"] img')).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-square="e4"] img')).toBeVisible();
  await expect(page.locator(".review-detail")).toContainText("Engine’s choice");
  await page.screenshot({
    path: "test-results/review-desktop.png",
    fullPage: true,
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PGN" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pgn$/);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lschess.games.v1")),
  );
  expect(stored[0].analysis.positions).toHaveLength(3);
  expect(stored[0].pgn).toContain('[Result "0-1"]');
  await page.getByRole("button", { name: "New game" }).click();
  await page.reload();
  await page.locator(".archive-item").first().click();
  await expect(page.locator(".eval-chart")).toBeVisible();
  expect(errors).toEqual([]);
});

test("playing Black starts engine move; flipping does not change position; mobile fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/setup-mobile.png",
    fullPage: true,
  });
  await page.locator("#color").selectOption("b");
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.locator(".move")).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator("[data-square]").first()).toHaveAttribute(
    "data-square",
    "h1",
  );
  await page.getByRole("button", { name: "Flip board" }).click();
  await expect(page.locator("[data-square]").first()).toHaveAttribute(
    "data-square",
    "a8",
  );
  await expect(page.locator(".move")).toHaveCount(1);
  await expect(page.locator('[data-clock="b"]')).toHaveClass(/active/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("engine load failure is visible and clocks never start", async ({
  page,
}) => {
  await page.route("**/engine/*.js", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.getByRole("alert")).toContainText("could not load", {
    timeout: 20000,
  });
  await expect(page.locator('[data-clock="w"]')).toHaveText("3:00");
  await expect(
    page.getByRole("button", { name: "Start a game" }),
  ).toBeEnabled();
});

test("late engine results cannot enter a new game after resignation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.locator("#status")).toHaveText("Your move", {
    timeout: 20000,
  });
  await page.locator('[data-square="e2"]').click();
  await page.locator('[data-square="e4"]').click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Resign game" }).click();
  await page.getByRole("button", { name: "New game" }).click();
  await expect(page.locator('[data-square="e2"] img')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start a game" }),
  ).toBeVisible();
});
