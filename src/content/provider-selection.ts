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

export async function getContentProvider(): Promise<ContentProvider> {
  if (getConfiguredContentSource() === "local") return localContentProvider;
  const { getSanityContentProvider } = await import("./sanity/provider");
  return getSanityContentProvider();
}
