import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function secretsMatch(candidate: string, expected: string): boolean {
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const candidate = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!expected || !candidate || !secretsMatch(candidate, expected)) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  revalidateTag("content", "max");
  return NextResponse.json({ revalidated: true });
}
