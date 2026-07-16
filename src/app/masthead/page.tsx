import type { Metadata } from "next";
import { AuthorInfo } from "@/components/author-info";
import { getAuthors } from "@/content";

export const metadata: Metadata = { title: "Masthead" };

export default async function MastheadPage() {
  const authors = await getAuthors();
  return (
    <div className="container prose-page">
      <header className="page-header"><p className="eyebrow">The team</p><h1>Masthead</h1><p>The students responsible for the Review’s reporting, editing, and production.</p></header>
      <section className="masthead-list">
        <h2>Editorial</h2>
        {authors.map((author) => <AuthorInfo key={author.slug} author={author} />)}
      </section>
      <section className="masthead-list">
        <h2>Faculty adviser</h2>
        <div><strong>To be announced</strong><p>The adviser supports student learning while editorial decisions remain with the student masthead.</p></div>
      </section>
    </div>
  );
}
