import type { Metadata } from "next";
import Link from "next/link";
import { AuthorInfo } from "@/components/author-info";
import { getAuthors } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Authors",
  description: "Meet the student writers and editors of Sidwell Business Review.",
  path: "/authors",
});

export default async function AuthorsPage() {
  const authors = await getAuthors();
  return (
    <div className="container page-shell">
      <header className="page-header"><p className="eyebrow">Our writers</p><h1>Authors</h1><p>Meet the students reporting, editing, and analyzing the business world.</p></header>
      <div className="author-grid">
        {authors.map((author) => (
          <article className="author-card" key={author.slug}>
            <AuthorInfo author={author} linked={false} />
            <p>{author.bio}</p>
            <Link className="text-link" href={`/authors/${author.slug}`}>View profile <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
    </div>
  );
}
