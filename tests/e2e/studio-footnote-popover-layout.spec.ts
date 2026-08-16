import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const popoverCss = readFileSync(path.join(process.cwd(), "src/sanity/components/FootnoteSourceInput.module.css"), "utf8");
const citation = "Lee, Perry, and Yasanov, “The Employment Effects of Mexican Repatriations: Evidence From the 1930s.”";

for (const width of [1000, 320]) {
  test(`Studio footnote editor wraps citations normally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.setContent(`<!doctype html><style>${popoverCss}*{box-sizing:border-box}body{margin:0;padding:24px;font:16px/1.5 system-ui}.editor{border:1px solid #ccc;padding:12px}.citation{display:block}</style><div class="editor"><strong>Footnote 7</strong><p class="citation">${citation}</p><label>Source<select aria-label="Change source"><option>${citation}</option></select></label></div>`);
    const geometry = await page.locator(".editor").evaluate((element) => {
      const citationElement = element.querySelector(".citation")!;
      const editor = element.getBoundingClientRect();
      const citationBox = citationElement.getBoundingClientRect();
      return {
        editorHeight: editor.height,
        editorWidth: editor.width,
        citationHeight: citationBox.height,
        citationWidth: citationBox.width,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        wordBreak: getComputedStyle(citationElement).wordBreak,
      };
    });
    expect(geometry.editorWidth).toBeGreaterThanOrEqual(width === 320 ? 260 : 280);
    expect(geometry.editorWidth).toBeLessThanOrEqual(420);
    expect(geometry.citationWidth).toBeGreaterThan(230);
    expect(geometry.citationHeight).toBeLessThan(130);
    expect(geometry.editorHeight).toBeLessThan(260);
    expect(geometry.wordBreak).toBe("normal");
    expect(geometry.overflow).toBeLessThanOrEqual(0);
  });
}
