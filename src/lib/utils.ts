import { clsx, type ClassValue } from "clsx";
import OpenAI from "openai";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYSTEM_PROMPT_BASE = `You are LexPlain, an AI legal document analyst. Your job is to analyze legal documents and produce a clear, structured JSON report.

Given a legal document (or excerpt), return ONLY valid JSON with this exact structure:
{
  "title": "Document type and parties (e.g. 'Non-Disclosure Agreement — Acme Corp')",
  "pages": <estimated page count as integer>,
  "wordCount": <word count as integer>,
  "riskScore": "low" | "medium" | "high",
  "summary": "2-3 sentence plain summary of the document's key purpose and anything the reader must know",
  "actions": ["action item 1", "action item 2", "action item 3"],
  "clauses": [
    {
      "title": "Clause name",
      "summary": "One-sentence plain summary",
      "risk": "low" | "medium" | "high",
      "detail": "2-3 sentences explaining what this means in practice",
      "action": "Optional: what the reader should do or negotiate (only include if risk is medium or high)"
    }
  ]
}

Rules:
- Identify 4–7 key clauses
- riskScore should reflect the overall risk of the document
- actions should be concrete steps the reader should take before signing
- Use plain language — no legal jargon`;

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: "IMPORTANT: Respond entirely in English. Write all JSON string values (title, summary, actions, clauses content) in plain English.",
  "zh-CN":
    "IMPORTANT: Respond entirely in Simplified Chinese (简体中文). Write all JSON string values (title, summary, actions, clauses content) in plain, everyday Chinese.",
};

export function getAnalyzeSystemPrompt(locale: string = "en"): string {
  const langInstr = LANGUAGE_INSTRUCTIONS[locale] ?? LANGUAGE_INSTRUCTIONS.en;
  return `${SYSTEM_PROMPT_BASE}\n\n${langInstr}\n- Return ONLY the JSON object, no markdown, no explanation`;
}

export function parseJoyAIJson(content: string): unknown {
  const clean = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Invalid JSON in AI response.");
  }
}

export async function JoyAIFetch(
  messages: { role: string; content: string }[],
  maxTokens = 2000
): Promise<Response> {
  const apiUrl = process.env.CHATRHINO_API_URL;
  const apiKey = process.env.CHATRHINO_API_KEY;
  if (!apiUrl || !apiKey) {
    return new Response(
      JSON.stringify({ error: "JoyAI is not configured. Set CHATRHINO_API_URL and CHATRHINO_API_KEY." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const client = new OpenAI({ baseURL: apiUrl, apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.CHATRHINO_MODEL || "JoyAI-chat",
      messages: messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      })),
      temperature: 0.2,
      max_tokens: maxTokens,
    });
    return Response.json(completion);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
