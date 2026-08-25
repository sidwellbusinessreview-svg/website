import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const popoverCss = [
  readFileSync(path.join(process.cwd(), "src/sanity/components/FootnoteSourceInput.module.css"), "utf8"),
  readFileSync(path.join(process.cwd(), "src/sanity/components/ArticleBodyInput.module.css"), "utf8"),
].join("\n");
const citation = "Lee, Perry, and Yasanov, “The Employment Effects of Mexican Repatriations: Evidence From the 1930s.”";

for (const width of [1440, 1100, 768, 390]) {
  test(`Studio footnote editor wraps citations normally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.setContent(`<!doctype html><style>${popoverCss}*{box-sizing:border-box}body{margin:0;padding:24px;font:16px/1.5 system-ui}.anchor{margin-left:min(60vw,700px)}.popover{position:relative;margin:8px 0 0 auto;border:1px solid #ccc;background:white}.editor{padding:12px}.citation{display:block}</style><button class="anchor" aria-label="Footnote 7">7</button><div class="popover footnotePopover" role="dialog" aria-label="Edit footnote"><button aria-label="Close">×</button><div class="editor"><strong>Footnote 7</strong><p class="citation">${citation}</p><label>Source<input aria-label="Change source" value="${citation}"></label><button>Remove footnote</button></div></div>`);
    const geometry = await page.locator(".editor").evaluate((element) => {
      const citationElement = element.querySelector(".citation")!;
      const editor = element.getBoundingClientRect();
      const popover = element.closest(".popover")!.getBoundingClientRect();
      const citationBox = citationElement.getBoundingClientRect();
      return {
        editorHeight: editor.height,
        editorWidth: editor.width,
        popoverWidth: popover.width,
        citationHeight: citationBox.height,
        citationWidth: citationBox.width,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        wordBreak: getComputedStyle(citationElement).wordBreak,
      };
    });
    expect(geometry.popoverWidth).toBeGreaterThanOrEqual(320);
    expect(geometry.popoverWidth).toBeLessThanOrEqual(440);
    expect(geometry.citationWidth).toBeGreaterThan(230);
    expect(geometry.citationHeight).toBeLessThan(130);
    expect(geometry.editorHeight).toBeLessThan(260);
    expect(geometry.wordBreak).toBe("normal");
    expect(geometry.overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove footnote" })).toBeVisible();
  });
}
