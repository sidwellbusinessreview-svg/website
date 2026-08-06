import { describe, expect, it } from "vitest";
import { articleDateTimeValue, formatArticleDate, rssArticleDate, serializeArticleDate, sitemapArticleLastModified, structuredArticleDate } from "./article-date";

describe("Article date policy", () => {
  it("displays exact and month-precision dates as Month Year", () => {
    expect(formatArticleDate("2026-05-18")).toBe("May 2026");
    expect(formatArticleDate("2025-03-01")).toBe("March 2025");
  });
  it("preserves exact machine dates and reduces month precision", () => {
    expect(serializeArticleDate("2026-05-18", "day")).toBe("2026-05-18");
    expect(serializeArticleDate("2025-03-01", "month")).toBe("2025-03");
    expect(articleDateTimeValue("2025-03-01", "month")).toBe("2025-03");
    expect(structuredArticleDate("2025-03-01", "month")).toBe("2025-03");
    expect(sitemapArticleLastModified("2025-03-01", "month")).toBeUndefined();
    expect(sitemapArticleLastModified("2026-05-18", "day")).toBe("2026-05-18");
  });
  it("uses the sorting anchor only for RSS's required complete date", () => {
    expect(rssArticleDate("2025-03-01")).toContain("01 Mar 2025");
  });
});
