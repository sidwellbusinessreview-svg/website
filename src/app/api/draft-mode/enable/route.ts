import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { getDraftSanityClient } from "@/sanity/lib/client";
import { matchesConfiguredPreviewSecret, safePreviewPath } from "@/sanity/preview";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const manualSecret = url.searchParams.get("secret");
  if (!manualSecret && !url.searchParams.get("sanity-preview-secret")) {
    return new NextResponse("Invalid preview request.", { status: 401 });
  }
  try {
    let redirectTo = "/";
    if (manualSecret) {
      if (!matchesConfiguredPreviewSecret(manualSecret)) {
        return new NextResponse("Invalid preview request.", { status: 401 });
      }
      redirectTo = safePreviewPath(url.searchParams.get("redirect"));
    } else {
      const result = await validatePreviewUrl(getDraftSanityClient(), request.url);
      if (!result.isValid) return new NextResponse("Invalid preview request.", { status: 401 });
      redirectTo = safePreviewPath(result.redirectTo);
    }
    (await draftMode()).enable();
    return NextResponse.redirect(new URL(redirectTo, url.origin), {
      status: 307,
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  } catch {
    return new NextResponse("Preview is unavailable. Ask an administrator to check the server configuration.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
