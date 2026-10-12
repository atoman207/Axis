import { NextResponse } from "next/server";
import { getRecommendationState, recommendOnce } from "@/lib/recommend";

export async function GET(request: Request) {
  try {
    const state = await getRecommendationState(request);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load recommendations";
    return NextResponse.json({ error: message, count: 0, recommended: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await recommendOnce(request);
    return NextResponse.json(result, {
      status: result.alreadyRecommended ? 200 : 201,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save recommendation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
