import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container prose-page">
      <header className="page-header"><p className="eyebrow">About the Review</p><h1>Serious curiosity, clearly expressed.</h1></header>
      <div className="prose-page__body">
        <p className="lead">Sidwell Business Review is a student-run publication examining business, economics, markets, technology, and public policy.</p>
        <h2>Our mission</h2>
        <p>We give student writers the space to ask ambitious questions, report carefully, and make clear arguments. We believe business journalism is strongest when it treats companies and markets as human institutions—not abstractions.</p>
        <h2>Our standards</h2>
        <p>Writers distinguish reporting from opinion, identify sources, disclose relevant conflicts, and correct errors transparently. Editors work with every contributor on evidence, structure, fairness, and clarity.</p>
        <h2>Student-led, editorially independent</h2>
        <p>The Review is produced by Sidwell Friends students. Its views belong to its individual writers and do not necessarily represent the school.</p>
        <Link className="button-link" href="/masthead">Meet the masthead</Link>
      </div>
    </div>
  );
}
