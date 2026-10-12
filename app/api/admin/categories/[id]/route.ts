import { NextResponse } from "next/server";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import { deleteCategory, updateCategory } from "@/lib/portfolio/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const category = await updateCategory(id, {
      label: body.label !== undefined ? String(body.label).trim() : undefined,
      stacks: Array.isArray(body.stacks) ? body.stacks.map(String) : undefined,
      group_type: body.group_type === "other" ? "other" : body.group_type === "skill" ? "skill" : undefined,
      sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
    });

    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
