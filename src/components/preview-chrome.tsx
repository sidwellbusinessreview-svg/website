"use client";

import { usePathname } from "next/navigation";
import { VisualEditing } from "next-sanity/visual-editing";
import { isPublicFrontendPath } from "@/sanity/preview-paths";
import { PreviewBanner } from "./preview-banner";

export function PreviewChrome({ publicationName }: { publicationName?: string }) {
  const pathname = usePathname();
  if (!isPublicFrontendPath(pathname)) return null;
  return (
    <>
      <PreviewBanner publicationName={publicationName} redirectPath={pathname} />
      <VisualEditing />
    </>
  );
}
