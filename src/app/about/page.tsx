import type { Metadata } from "next";
import Link from "next/link";
import { getContributors, getStaticPageBySlug } from "@/content";
import { ArticleBody } from "@/components/article-body";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({ title: "About", description: "Learn about the mission, standards, and student leadership of Sidwell Business Review.", path: "/about" });

export default async function AboutPage() {
  const [contributors, managedPage] = await Promise.all([getContributors(), getStaticPageBySlug("about")]);
  const contributorBySlug = new Map(contributors.map((contributor) => [contributor.slug, contributor]));
  const staff = (entries: Array<{ contributorSlug: string; displayedRole?: string }>) => entries.flatMap((entry) => {
    const contributor = contributorBySlug.get(entry.contributorSlug);
    return contributor ? [{ ...contributor, displayedRole: entry.displayedRole }] : [];
  });
  const editorsInChief = managedPage ? staff(managedPage.staff.editorsInChief) : [];
  const editors = managedPage ? staff(managedPage.staff.editors) : [];
  const facultyAdviser = managedPage ? staff(managedPage.staff.facultyAdviser) : [];
  return <div className="container prose-page about-page">
    <header className="page-header"><p className="eyebrow">{managedPage?.eyebrow ?? "About the Review"}</p><h1>{managedPage?.title ?? "Serious curiosity, clearly expressed."}</h1></header>
    <div className="prose-page__body">
      {managedPage ? <ArticleBody blocks={managedPage.body} /> : <><p className="lead">Sidwell Business Review is a student-run publication examining business, economics, markets, technology, and public policy.</p><h2>Our mission</h2><p>We give student writers space to ask ambitious questions, report carefully, and make clear arguments. Business journalism is strongest when it treats companies and markets as human institutions—not abstractions.</p><h2>Our standards</h2><p>Writers distinguish reporting from opinion, identify sources, disclose relevant conflicts, and correct errors transparently. Editors work with every contributor on evidence, structure, fairness, and clarity.</p></>}
      <h2>Editor-in-Chief</h2><div className="about-staff-grid">{editorsInChief.map((contributor) => <StaffCard key={contributor.slug} slug={contributor.slug} name={contributor.name} contextLabel={contributor.displayedRole} grade={contributor.grade} />)}</div>
      <h2>Editors</h2><div className="about-staff-grid">{editors.map((contributor) => <StaffCard key={contributor.slug} slug={contributor.slug} name={contributor.name} contextLabel={contributor.displayedRole} grade={contributor.grade} />)}</div>
      <h2>Faculty Adviser</h2>{facultyAdviser.length ? <div className="about-staff-grid">{facultyAdviser.map((contributor) => <StaffCard key={contributor.slug} slug={contributor.slug} name={contributor.name} contextLabel={contributor.displayedRole} grade={contributor.grade} />)}</div> : <p>To be announced.</p>}
    </div>
  </div>;
}

function StaffCard({ slug, name, contextLabel, grade }: { slug: string; name: string; contextLabel?: string; grade?: string }) {
  return <article className="about-staff-card"><Link href={`/authors/${slug}`}>{name}</Link>{(contextLabel || grade) && <p>{[contextLabel, grade].filter(Boolean).join(" · ")}</p>}</article>;
}
