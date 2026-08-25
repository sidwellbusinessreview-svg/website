import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { classifyArticleClipboard, plainTextToArticleBlocks } from "../../src/sanity/articlePaste";

const toolbarCss = readFileSync(
  path.join(process.cwd(), "src/sanity/components/ArticleBodyInput.module.css"),
  "utf8",
);

function fixture(paragraphCount = 0) {
  const button = (label: string) => `<button aria-label="${label}"></button>`;
  const body = paragraphCount
    ? Array.from({ length: paragraphCount }, (_, index) => `<p>Article paragraph ${index + 1} uses the normal writing surface.</p>`).join("")
    : `<span data-testid="pt-input-placeholder">Start writing or paste here…</span>`;
  return `<!doctype html><html><head><style>
    ${toolbarCss}
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; }
    button, select { height: 32px; }
    button { width: 32px; padding: 0; }
    select { width: 100%; }
  </style></head><body>
    <main style="width:100%">
      <div class="editorShell" data-testid="article-body-editor-shell">
      <div class="toolbarShell">
        <div class="toolbar" data-testid="article-body-toolbar" role="toolbar" aria-label="Article formatting">
          <span class="toolbarGroup">${button("Undo")}${button("Redo")}</span>
          <span class="divider"></span>
          <span class="styleSelect"><select aria-label="Paragraph style"><option>Normal text</option></select></span>
          <span class="divider"></span>
          <span class="toolbarGroup">${button("Bold")}${button("Italic")}${button("Insert link")}</span>
          <span class="divider"></span>
          <span class="toolbarGroup">${button("Bulleted list")}${button("Numbered list")}</span>
          <span class="divider"></span>
          <span class="toolbarGroup">${button("Add footnote")}${button("Insert image")}${button("Insert callout")}</span>
        </div>
      </div>
      <div class="editorSurface" data-testid="article-writing-area"><div data-testid="pt-editor">${body}</div></div>
      </div>
    </main>
  </body></html>`;
}

test("Article toolbar is one compact row at normal Studio width", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.setContent(fixture());

  const geometry = await page.evaluate(() => {
    const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const toolbarElement = document.querySelector("[data-testid=article-body-toolbar]")!;
    const toolbar = toolbarElement.getBoundingClientRect();
    const undo = box("[aria-label=Undo]");
    const style = box("[aria-label='Paragraph style']");
    const bold = box("[aria-label=Bold]");
    const list = box("[aria-label='Bulleted list']");
    const footnote = box("[aria-label='Add footnote']");
    const editor = box("[data-testid=article-writing-area]");
    const shell = box("[data-testid=article-body-editor-shell]");
    const placeholder = box("[data-testid=pt-input-placeholder]");
    const nativeEditor = document.querySelector("[data-testid=pt-editor]")!;
    return {
      centers: [undo, style, bold, list, footnote].map((rect) => rect.top + rect.height / 2),
      editorGap: editor.top - toolbar.bottom,
      overflow: toolbarElement.scrollWidth - toolbarElement.clientWidth,
      selectorWidth: style.width,
      toolbarHeight: toolbar.height,
      editorHeight: editor.height,
      firstLineOffset: placeholder.top - editor.top,
      resize: getComputedStyle(nativeEditor).resize,
      shellHeight: shell.height,
    };
  });

  expect(Math.max(...geometry.centers) - Math.min(...geometry.centers)).toBeLessThan(2);
  expect(geometry.selectorWidth).toBeGreaterThanOrEqual(140);
  expect(geometry.selectorWidth).toBeLessThanOrEqual(180);
  expect(geometry.toolbarHeight).toBeLessThanOrEqual(44);
  expect(geometry.editorGap).toBeLessThanOrEqual(1);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
  expect(geometry.editorHeight).toBeGreaterThanOrEqual(180);
  expect(geometry.editorHeight).toBeLessThanOrEqual(260);
  expect(geometry.firstLineOffset).toBeLessThan(40);
  expect(geometry.resize).toBe("none");
  expect(Math.abs(geometry.shellHeight - geometry.toolbarHeight - geometry.editorHeight)).toBeLessThanOrEqual(3);
});

