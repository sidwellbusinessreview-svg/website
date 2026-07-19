import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getArchiveArticles, getArticles, getContributors, getSchoolYear } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({ title: "Article Archive", description: "Browse all published Sidwell Business Review articles chronologically, by school year, or by contributor.", path: "/archive" });
type ArchiveSearchParams = { schoolYear?: string; contributor?: string };

export default async function ArchivePage({ searchParams }: { searchParams: Promise<ArchiveSearchParams> }) {
  const params = await searchParams;
  const [allArticles, contributors] = await Promise.all([getArticles(), getContributors()]);
  const schoolYears = [...new Set(allArticles.map(({ publishedAt }) => getSchoolYear(publishedAt)))];
  const requestedContributor = params.contributor;
  const filters = { schoolYear: schoolYears.includes(params.schoolYear ?? "") ? params.schoolYear : undefined, contributor: contributors.some(({ slug }) => slug === requestedContributor) ? requestedContributor : undefined };
  const articles = await getArchiveArticles(filters);
  const hasFilters = Object.values(filters).some(Boolean);
  return <div className="container page-shell">
    <header className="page-header"><p className="eyebrow">All published work</p><h1>Article archive</h1><p>Browse reporting chronologically or narrow it by school year or contributor.</p></header>
    <form className="archive-filters" action="/archive" method="get">
      <label>School year<select name="schoolYear" defaultValue={filters.schoolYear ?? ""}><option value="">All years</option>{schoolYears.map((year) => <option key={year}>{year}</option>)}</select></label>
      <label>Contributor<select name="contributor" defaultValue={filters.contributor ?? ""}><option value="">All contributors</option>{contributors.map((contributor) => <option key={contributor.slug} value={contributor.slug}>{contributor.name}</option>)}</select></label>
      <button type="submit">Apply filters</button>{hasFilters && <Link href="/archive">Clear filters</Link>}
    </form>
    <div className="section-title-row"><h2 className="section-title">{articles.length} published {articles.length === 1 ? "article" : "articles"}</h2></div>
    {articles.length ? <div className="article-list">{articles.map((article) => <ArticleCard key={article.slug} article={article} authors={contributors.filter((contributor) => article.contributorSlugs.includes(contributor.slug))} headingLevel={3} />)}</div> : <div className="empty-state"><h2>No articles match these filters.</h2><p>Clear one or more filters to broaden the archive.</p><Link className="text-link" href="/archive">View all articles</Link></div>}
  </div>;
}
