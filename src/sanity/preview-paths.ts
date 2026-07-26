const NON_PAGE_PATHS = new Set(["/feed.xml", "/sitemap.xml", "/robots.txt"]);

export function isPublicFrontendPath(pathname: string | null): boolean {
  return (
    typeof pathname === "string" &&
    pathname.startsWith("/") &&
    pathname !== "/studio" &&
    !pathname.startsWith("/studio/") &&
    pathname !== "/api" &&
    !pathname.startsWith("/api/") &&
    !NON_PAGE_PATHS.has(pathname)
  );
}

export function safePreviewPath(value: string | null | undefined): string {
  if (!value) return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\")) return "/";
    const url = new URL(decoded, "https://preview.invalid");
    if (url.origin !== "https://preview.invalid" || !isPublicFrontendPath(url.pathname)) return "/";
    for (const parameter of [
      "secret",
      "redirect",
      "sanity-preview-secret",
      "sanity-preview-perspective",
      "sanity-preview-pathname",
    ])
      url.searchParams.delete(parameter);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
