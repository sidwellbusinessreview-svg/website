import type { Metadata } from "next";
import Link from "next/link";
import { getContributors } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({ title: "About", description: "Learn about the mission, standards, and student leadership of Sidwell Business Review.", path: "/about" });

export default async function AboutPage() {
  const contributors = await getContributors();
  const editorsInChief = contributors.filter(({ role }) => role?.toLowerCase().includes("editor in chief"));
  const editors = contributors.filter(({ slug }) => !editorsInChief.some((editor) => editor.slug === slug));
  return <div className="container prose-page about-page">
    <header className="page-header"><p className="eyebrow">About the Review</p><h1>Serious curiosity, clearly expressed.</h1></header>
    <div className="prose-page__body">
      <p className="lead">Sidwell Business Review is a student-run publication examining business, economics, markets, technology, and public policy.</p>
      <h2>Our mission</h2><p>We give student writers space to ask ambitious questions, report carefully, and make clear arguments. Business journalism is strongest when it treats companies and markets as human institutions—not abstractions.</p>
      <h2>Our standards</h2><p>Writers distinguish reporting from opinion, identify sources, disclose relevant conflicts, and correct errors transparently. Editors work with every contributor on evidence, structure, fairness, and clarity.</p>
      <h2>Editors-in-Chief</h2><div className="about-staff-grid">{editorsInChief.map((contributor) => <StaffCard key={contributor.slug} slug={contributor.slug} name={contributor.name} role={contributor.role} grade={contributor.grade} />)}</div>
      <h2>Editors</h2><div className="about-staff-grid">{editors.map((contributor) => <StaffCard key={contributor.slug} slug={contributor.slug} name={contributor.name} role={contributor.role} grade={contributor.grade} />)}</div>
      <h2>Faculty Adviser</h2><p>To be announced.</p>
    </div>
  </div>;
}

function StaffCard({ slug, name, role, grade }: { slug: string; name: string; role?: string; grade?: string }) {
  return <article className="about-staff-card"><Link href={`/authors/${slug}`}>{name}</Link>{(role || grade) && <p>{[role, grade].filter(Boolean).join(" · ")}</p>}</article>;
}
