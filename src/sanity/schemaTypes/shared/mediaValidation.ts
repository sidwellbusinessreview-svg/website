import type { Image, ValidationContext } from "sanity";

export const SUPPORTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const IMAGE_FORMAT_DESCRIPTION = "Upload a JPEG, PNG, or WebP image. PDF, SVG, GIF, and other file types are not accepted.";

type AssetMetadata = { mimeType?: string; originalFilename?: string } | null;

export function isSupportedImageAsset(asset: AssetMetadata): boolean {
  if (!asset) return false;
  const extension = asset.originalFilename?.split(".").pop()?.toLowerCase();
  return Boolean(
    asset.mimeType &&
    SUPPORTED_IMAGE_MIME_TYPES.includes(asset.mimeType as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number]) &&
    extension &&
    SUPPORTED_IMAGE_EXTENSIONS.includes(extension as (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]),
  );
}

export async function validateSupportedImage(value: Image | undefined, context: ValidationContext): Promise<true | string> {
  const reference = value?.asset?._ref;
  if (!reference) return true;
  const asset = await context
    .getClient({ apiVersion: "2025-02-19" })
    .fetch<AssetMetadata>("*[_id == $id][0]{mimeType, originalFilename}", { id: reference });
  return isSupportedImageAsset(asset) ? true : IMAGE_FORMAT_DESCRIPTION;
}

export function requireAltWhenImagePresent(
  value: unknown,
  context: ValidationContext,
  imageField: string,
): true | string {
  const document = context.document as Record<string, unknown> | undefined;
  return !document?.[imageField] || (typeof value === "string" && value.trim().length > 0)
    ? true
    : "Alternative text is required when an image is added.";
}
