export type ArticleDocumentState = "draftOnly" | "published" | "publishedWithChanges";

export type ArticleVersion = {
  _id: string;
  title?: string;
  subtitle?: string;
  summary?: string;
  publicationMonth?: string;
  publicationDate?: string;
  _updatedAt?: string;
  pinned?: boolean;
  contributorNames?: string[];
  thumbnailUrl?: string;
};

export type ArticleStateRecord = {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  publicationMonth?: string;
  updatedAt?: string;
  pinned: boolean;
  contributorNames: string[];
  thumbnailUrl?: string;
  state: ArticleDocumentState;
};

export type ArticleSort = "newest" | "oldest" | "title" | "updated";

export function classifyArticleVersions(versions: ArticleVersion[]): ArticleStateRecord[] {
  const pairs = new Map<string, { draft?: ArticleVersion; published?: ArticleVersion }>();
  for (const version of versions) {
    const isDraft = version._id.startsWith("drafts.");
    const id = version._id.replace(/^drafts\./, "");
    const pair = pairs.get(id) ?? {};
    if (isDraft) pair.draft = version;
    else pair.published = version;
    pairs.set(id, pair);
  }
  return [...pairs.entries()].map<ArticleStateRecord>(([id, pair]) => {
    const displayed = pair.draft ?? pair.published;
    return {
      id,
      title: displayed?.title || "Untitled article",
      subtitle: displayed?.subtitle,
      summary: displayed?.summary,
      publicationMonth: displayed?.publicationMonth ?? displayed?.publicationDate?.slice(0, 7),
      updatedAt: displayed?._updatedAt,
      pinned: Boolean(displayed?.pinned),
      contributorNames: displayed?.contributorNames?.filter((name): name is string => typeof name === "string" && Boolean(name.trim())) ?? [],
      thumbnailUrl: displayed?.thumbnailUrl,
      state: pair.draft && pair.published ? "publishedWithChanges" : pair.draft ? "draftOnly" : "published",
    };
  }).sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}

export function searchArticleRecords(records: ArticleStateRecord[], query: string): ArticleStateRecord[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return records;
  return records.filter((record) => [record.title, record.subtitle, record.summary, record.publicationMonth, ...record.contributorNames]
    .filter((value): value is string => typeof value === "string")
    .some((value) => value.toLocaleLowerCase().includes(normalized)));
}

const dateValue = (value?: string) => value ? Date.parse(value) || 0 : 0;
export function sortArticleRecords(records: ArticleStateRecord[], sort: ArticleSort): ArticleStateRecord[] {
  return [...records].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
    if (sort === "updated") return dateValue(b.updatedAt) - dateValue(a.updatedAt) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
    const aDate = dateValue(a.publicationMonth);
    const bDate = dateValue(b.publicationMonth);
    if (!aDate || !bDate) {
      if (aDate !== bDate) return aDate ? -1 : 1;
      return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
    }
    const dateDifference = aDate - bDate;
    return (sort === "oldest" ? dateDifference : -dateDifference) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
  });
}

export function articleStatusLabel(draft: unknown, published: unknown): string {
  if (draft && published) return "Published with unpublished changes";
  if (published) return "Published";
  return "Draft only";
}
