export function PreviewBanner({ publicationName, redirectPath = "/" }: { publicationName?: string; redirectPath?: string }) {
  return (
    <aside className="preview-banner" aria-label="Draft preview status">
      <p><strong>Previewing unpublished content</strong><span>{publicationName ? `${publicationName}: ` : ""}Readers may not see these changes. Preview applies to every localhost tab in this browser session.</span></p>
      <form aria-label="Exit draft preview" action={`/api/draft-mode/disable?redirect=${encodeURIComponent(redirectPath)}`} method="post" target="_top">
        <button type="submit">Exit preview</button>
      </form>
    </aside>
  );
}
