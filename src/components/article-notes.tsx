"use client";

import { useEffect, useRef } from "react";
import type { CitationOccurrence } from "@/content/citations";

export function ArticleNotes({ occurrences }: { occurrences: CitationOccurrence[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const revealHashTarget = () => {
      const hash = window.location.hash;
      if (!/^#note-\d+$/.test(hash)) return;
      const target = document.getElementById(hash.slice(1));
      if (!target || !detailsRef.current?.contains(target)) return;
      detailsRef.current.open = true;
      window.requestAnimationFrame(() => {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "center" });
      });
    };
    revealHashTarget();
    window.addEventListener("hashchange", revealHashTarget);
    return () => window.removeEventListener("hashchange", revealHashTarget);
  }, []);

  return <section className="article-notes" aria-label="Article notes">
    <details ref={detailsRef}>
      <summary><span>Notes</span> <span>({occurrences.length})</span></summary>
      <ol>{occurrences.map((occurrence) => <li id={`note-${occurrence.occurrenceId}`} key={occurrence.occurrenceId} tabIndex={-1}>
        {occurrence.source
          ? occurrence.source.url
            ? <a href={occurrence.source.url} target="_blank" rel="noopener noreferrer">{occurrence.source.citation}</a>
            : occurrence.source.citation
          : <span className="footnote-ref--missing">Missing Source: {occurrence.sourceKey}</span>}
        {" "}<a className="note-backlink" href={`#note-ref-${occurrence.occurrenceId}`} aria-label={`Back to footnote ${occurrence.number}`}>↩</a>
      </li>)}</ol>
    </details>
  </section>;
}
