const PUBLICATION_MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isPublicationMonth(value: string): boolean {
  return PUBLICATION_MONTH.test(value);
}

export function publicationMonthFromLegacyDate(value: string): string | undefined {
  const month = value.slice(0, 7);
  return isPublicationMonth(month) ? month : undefined;
}

export function formatArticleDate(value: string): string {
  if (!isPublicationMonth(value)) return value;
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}-01T12:00:00Z`));
}

export function articleDateTimeValue(value: string): string { return value; }
export function structuredArticleDate(value: string): string { return value; }

// Sitemap and RSS date fields require day precision. Publication month is not
// a verified day, so sitemap omits lastModified and RSS omits pubDate.
export function sitemapArticleLastModified(): undefined { return undefined; }
