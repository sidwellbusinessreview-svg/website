import { describe, expect, it } from "vitest";
import { articleDateTimeValue, formatArticleDate, isPublicationMonth, publicationMonthFromLegacyDate, sitemapArticleLastModified, structuredArticleDate } from "./article-date";

describe("Article date policy", () => {
  it("displays exact and month-precision dates as Month Year", () => {
    expect(formatArticleDate("2025-03")).toBe("March 2025");
    expect(formatArticleDate("2023-10")).toBe("October 2023");
  });
  it("validates canonical months and derives the transitional legacy fallback", () => {
    expect(isPublicationMonth("2025-03")).toBe(true);
    expect(isPublicationMonth("2025-13")).toBe(false);
    expect(publicationMonthFromLegacyDate("2026-05-18")).toBe("2026-05");
    expect(articleDateTimeValue("2025-03")).toBe("2025-03");
    expect(structuredArticleDate("2025-03")).toBe("2025-03");
    expect(sitemapArticleLastModified()).toBeUndefined();
  });
});
