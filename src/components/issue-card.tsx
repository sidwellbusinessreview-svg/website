import Link from "next/link";
import type { Issue } from "@/content";

export function IssueCard({ issue }: { issue: Issue }) {
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
        <h2><Link href={`/issues/${issue.slug}`}>{issue.title}</Link></h2>
        <p>{issue.description}</p>
        <Link className="text-link" href={`/issues/${issue.slug}`}>View issue <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