test("Article body starts compact and grows with document content", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  const heights: number[] = [];
  for (const paragraphCount of [0, 1, 5, 20]) {
    await page.setContent(fixture(paragraphCount));
    heights.push(await page.locator("[data-testid=article-writing-area]").evaluate((element) => element.getBoundingClientRect().height));
  }
  expect(heights[0]).toBeGreaterThanOrEqual(180);
  expect(heights[0]).toBeLessThanOrEqual(260);
  expect(heights[1]).toBeGreaterThanOrEqual(heights[0]);
  expect(heights[2]).toBeGreaterThanOrEqual(heights[1]);
  expect(heights[3]).toBeGreaterThan(heights[0]);
  const nativeStyle = await page.locator("[data-testid=pt-editor]").evaluate((element) => ({
    overflow: getComputedStyle(element).overflow,
    resize: getComputedStyle(element).resize,
  }));
  expect(nativeStyle.overflow).toBe("visible");
  expect(nativeStyle.resize).toBe("none");
});

test("migration-scale plain-text paste remains separated and usable", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  const plain = Array.from({ length: 20 }, (_, index) => `Paragraph ${index + 1}: ${"archive sentence ".repeat(18)}[${index + 1}].`).join("\n\n");
  let key = 0;
  const blocks = plainTextToArticleBlocks(plain, () => `browser-${++key}`);
  const clipboard = await page.evaluate((text) => {
    const transfer = new DataTransfer();
    transfer.setData("text/plain", text);
    transfer.setData("text/html", `<pre>${text}</pre>`);
    const event = new ClipboardEvent("paste", { clipboardData: transfer });
    return { plain: event.clipboardData?.getData("text/plain"), html: event.clipboardData?.getData("text/html") };
  }, plain);
  expect(classifyArticleClipboard({ event: { clipboardData: { getData: (type: string) => type === "text/html" ? clipboard.html ?? "" : clipboard.plain ?? "" } } } as never)).toBe("plainProse");
  expect(plain.length).toBeGreaterThan(5_000);
  expect(blocks).toHaveLength(20);
  await page.setContent(fixture());
  await page.locator("[data-testid=pt-editor]").evaluate((element, paragraphs) => {
    element.replaceChildren(...paragraphs.map((text, index) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      paragraph.dataset.block = String(index + 1);
      return paragraph;
    }));
  }, blocks.map((block) => block.children[0].text));
  await page.locator("main").evaluate((main) => {
    const sources = document.createElement("section");
    sources.setAttribute("aria-label", "Sources");
    sources.innerHTML = Array.from({ length: 20 }, (_, index) => `<button>Source ${index + 1}: Archive citation ${index + 1}</button>`).join("");
    main.append(sources);
  });
  expect(await page.locator("[data-block]").count()).toBe(20);
  expect(await page.locator("[data-testid=article-writing-area]").evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(600);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await expect(page.getByRole("button", { name: "Add footnote" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Source 20: Archive citation 20" })).toBeVisible();
});

test("Article toolbar wraps compactly without a full-width selector when narrow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.setContent(fixture());

  const geometry = await page.evaluate(() => {
    const toolbar = document.querySelector("[data-testid=article-body-toolbar]")!.getBoundingClientRect();
    const style = document.querySelector("[aria-label='Paragraph style']")!.getBoundingClientRect();
    const editor = document.querySelector("[data-testid=article-writing-area]")!.getBoundingClientRect();
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      selectorRatio: style.width / toolbar.width,
      toolbarHeight: toolbar.height,
      editorHeight: editor.height,
    };
  });

  expect(geometry.selectorRatio).toBeLessThan(0.5);
  expect(geometry.toolbarHeight).toBeLessThanOrEqual(80);
  expect(geometry.pageOverflow).toBeLessThanOrEqual(0);
  expect(geometry.editorHeight).toBeGreaterThanOrEqual(180);
  expect(geometry.editorHeight).toBeLessThanOrEqual(260);
});
