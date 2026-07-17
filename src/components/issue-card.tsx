import Link from "next/link";
import type { Issue } from "@/content";

export function IssueCard({ issue, headingLevel = 2 }: { issue: Issue; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <article className="issue-card" style={{ "--issue-accent": issue.accent } as React.CSSProperties}>
      <div className="issue-cover">
        <span>Sidwell</span>
        <strong>Business<br />Review</strong>
        <span className="issue-cover__title">{issue.title}</span>
        <small>No. {issue.number} · {issue.season} {issue.year}</small>
      </div>
      <div>
        <p className="eyebrow">Issue {issue.number}</p>
        <Heading><Link href={`/issues/${issue.slug}`}>{issue.title}</Link></Heading>
        <p>{issue.description}</p>
        <Link className="text-link" href={`/issues/${issue.slug}`}>View issue <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
