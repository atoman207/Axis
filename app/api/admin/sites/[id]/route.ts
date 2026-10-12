import { NextResponse } from "next/server";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import { deleteSite, updateSite } from "@/lib/portfolio/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const site = await updateSite(id, {
      url: body.url !== undefined ? String(body.url).trim() : undefined,
      category_id:
        body.category_id !== undefined ? String(body.category_id).trim() : undefined,
      image_url:
        body.image_url !== undefined
          ? body.image_url
            ? String(body.image_url).trim()
            : null
          : undefined,
      sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
    });

    return NextResponse.json(site);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update site";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const { id } = await params;
    await deleteSite(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete site";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
