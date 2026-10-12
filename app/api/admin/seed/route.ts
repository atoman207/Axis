import { NextResponse } from "next/server";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import { seedPortfolioDatabase } from "@/lib/portfolio/db";

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const data = await seedPortfolioDatabase();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed portfolio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
