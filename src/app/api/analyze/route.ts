import { type NextRequest, NextResponse } from "next/server";
import { recordAnalysis } from "@/lib/db";
import {
  getAnalyzeSystemPrompt,
  DeepSeekFetch,
  parseDeepSeekJson,
} from "@/lib/utils";

const MIN_TEXT_LENGTH = 20;
const MAX_TEXT_LENGTH = 12000;

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }
    const { text, locale } = body as { text?: unknown; locale?: unknown };

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Document text is required." },
        { status: 400 },
      );
    }
    const trimmed = text.trim();
    if (trimmed.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Document text is too short." },
        { status: 400 },
      );
    }

    const localeStr = typeof locale === "string" ? locale : "en";
    const systemPrompt = getAnalyzeSystemPrompt(localeStr);

    const response = await DeepSeekFetch(
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this legal document:\n\n${trimmed.slice(0, MAX_TEXT_LENGTH)}`,
        },
      ],
      2000,
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `DeepSeek error: ${err}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Empty response from DeepSeek." },
        { status: 502 },
      );
    }

    const parsed = parseDeepSeekJson(content);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("title" in parsed) ||
      !("clauses" in parsed)
    ) {
      return NextResponse.json(
        { error: "Invalid analysis structure from AI." },
        { status: 502 },
      );
    }
    await recordAnalysis().catch(() => {});
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
