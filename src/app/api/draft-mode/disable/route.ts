import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { safePreviewPath } from "@/sanity/preview";

export const dynamic = "force-dynamic";

async function disable(request: Request) {
  (await draftMode()).disable();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(safePreviewPath(url.searchParams.get("redirect")), url.origin), {
    status: 303,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export const GET = disable;
export const POST = disable;
