import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const articleCss = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

for (const width of [1440, 375, 320]) test(`multi-digit Notes remain semantic and fit a ${width}px reader viewport`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const references = Array.from({ length: 21 }, (_, index) => {
    const number = index + 1;
    return `Claim ${number}<sup class="footnote-ref"><a id="note-ref-${number}" href="#note-${number}" aria-label="Footnote ${number}">${number}</a></sup>. `;
  }).join("");
  const notes = Array.from({ length: 21 }, (_, index) => {
    const number = index + 1;
    return `<li id="note-${number}">A long citation for occurrence ${number} that wraps safely on a narrow screen${number === 21 ? " with https://example.com/a-very-long-unbroken-source-address-for-overflow-testing" : ""}. <a class="note-backlink" href="#note-ref-${number}" aria-label="Back to footnote ${number}">↩</a></li>`;
  }).join("");
  await page.setContent(`<!doctype html><style>${articleCss}</style><main><div class="article-body"><p>${references}</p></div><section class="article-notes" aria-label="Article notes"><details open><summary>Notes (21)</summary><ol>${notes}</ol></details></section></main>`);

  await expect(page.getByText("Notes (21)", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Footnote 21", exact: true })).toHaveText("21");
  await expect(page.getByRole("link", { name: "Back to footnote 21" })).toHaveAttribute("href", "#note-ref-21");
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    references: [...document.querySelectorAll(".footnote-ref a")].map((item) => item.textContent),
    noteIds: [...document.querySelectorAll(".article-notes li")].map((item) => item.id),
    listStyle: getComputedStyle(document.querySelector(".article-notes ol")!).listStyleType,
    listPadding: Number.parseFloat(getComputedStyle(document.querySelector(".article-notes ol")!).paddingInlineStart),
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(0);
  expect(geometry.references.slice(8, 12)).toEqual(["9", "10", "11", "12"]);
  expect(new Set(geometry.noteIds).size).toBe(21);
  expect(geometry.listStyle).toBe("decimal");
  expect(geometry.listPadding).toBeGreaterThanOrEqual(32);
});

test("public Notes disclosure opens for body links and direct hashes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  const route = "/articles/the-new-economics-of-school-lunch";
  await page.goto(route);
  const details = page.locator(".article-notes details");
  const summary = page.locator(".article-notes summary");
  await expect(summary).toHaveText("Notes (4)");
  await expect(details).not.toHaveAttribute("open", "");

  await summary.click();
  await expect(details).toHaveAttribute("open", "");
  await expect(page.locator("#note-3")).toBeVisible();
  await summary.click();
  await expect(details).not.toHaveAttribute("open", "");

  await page.getByRole("link", { name: "Footnote 3", exact: true }).click();
  await expect(details).toHaveAttribute("open", "");
  await expect(page).toHaveURL(`${route}#note-3`);
  await page.getByRole("link", { name: "Back to footnote 3", exact: true }).click();
  await expect(page).toHaveURL(`${route}#note-ref-3`);

  await page.goto(`${route}#note-4`);
  await expect(details).toHaveAttribute("open", "");
  await expect(page.locator("#note-4")).toBeVisible();
});
