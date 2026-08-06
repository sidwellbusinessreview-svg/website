export type PublicationDatePrecision = "day" | "month";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatArticleDate(value: string): string {
  if (!ISO_DATE.test(value)) return value;
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T12:00:00Z`));
}

export function serializeArticleDate(value: string, precision: PublicationDatePrecision = "day"): string {
  return precision === "month" ? value.slice(0, 7) : value;
}

export function articleDateTimeValue(value: string, precision: PublicationDatePrecision = "day"): string {
  return serializeArticleDate(value, precision);
}

export function structuredArticleDate(value: string, precision: PublicationDatePrecision = "day"): string {
  return serializeArticleDate(value, precision);
}

export function sitemapArticleLastModified(value: string, precision: PublicationDatePrecision = "day"): string | undefined {
  return precision === "month" ? undefined : value;
}

export function rssArticleDate(value: string): string {
  // RSS 2.0 requires RFC 822, so month-precision records use their internal
  // sorting anchor. Reader-facing surfaces never expose this artificial day.
  return new Date(`${value}T12:00:00Z`).toUTCString();
}
