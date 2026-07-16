import type { Metadata } from "next";
import { IssueCard } from "@/components/issue-card";
import { getIssues } from "@/content";

export const metadata: Metadata = { title: "Issues" };

export default async function IssuesPage() {
  const issues = await getIssues();
  return (
    <div className="container page-shell">
      <header className="page-header">
        <p className="eyebrow">The archive</p>
        <h1>Issues</h1>
        <p>Each edition of the Review brings together reporting and analysis around a defining business idea.</p>
      </header>
      <div className="issues-list">
        {issues.map((issue) => <IssueCard key={issue.slug} issue={issue} />)}
      </div>
    </div>
  );
}
