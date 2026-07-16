import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="eyebrow">404 · Page not found</p>
      <h1>This story is not in our archive.</h1>
      <p>The page may have moved, or the address may be incomplete.</p>
      <div><Link className="button-link" href="/">Return home</Link><Link className="text-link" href="/latest">Browse latest articles</Link></div>
    </div>
  );
}
