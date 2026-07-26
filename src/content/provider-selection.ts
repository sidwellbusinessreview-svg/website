import { z } from "zod";
import { localContentProvider } from "./local-provider";
import type { ContentProvider, ContentSourceName } from "./provider";

const sourceSchema = z.enum(["local", "sanity"]);

export function getConfiguredContentSource(value = process.env.CONTENT_SOURCE): ContentSourceName {
  if (!value) return "local";
  const parsed = sourceSchema.safeParse(value.trim().toLowerCase());
  if (!parsed.success) throw new Error('Invalid CONTENT_SOURCE. Use "local" or "sanity".');
  return parsed.data;
}

export async function getContentProvider(options: { publishedOnly?: boolean } = {}): Promise<ContentProvider> {
  if (getConfiguredContentSource() === "local") return localContentProvider;
  const { createSanityContentProvider, getSanityContentProvider } = await import("./sanity/provider");
  if (options.publishedOnly) return getSanityContentProvider();
  const { draftMode } = await import("next/headers");
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    const { getDraftSanityClient } = await import("@/sanity/lib/client");
    return createSanityContentProvider(getDraftSanityClient(), "drafts");
  }
  return getSanityContentProvider();
}
