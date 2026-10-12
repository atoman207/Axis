import { NextResponse } from "next/server";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import { createCategory } from "@/lib/portfolio/db";

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const category = await createCategory({
      id: String(body.id ?? "").trim(),
      label: String(body.label ?? "").trim(),
      stacks: Array.isArray(body.stacks) ? body.stacks.map(String) : [],
      group_type: body.group_type === "other" ? "other" : "skill",
      sort_order: Number(body.sort_order ?? 0),
    });

    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
