import { test, expect } from "@playwright/test";

// A deterministic UCI test double exercises UI edge cases; app.spec.js uses real WASM.
async function scriptedEngine(page, moves = []) {
  await page.addInitScript(
    ({ moves }) => {
      window.Worker = class {
        constructor() {
          this.index = 0;
          this.stopped = false;
        }
        postMessage(command) {
          let response;
          if (command === "uci") response = "uciok";
          else if (command === "isready") response = "readyok";
          else if (command.startsWith("go "))
            response = `bestmove ${moves[this.index++] || "e7e5"}`;
          if (response)
            setTimeout(() => {
              if (!this.stopped) this.onmessage?.({ data: response });
            }, 30);
        }
        terminate() {
          this.stopped = true;
        }
      };
    },
    { moves },
  );
}

test("promotion chooser offers underpromotion and traps keyboard focus", async ({
  page,
}) => {
  await scriptedEngine(page, ["h7h5", "h5h4", "h4h3", "h3g2", "g2h1q"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Start a game" }).click();
  for (const [from, to] of [
    ["a2", "a4"],
    ["a4", "a5"],
    ["a5", "a6"],
    ["a6", "b7"],
  ]) {
    await expect(page.locator("#status")).toHaveText("Your move");
    await page.locator(`[data-square="${from}"]`).click();
    await page.locator(`[data-square="${to}"]`).click();
  }
  await expect(page.locator("#status")).toHaveText("Your move");
  await page.locator('[data-square="b7"]').click();
  await page.locator('[data-square="a8"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("[data-promote]")).toHaveCount(4);
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Promote to knight" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator('[data-square="a8"]')).toHaveAttribute(
    "aria-label",
    "a8 White knight",
  );
  await expect(page.locator(".moves")).toContainText("bxa8=N");
});

test("flag fall unlocks review and rejects further moves", async ({ page }) => {
  await scriptedEngine(page);
  await page.goto("/");
  await page.locator("#time").selectOption("1+0");
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.locator("#status")).toHaveText("Your move");
  await page.evaluate(() => {
    const now = Date.now();
    Date.now = () => now + 61000;
  });
  await expect(
    page.getByRole("heading", { name: "Black wins." }),
  ).toBeVisible();
  await expect(page.locator('[data-clock="w"]')).toHaveText("0:00");
  await page.locator('[data-square="e2"]').click();
  await page.locator('[data-square="e4"]').click();
  await expect(page.locator('[data-square="e2"] img')).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Analyze full game" }),
  ).toBeDisabled();
});

test("canceling analysis allows a clean new engine session", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.locator("#status")).toHaveText("Your move", {
    timeout: 20000,
  });
  await page.locator('[data-square="e2"]').click();
  await page.locator('[data-square="e4"]').click();
  await expect(page.locator(".move")).toHaveCount(2);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Resign game" }).click();
  await page.getByRole("button", { name: "Analyze full game" }).click();
  await page.getByRole("button", { name: "New game" }).click();
  await page.getByRole("button", { name: "Start a game" }).click();
  await expect(page.locator("#status")).toHaveText("Your move", {
    timeout: 20000,
  });
  await expect(page.locator(".move")).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
