import { NextRequest, NextResponse } from "next/server";
import { JoyAIFetch } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { question, title, summary, clauses, locale } = await req.json();

    if (!question || !summary) {
      return NextResponse.json({ error: "Missing question or document context." }, { status: 400 });
    }

    const clauseContext = Array.isArray(clauses)
      ? clauses.map((c: { title: string; summary: string }) => `${c.title}: ${c.summary}`).join("; ")
      : "";

    const langInstr =
      locale === "zh-CN"
        ? "Answer in Simplified Chinese (简体中文). Use plain, everyday language."
        : "Answer in plain English. Be direct and clear.";

    const response = await JoyAIFetch([
      {
        role: "system",
        content: `You are LexPlain. The user has analyzed a legal document titled "${title}". ${langInstr} Answer their question in 2-3 sentences. Be direct, practical, and helpful. Do not give legal advice — remind them to consult a lawyer for serious matters.`,
      },
      {
        role: "user",
        content: `Document summary: ${summary}\n\nKey clauses: ${clauseContext}\n\nQuestion: ${question}`,
      },
    ], 400);

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `JoyAI error: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      return NextResponse.json({ error: "Empty response from JoyAI." }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[/api/ask]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
