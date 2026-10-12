import { NextResponse } from "next/server";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import { createSite } from "@/lib/portfolio/db";

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const site = await createSite({
      url: String(body.url ?? "").trim(),
      category_id: String(body.category_id ?? "").trim(),
      image_url: body.image_url ? String(body.image_url).trim() : null,
      sort_order: Number(body.sort_order ?? 0),
    });

    return NextResponse.json(site);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create site";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
