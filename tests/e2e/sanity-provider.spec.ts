import { expect, test } from "@playwright/test";

const fixtureValue = (name: string, fallback: string) => process.env[name]?.trim() || fallback;
const articleTitle = fixtureValue("CMS_TEST_ARTICLE_TITLE", "CMS Integration Test Article");
const articleSlug = fixtureValue("CMS_TEST_ARTICLE_SLUG", "cms-integration-test-article");
const contributorName = fixtureValue("CMS_TEST_CONTRIBUTOR_NAME", "CMS Integration Test Contributor");
const contributorSlug = fixtureValue("CMS_TEST_CONTRIBUTOR_SLUG", "cms-integration-test-contributor");
const localOnlyTitle = "The New Economics of School Lunch";
const localOnlySlug = "the-new-economics-of-school-lunch";
const draftOnlySlug = fixtureValue("CMS_TEST_DRAFT_ONLY_ARTICLE_SLUG", "preview-draft-article");

test.describe("Sanity-backed public routes", () => {
  test.skip(process.env.CONTENT_SOURCE !== "sanity", "Run with npm run test:e2e:sanity.");
  test("published CMS content flows through public discovery routes", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

    await page.goto("/");
    test.skip(await page.getByRole("heading", { name: articleTitle }).count() === 0, "The configurable published CMS Article fixture is not currently published; Article content must not be created or changed by this suite.");
    await expect(page.getByRole("heading", { name: articleTitle })).toBeVisible();
    await expect(page.getByText(localOnlyTitle)).toHaveCount(0);
    await expect(page.locator(`a[href="/articles/${draftOnlySlug}"]`)).toHaveCount(0);

    await page.getByRole("link", { name: articleTitle }).first().click();
    await expect(page).toHaveURL(`/articles/${articleSlug}`);
    await expect(page.getByRole("heading", { level: 1, name: articleTitle })).toBeVisible();
    await expect(page.getByRole("link", { name: contributorName })).toBeVisible();
    await expect(page.locator(".feature-figure")).toHaveCount(0);
    const bulletList = page.locator(".article-body ul").first();
    await expect(bulletList).toBeVisible();
    expect(await bulletList.locator(":scope > li").count()).toBeGreaterThan(0);
    const listStyle = await bulletList.evaluate((element) => {
      const style = getComputedStyle(element);
      return { type: style.listStyleType, paddingInlineStart: Number.parseFloat(style.paddingInlineStart) };
    });
    expect(listStyle.type).not.toBe("none");
    expect(listStyle.paddingInlineStart).toBeGreaterThan(0);
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);

    await page.getByRole("link", { name: contributorName }).click();
    await expect(page).toHaveURL(`/authors/${contributorSlug}`);
    await expect(page.getByRole("heading", { level: 1, name: contributorName })).toBeVisible();
    await expect(page.getByRole("link", { name: articleTitle, exact: true })).toBeVisible();

    await page.goto(`/search?q=${encodeURIComponent(articleTitle)}`);
    await expect(page.getByRole("link", { name: articleTitle, exact: true })).toBeVisible();

    await page.goto("/latest");
    await expect(page.getByRole("link", { name: articleTitle, exact: true })).toBeVisible();
    await page.goto("/archive");
    await expect(page.getByRole("link", { name: articleTitle, exact: true })).toBeVisible();

    const sitemap = await page.request.get("/sitemap.xml");
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain(`/articles/${articleSlug}`);
    expect(sitemapText).not.toContain(`/articles/${localOnlySlug}`);
    const feed = await page.request.get("/feed.xml");
    const feedText = await feed.text();
    expect(feedText).toContain(articleTitle);
    expect(feedText).not.toContain(localOnlyTitle);

    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Publication Settings supplies the public About page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
    await expect(page.getByRole("main").getByText(/student-run publication examining business/i)).toBeVisible();
  });

  test("local-only stories and drafts are not exposed by the CMS provider", async ({ page }) => {
    await page.goto(`/articles/${localOnlySlug}`);
    await expect(page.getByRole("heading", { name: "This story is not in our archive." })).toBeVisible({ timeout: 20_000 });
    await page.goto(`/articles/${draftOnlySlug}`);
    await expect(page.getByRole("heading", { name: "This story is not in our archive." })).toBeVisible({ timeout: 20_000 });
  });
});
