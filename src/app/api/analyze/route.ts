import { NextRequest, NextResponse } from "next/server";
import { getAnalyzeSystemPrompt, parseJoyAIJson, JoyAIFetch } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { text, locale } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Document text is too short." }, { status: 400 });
    }

    const systemPrompt = getAnalyzeSystemPrompt(locale || "en");

    const response = await JoyAIFetch([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this legal document:\n\n${text.slice(0, 12000)}` },
    ], 2000);

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `JoyAI error: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty response from JoyAI." }, { status: 502 });
    }

    const result = parseJoyAIJson(content);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
