import { NextRequest, NextResponse } from "next/server";
import { recordRating } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const score = typeof body?.score === "number" ? body.score : Number(body?.score);
    if (score < 1 || score > 5) {
      return NextResponse.json({ error: "Score must be 1–5" }, { status: 400 });
    }
    await recordRating(score);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/rate]", err);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
