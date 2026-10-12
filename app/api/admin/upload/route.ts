import { NextResponse } from "next/server";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import { uploadPortfolioImage } from "@/lib/portfolio/db";

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const publicUrl = await uploadPortfolioImage(file);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
