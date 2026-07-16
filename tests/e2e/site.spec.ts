import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage loads and main navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Sidwell Business Review home" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The New Economics of School Lunch" }),
  ).toBeVisible();

  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Latest" })
    .click();
  await expect(page).toHaveURL(/\/latest$/);
  await expect(page.getByRole("heading", { name: "Latest articles" })).toBeVisible();
});

test("article route loads", async ({ page }) => {
  await page.goto("/articles/the-new-economics-of-school-lunch");
  await expect(
    page.getByRole("heading", { name: "The New Economics of School Lunch" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Maya Chen" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Jonah Patel" }).first()).toBeVisible();
});

test("issue route loads", async ({ page }) => {
  await page.goto("/issues/spring-2026");
  await expect(page.getByRole("heading", { name: "The Resilience Issue" })).toBeVisible();
  await expect(page.getByText("From the editors")).toBeVisible();
});

test("author route loads", async ({ page }) => {
  await page.goto("/authors/maya-chen");
  await expect(page.getByText("Maya Chen", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Articles by Maya Chen" }),
  ).toBeVisible();
});

test("about and masthead routes load", async ({ page }) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: "Serious curiosity, clearly expressed." }),
  ).toBeVisible();

  await page.goto("/masthead");
  await expect(page.getByRole("heading", { name: "Masthead" })).toBeVisible();
  await expect(page.getByText("Faculty adviser")).toBeVisible();
});

test("search route loads", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
  await expect(page.getByLabel("Search the Review")).toBeDisabled();
});

test("invalid route shows the custom not-found page", async ({ page }) => {
  const response = await page.goto("/not-a-real-sbr-route");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This story is not in our archive." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});

test("mobile layout has no obvious horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/articles/semiconductors-and-the-geography-of-risk");
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasOverflow).toBe(false);
});

test("keyboard navigation exposes the skip link and moves to main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});

for (const route of ["/", "/articles/the-new-economics-of-school-lunch"]) {
  test(`has no serious or critical axe violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );
    expect(blocking).toEqual([]);
  });
}
