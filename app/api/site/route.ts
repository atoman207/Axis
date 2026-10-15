import { NextRequest, NextResponse } from "next/server";
import { findSiteHeroImages, toDisplayCandidates } from "@/lib/site-hero";

/**
 * Combined site media helper (hero discovery + image proxy) so Hobby plan
 * stays under the serverless-function limit.
 *
 * - GET /api/site?kind=hero&url=<page>
 * - GET /api/site?kind=image&url=<image>&page=<page>
 */
export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind") ?? "hero";

  if (kind === "hero") {
    return handleHero(request);
  }

  if (kind === "image") {
    return handleImage(request);
  }

  return NextResponse.json({ error: "Unknown kind. Use kind=hero or kind=image." }, { status: 400 });
}

async function handleHero(request: NextRequest) {
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

async function handleImage(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");
  const pageUrl = request.nextUrl.searchParams.get("page");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  let referer = `${parsedUrl.protocol}//${parsedUrl.host}/`;
  if (pageUrl) {
    try {
      referer = new URL(pageUrl).href;
    } catch {
      // Keep image host referer.
    }
  }

  try {
    const response = await fetch(parsedUrl.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/*,*/*",
        Referer: referer,
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
  }
}
