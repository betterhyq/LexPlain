# LexPlain Architecture

This document describes the architecture of LexPlain, a web app that helps users understand legal documents in plain language using AI-powered analysis.

## Overview

LexPlain is a Next.js 16 application with App Router, supporting English and Simplified Chinese. Users can upload documents or paste text, receive AI-generated summaries and risk analysis, and ask follow-up questions. No document storage—analysis runs on input and results stay in the session. AI endpoints (analyze, ask) are rate-limited per IP per hour via Redis; when Redis is unavailable, rate limiting is skipped and requests are allowed.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, lucide-react |
| i18n | next-intl |
| AI | DeepSeek (OpenAI-compatible API via `openai` SDK) |
| Storage | Redis (stats, ratings, per-IP rate limiting: 20 AI requests/hour) |

## Directory Structure

```
LexPlain/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Locale-scoped pages
│   │   │   ├── layout.tsx      # Locale layout (NextIntlClientProvider)
│   │   │   ├── page.tsx        # Home: upload/paste, analyze
│   │   │   └── results/
│   │   │       └── page.tsx   # Results: summary, clauses, Q&A
│   │   ├── api/                # API routes
│   │   │   ├── analyze/        # POST: document analysis
│   │   │   ├── ask/            # POST: follow-up Q&A
│   │   │   ├── rate/           # POST: user rating (1–5)
│   │   │   └── stats/          # GET: analytics (analyses, ratings)
│   │   ├── fonts.css
│   │   ├── globals.css
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI
│   │   ├── ClauseCard.tsx      # Expandable clause display
│   │   ├── Footer.tsx
│   │   ├── HeroTypewriter.tsx   # Animated hero text
│   │   ├── LocaleScript.tsx    # Locale hydration
│   │   ├── LocaleSwitcher.tsx
│   │   ├── RatingWidget.tsx    # 1–5 star rating
│   │   └── RiskIndicators.tsx  # RiskBadge, RiskCircle
│   ├── i18n/
│   │   ├── navigation.ts       # Link, redirect, useRouter (locale-aware)
│   │   ├── request.ts          # getRequestConfig (messages, locale)
│   │   └── routing.ts         # locales, defaultLocale, prefix
│   ├── lib/
│   │   ├── db.ts               # Redis: getStats, recordAnalysis, recordRating
│   │   ├── ratelimit.ts        # checkAndConsumeAiRateLimit, getClientIp (per-IP, 1h window)
│   │   └── utils.ts            # cn, prompts, DeepSeekFetch, parseDeepSeekJson
│   ├── types/
│   │   └── index.ts            # Risk, Clause, AnalysisResult
│   └── proxy.ts                # next-intl middleware (locale routing)
├── messages/
│   ├── en.json
│   └── zh-CN.json
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Data Flow

### 1. Document Analysis

```
User (file/text) → Home page → POST /api/analyze
  → getClientIp(req), checkAndConsumeAiRateLimit(ip) [Redis; 429 if over limit]
  → lib/utils: getAnalyzeSystemPrompt, DeepSeekFetch
  → DeepSeek API (LLM)
  → parseDeepSeekJson → AnalysisResult
  → recordAnalysis() (stats)
  → sessionStorage (lexplain_result, lexplain_filename)
  → redirect /results
```

- **Input**: `text` (string), `locale` (en | zh-CN)
- **Output**: `AnalysisResult` (title, pages, wordCount, riskScore, summary, actions, clauses)
- **Limits**: MIN_TEXT_LENGTH=20, MAX_TEXT_LENGTH=12000

### 2. Follow-up Q&A

```
User question → Results page → POST /api/ask
  → getClientIp(req), checkAndConsumeAiRateLimit(ip) [same per-IP limit as analyze]
  → body: question, title, summary, clauses, locale
  → DeepSeekFetch (system + user messages)
  → DeepSeek API
  → { answer }
```

- Context: document summary + key clauses
- Response: 2–3 sentences, plain language, disclaimer to consult a lawyer

### 3. Stats & Ratings

- **GET /api/stats**: Returns `{ totalAnalyses, totalRatings, averageRating, positiveCount }` (requires Redis).
- **POST /api/rate**: Body `{ score: 1–5 }` → `recordRating(score)` (requires Redis).
- **recordAnalysis()**: Called after each successful analysis.

### 4. Rate Limiting

- **Scope**: `POST /api/analyze` and `POST /api/ask` only.
- **Logic**: `lib/ratelimit.ts` — `checkAndConsumeAiRateLimit(ip)` uses Redis key `ratelimit:ai:{ip}:{hour}` with a 1-hour fixed window; max 20 requests per IP per window. Each request increments the counter; first request in window sets TTL.
- **Response**: 429 with `Retry-After` when over limit. When `REDIS_URL` is unset or Redis errors, the function returns `allowed: true` so the request proceeds.

## AI Integration

- **Provider**: DeepSeek (OpenAI-compatible)
- **Config**: `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL` (see `.env.example`)
- **Client**: `openai` SDK with custom `baseURL`
- **Prompts**: `lib/utils.ts` — `getAnalyzeSystemPrompt(locale)` for analysis; inline system prompt for Q&A

## Internationalization (i18n)

- **Locales**: `en`, `zh-CN`
- **Prefix**: Always (`/en/...`, `/zh-CN/...`)
- **Middleware**: `src/proxy.ts` — next-intl middleware, matcher excludes `/api`, `_next`, `_vercel`, static assets
- **Messages**: `messages/{locale}.json`
- **Navigation**: `@/i18n/navigation` — `Link`, `redirect`, `useRouter`, `usePathname` (locale-aware)

## Storage & Privacy

- **Documents**: Not stored. User input and AI output stay in browser `sessionStorage` for the results page.
- **Redis** (env `REDIS_URL`):
  - **Stats**: `stats:analyses` (count), `stats:ratings:count`, `stats:ratings:sum`, `stats:ratings:positive`
  - **Rate limiting**: `ratelimit:ai:{ip}:{hour}` — fixed 1-hour window, max 20 requests per IP; TTL set on first request. When Redis is unavailable, `checkAndConsumeAiRateLimit` returns `allowed: true` (no block).

## Security Headers

Configured in `next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Key Types

```ts
type Risk = "low" | "medium" | "high";

interface Clause {
  title: string;
  summary: string;
  risk: Risk;
  detail: string;
  action?: string;
}

interface AnalysisResult {
  title: string;
  pages: number;
  wordCount: number;
  riskScore: Risk;
  summary: string;
  actions: string[];
  clauses: Clause[];
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LLM_API_URL` | LLM API base URL (e.g. DeepSeek) |
| `LLM_API_KEY` | LLM API key |
| `LLM_MODEL` | Model name (default: DeepSeek-chat) |
| `REDIS_URL` | Redis URL. Required for `/api/stats` and `/api/rate`. Used for rate limiting; if unset, rate limit check allows all requests. |

## Deployment

- **Platform**: Vercel or any Node.js host
- **Build**: `pnpm build` (or `npm run build`)
- **Start**: `pnpm start` (or `npm run start`)
