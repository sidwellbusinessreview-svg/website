import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile-320", width: 320, height: 800 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 900 },
  { name: "desktop-1440", width: 1440, height: 1000 },
] as const;

test("homepage loads and main navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Sidwell Business Review home" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The New Economics of School Lunch", level: 1 }),
  ).toBeVisible();
  const primary = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(primary.getByRole("link", { name: "Issues" })).toHaveCount(0);
  await expect(primary.getByRole("link", { name: "Authors" })).toHaveCount(0);

  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Latest" })
    .click();
  await expect(page).toHaveURL(/\/latest$/);
  await expect(page.getByRole("heading", { name: "Latest articles" })).toBeVisible();
});

test("a guest cannot activate Draft Mode without a valid secret", async ({ page }) => {
  const response = await page.request.get("/api/draft-mode/enable");
  expect(response.status()).toBe(401);
  await page.goto("/");
  await expect(page.getByText("Previewing unpublished content")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test("removed issue routes use not-found behavior", async ({ page }) => {
  const response = await page.goto("/issues/spring-2026");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This story is not in our archive." })).toBeVisible();
});

test("article route loads", async ({ page }) => {
  await page.goto("/articles/the-new-economics-of-school-lunch");
  await expect(
    page.getByRole("heading", { name: "The New Economics of School Lunch" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Maya Chen" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Jonah Patel" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Maya Chen" })).toHaveCount(1);
  await expect(page.locator(".article-authors")).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Contributors" })).toHaveCount(0);
});

test("reader-facing Article dates use Month Year across discovery routes", async ({ page }) => {
  for (const path of ["/", "/latest", "/archive", "/search?q=Maya", "/authors/maya-chen", "/articles/the-new-economics-of-school-lunch"]) {
    await page.goto(path);
    const dates = await page.locator("time").allTextContents();
    expect(dates.length, `${path} should expose at least one Article date`).toBeGreaterThan(0);
    for (const date of dates) {
      expect(date).toMatch(/^[A-Z][a-z]+ \d{4}$/);
      expect(date).not.toMatch(/\b\d{1,2},\s+\d{4}$/);
    }
  }
});

test("author route loads", async ({ page }) => {
  await page.goto("/authors/maya-chen");
  await expect(page.getByText("Maya Chen", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Articles by Maya Chen" }),
  ).toBeVisible();
});

test("contributor profile is restrained and responsive without biography", async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/authors/maya-chen");
    await expect(page.getByRole("heading", { name: "Articles by Maya Chen" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Maya Chen", level: 1 })).toBeVisible();
    await expect(page.locator(".contributor-profile-header img")).toHaveCount(0);
    await expect(page.locator(".contributor-profile-header")).not.toContainText("MC");
    await expect(page.locator(".contributor-profile-header")).not.toContainText("covers markets");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  }
});

test("About contains staff sections and Masthead is removed", async ({ page }) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: "Serious curiosity, clearly expressed." }),
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "Editors-in-Chief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Editors", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Faculty Adviser" })).toBeVisible();
  await expect(page.locator(".about-staff-grid img")).toHaveCount(0);
  await expect(page.locator(".about-staff-avatar, .author-avatar")).toHaveCount(0);
  const response = await page.goto("/masthead");
  expect(response?.status()).toBe(404);
});

for (const studioRoute of ["/studio", "/studio/structure"] as const) {
  test(`${studioRoute} is handled by the optional Studio catch-all`, async ({ page }) => {
    const response = await page.goto(studioRoute);
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title).toBe("Sidwell Business Review Studio | Sidwell Business Review");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
    await expect(page.locator("html")).not.toContainText("setuprequired");
    await expect(page.locator("header.site-header")).toHaveCount(0);
    await expect(page.locator("footer.site-footer")).toHaveCount(0);
  });
}

test("search route loads", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
  const search = page.getByLabel("Search the Review");
  await search.fill("Maya Chen");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=Maya\+Chen$/);
  await expect(
    page.getByRole("heading", { name: "Reading the Fed Without Reading Tea Leaves" }),
  ).toBeVisible();
});

test("search displays a no-results state", async ({ page }) => {
  await page.goto("/search?q=volcanology");
  await expect(
    page.getByRole("heading", { name: "No results for “volcanology”" }),
  ).toBeVisible();
});

test("archive filters published articles", async ({ page }) => {
  await page.goto("/archive");
  await page.getByLabel("Contributor").selectOption("maya-chen");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/contributor=maya-chen/);
  await expect(
    page.getByRole("heading", { name: "Reading the Fed Without Reading Tea Leaves" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Small Businesses, Big Rates" }),
  ).toHaveCount(0);
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

for (const viewport of viewports) {
  test(`homepage and article fit at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const route of [
      "/",
      "/articles/semiconductors-and-the-geography-of-risk",
    ]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowingElements: [...document.querySelectorAll<HTMLElement>("body *")]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
          })
          .slice(0, 8)
          .map((element) => ({
            selector: `${element.tagName.toLowerCase()}.${element.className}`,
            left: Math.round(element.getBoundingClientRect().left),
            right: Math.round(element.getBoundingClientRect().right),
          })),
      }));
      expect(
        dimensions.scrollWidth,
        `${route} overflowed at ${viewport.name}: ${JSON.stringify(dimensions.overflowingElements)}`,
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    }
  });
}

test("captures targeted editorial screenshots", async ({
  page,
}, testInfo) => {
  const captures = [
    { route: "/", name: "homepage-desktop", width: 1440, height: 1000 },
    {
      route: "/articles/semiconductors-and-the-geography-of-risk",
      name: "article-desktop",
      width: 1440,
      height: 1000,
    },
    { route: "/", name: "homepage-mobile", width: 375, height: 812 },
    {
      route: "/articles/semiconductors-and-the-geography-of-risk",
      name: "article-mobile",
      width: 375,
      height: 812,
    },
    { route: "/authors/maya-chen", name: "contributor-desktop", width: 1440, height: 1000 },
    { route: "/authors/maya-chen", name: "contributor-mobile", width: 375, height: 812 },
    { route: "/about", name: "about-desktop", width: 1440, height: 1000 },
    { route: "/about", name: "about-mobile", width: 375, height: 812 },
  ];

  for (const capture of captures) {
    await page.setViewportSize(capture);
    await page.goto(capture.route);
    await page.screenshot({
      path: testInfo.outputPath(`${capture.name}.png`),
      fullPage: true,
    });
  }
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

test("mobile navigation opens from the keyboard and exposes its links", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const summary = page.locator("summary");
  await expect(summary).toBeVisible();
  await summary.press("Enter");
  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(mobileNavigation.getByRole("link", { name: "Latest" })).toBeFocused();
});

test("article images have non-empty alternative text", async ({ page }) => {
  await page.goto("/articles/what-metro-ridership-can-tell-us");
  const invalidImages = await page.locator("img").evaluateAll((images) =>
    images.filter((image) => !image.hasAttribute("alt") || image.getAttribute("alt")?.trim() === "").length,
  );
  expect(invalidImages).toBe(0);
});

test("article print layout keeps editorial content and hides navigation", async ({
  page,
}) => {
  await page.goto("/articles/the-new-economics-of-school-lunch");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "The New Economics of School Lunch" }),
  ).toBeVisible();
  await expect(page.getByText("Every lunch menu reflects")).toBeVisible();
});

for (const route of [
  "/",
  "/articles/the-new-economics-of-school-lunch",
  "/search?q=Maya%20Chen",
  "/authors/maya-chen",
  "/about",
  "/archive",
]) {
  test(`has no automated axe violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
