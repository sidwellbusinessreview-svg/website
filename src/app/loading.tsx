export default function Loading() {
  return (
    <div className="container page-shell loading-state" role="status" aria-live="polite">
      <p className="eyebrow">Loading</p>
      <p>Preparing the latest published content…</p>
    </div>
  );
}
