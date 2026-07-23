export const PUBLIC_CONTENT_REVALIDATE_SECONDS = 300;

export const PUBLIC_CACHE_TAGS = {
  all: "content",
  articles: "articles",
  contributors: "contributors",
  pages: "pages",
  settings: "settings",
} as const;

export function publicQueryCacheOptions(primaryTag: string, relatedTags: string[] = []) {
  return {
    next: {
      revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
      tags: [...new Set([PUBLIC_CACHE_TAGS.all, ...relatedTags, primaryTag])],
    },
  };
}

export function publicCacheWindowHasExpired(cachedAt: number, now: number): boolean {
  return now - cachedAt >= PUBLIC_CONTENT_REVALIDATE_SECONDS * 1000;
}
