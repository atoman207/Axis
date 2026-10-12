import { NextRequest, NextResponse } from "next/server";
import { findSiteHeroImages, toDisplayCandidates } from "@/lib/site-hero";

export async function GET(request: NextRequest) {
  const pageUrl = request.nextUrl.searchParams.get("url");

  if (!pageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    new URL(pageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  const imageUrls = await findSiteHeroImages(pageUrl);
  const candidates = toDisplayCandidates(imageUrls, pageUrl);

  return NextResponse.json(
    {
      imageUrl: imageUrls[0] ?? null,
      candidates,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
