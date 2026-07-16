import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/content";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage() {
  const articles = await getArticles();
  return (
    <div className="container page-shell search-page">
      <header className="page-header"><p className="eyebrow">Explore the archive</p><h1>Search</h1><p>Full-site search will arrive in a later phase. For now, browse all published article titles below.</p></header>
      <div className="search-placeholder">
        <label htmlFor="site-search">Search the Review</label>
        <div><input id="site-search" type="search" placeholder="Search is coming soon" disabled /><button disabled>Search</button></div>
        <small>This control is a design-ready placeholder and does not submit yet.</small>
      </div>
      <ul className="search-index">
        {articles.map((article) => <li key={article.slug}><span>{article.category}</span><Link href={`/articles/${article.slug}`}>{article.title}</Link></li>)}
      </ul>
    </div>
  );
}
