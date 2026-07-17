import type { Metadata } from "next";
import { IssueCard } from "@/components/issue-card";
import { getIssues } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Issues",
  description: "Browse current and past issues of Sidwell Business Review.",
  path: "/issues",
});

export default async function IssuesPage() {
  const issues = await getIssues();
  return (
    <div className="container page-shell">
      <header className="page-header">
        <p className="eyebrow">The archive</p>
        <h1>Issues</h1>
        <p>Each edition of the Review brings together reporting and analysis around a defining business idea.</p>
      </header>
      {issues.length > 0 ? (
        <>
          <div className="section-title-row">
            <h2 className="section-title">Current issue</h2>
          </div>
          <IssueCard issue={issues[0]} headingLevel={3} />
          {issues.length > 1 && (
            <>
              <div className="section-title-row issues-past-heading">
                <h2 className="section-title">Past issues</h2>
              </div>
              <div className="issues-list">
                {issues.slice(1).map((issue) => <IssueCard key={issue.slug} issue={issue} headingLevel={3} />)}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h2>No issues have been published yet.</h2>
          <p>Individual articles remain available in the article archive.</p>
        </div>
      )}
    </div>
  );
}
