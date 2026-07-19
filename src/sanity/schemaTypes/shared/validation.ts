import type { ValidationContext } from "sanity";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function requiredText(value: unknown): true | string {
  return typeof value === "string" && value.trim().length > 0
    ? true
    : "This field is required.";
}

export function safeLink(value: unknown): true | string {
  if (typeof value !== "string" || value.trim().length === 0) return "Enter a URL.";

  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? true
      : "Links must use http, https, or an internal path beginning with /.";
  } catch {
    return "Enter a valid http, https, or internal URL.";
  }
}

export function contextualImageAlt(
  value: unknown,
  context: ValidationContext,
): true | string {
  const parent = context.parent as { asset?: unknown } | undefined;
  if (!parent?.asset) return true;
  return requiredText(value) === true
    ? true
    : "Alt text is required whenever an image is selected.";
}

export function uniqueReferences(
  references: Array<{ _ref?: string }> | undefined,
): true | string {
  if (!references) return true;
  const ids = references.map((reference) => reference._ref).filter(Boolean);
  return new Set(ids).size === ids.length ? true : "References must not be duplicated.";
}
