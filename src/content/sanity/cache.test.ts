import { describe, expect, it, vi } from "vitest";
import {
  PUBLIC_CACHE_TAGS,
  PUBLIC_CONTENT_REVALIDATE_SECONDS,
  publicCacheWindowHasExpired,
  publicQueryCacheOptions,
} from "./cache";

describe("published Sanity cache policy", () => {
  it("applies the shared content tag, related collection tags, and five-minute backstop", () => {
    expect(publicQueryCacheOptions("article:test", [PUBLIC_CACHE_TAGS.articles])).toEqual({
      next: {
        revalidate: 300,
        tags: ["content", "articles", "article:test"],
      },
    });
  });

  it("deduplicates relationships deterministically", () => {
    expect(publicQueryCacheOptions("articles", ["articles", "content"]).next.tags).toEqual(["content", "articles"]);
  });

  it("marks the configured cache window stale at exactly five minutes without waiting", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T12:00:00Z"));
    const cachedAt = Date.now();
    vi.setSystemTime(new Date(cachedAt + PUBLIC_CONTENT_REVALIDATE_SECONDS * 1000 - 1));
    expect(publicCacheWindowHasExpired(cachedAt, Date.now())).toBe(false);
    vi.setSystemTime(new Date(cachedAt + PUBLIC_CONTENT_REVALIDATE_SECONDS * 1000));
    expect(publicCacheWindowHasExpired(cachedAt, Date.now())).toBe(true);
    vi.useRealTimers();
  });
});
