import type { Metadata } from "next";
import Link from "next/link";
import { getContributors } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contributors",
  description: "Contributor profiles for Sidwell Business Review.",
  path: "/authors",
});

export default async function AuthorsPage() {
  const authors = await getContributors();
  return (
    <div className="container page-shell">
      <header className="page-header"><p className="eyebrow">Bylines</p><h1>Contributors</h1><p>Student writers whose work appears in the Review.</p></header>
      <div className="author-grid">
        {authors.map((author) => (
          <article className="author-card" key={author.slug}>
            <h2><Link href={`/authors/${author.slug}`}>{author.name}</Link></h2>
            {(author.role || author.grade) && <p>{[author.role, author.grade].filter(Boolean).join(" · ")}</p>}
            <Link className="text-link" href={`/authors/${author.slug}`}>View profile <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
    </div>
  );
}
