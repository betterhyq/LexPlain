# LexPlain Architecture

This document describes the architecture of LexPlain, a web app that helps users understand legal documents in plain language using AI-powered analysis.

## Overview

LexPlain is a Next.js 16 application with App Router, supporting English and Simplified Chinese. Users can upload documents or paste text, receive AI-generated summaries and risk analysis, and ask follow-up questions. No document storage—analysis runs on input and results stay in the session.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, lucide-react |
| i18n | next-intl |
| AI | JoyAI (OpenAI-compatible API via `openai` SDK) |
| Storage | sql.js (SQLite in-memory/file for stats) |

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
│   │   ├── db.ts               # sql.js: stats, recordAnalysis, recordRating
│   │   └── utils.ts            # cn, prompts, JoyAIFetch, parseJoyAIJson
│   ├── types/
│   │   ├── index.ts            # Risk, Clause, AnalysisResult
│   │   └── sql.js.d.ts
│   └── proxy.ts                # next-intl middleware (locale routing)
├── messages/
│   ├── en.json
│   └── zh-CN.json
├── data/                       # sql.js DB file (lexplain.db)
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Data Flow

### 1. Document Analysis

```
User (file/text) → Home page → POST /api/analyze
  → lib/utils: getAnalyzeSystemPrompt, JoyAIFetch
  → JoyAI API (LLM)
  → parseJoyAIJson → AnalysisResult
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
  → body: question, title, summary, clauses, locale
  → JoyAIFetch (system + user messages)
  → JoyAI API
  → { answer }
```

- Context: document summary + key clauses
- Response: 2–3 sentences, plain language, disclaimer to consult a lawyer

### 3. Stats & Ratings

- **GET /api/stats**: Returns `{ totalAnalyses, totalRatings, averageRating, positiveCount }`
- **POST /api/rate**: Body `{ score: 1–5 }` → `recordRating(score)`
- **recordAnalysis()**: Called after each successful analysis

## AI Integration

- **Provider**: JoyAI (OpenAI-compatible)
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
- **Stats DB**: sql.js SQLite at `data/lexplain.db`
  - `analyses`: `id`, `created_at`
  - `ratings`: `id`, `score`, `created_at`

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
| `LLM_API_URL` | JoyAI API base URL |
| `LLM_API_KEY` | JoyAI API key |
| `LLM_MODEL` | Model name (default: JoyAI-chat) |

## Deployment

- **Platform**: Vercel or any Node.js host
- **Build**: `pnpm build` / `npm run build`
- **Start**: `pnpm start` / `npm run start`
