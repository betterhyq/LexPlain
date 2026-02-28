import { clsx, type ClassValue } from "clsx";
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

export function parseJoyAIJson(content: string) {
  const clean = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(clean);
}

export function JoyAIFetch(messages: { role: string; content: string }[], maxTokens = 2000) {
  return fetch(`${process.env.CHATRHINO_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHATRHINO_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.CHATRHINO_MODEL || "JoyAI-chat",
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });
}
