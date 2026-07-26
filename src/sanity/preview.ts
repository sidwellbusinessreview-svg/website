import { timingSafeEqual } from "node:crypto";
export { isPublicFrontendPath, safePreviewPath } from "./preview-paths";

export const PREVIEW_ENABLE_PATH = "/api/draft-mode/enable";
export const PREVIEW_DISABLE_PATH = "/api/draft-mode/disable";

export function matchesConfiguredPreviewSecret(candidate: string | null): boolean {
  const expected = process.env.SANITY_PREVIEW_SECRET?.trim();
  if (!candidate || !expected) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
