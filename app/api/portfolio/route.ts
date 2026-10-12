import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/portfolio/db";

export async function GET() {
  return NextResponse.json(await getPortfolio());
}
