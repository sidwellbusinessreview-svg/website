"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public route error", error.digest ?? error.name);
  }, [error]);

  return (
    <div className="container page-shell empty-state" role="alert">
      <p className="eyebrow">Unable to load this page</p>
      <h1>Something interrupted the Review.</h1>
      <p>Please try again. If the problem continues, return later or contact the editors.</p>
      <button className="button-link" type="button" onClick={reset}>Try again</button>
    </div>
  );
}
