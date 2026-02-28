# LexPlain

LexPlain is a web app that helps you understand legal documents in plain language. Upload a contract or paste text, and get an AI-powered summary, key clauses, and risk highlights—plus ask follow-up questions about your document.

## Features

- **Document analysis** — Upload a file (PDF, DOC, DOCX, TXT) or paste text. AI summarizes the document, extracts key clauses, and flags risk levels.
- **Plain-language results** — Summary, clause breakdowns, and risk indicators (high/medium/low) in an easy-to-scan report.
- **Ask questions** — After analysis, ask questions about your document and get short, practical answers (with a reminder to consult a lawyer for serious matters).
- **Multi-language** — English and Simplified Chinese (简体中文) via the locale switcher.
- **Privacy-focused** — No document storage; analysis runs on your input and results stay in your session.
- **Rate limiting** — AI endpoints (analyze, ask) are limited per IP per hour (Redis-backed); when Redis is unavailable, requests are allowed.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **UI:** React 19, [Tailwind CSS](https://tailwindcss.com) 4, [lucide-react](https://lucide.dev)
- **i18n:** [next-intl](https://next-intl-docs.vercel.app)
- **AI:** DeepSeek (OpenAI-compatible API) for analysis and Q&A
- **Storage & limits:** Redis for stats, ratings, and per-IP rate limiting (set `REDIS_URL`)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Install and run

```bash
# Install dependencies (pnpm preferred; npm/yarn/bun work too)
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your LLM API credentials and optional REDIS_URL

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm check` | Run Biome check (format + lint) |
| `pnpm release` | Generate changelog and release |

## Project Structure

- `src/app/` — App Router: `[locale]/` (home, results), `api/` (analyze, ask, rate, stats)
- `src/components/` — Reusable UI (ClauseCard, RiskIndicators, RatingWidget, LocaleSwitcher, HeroTypewriter)
- `src/lib/` — Utilities, AI helpers (`utils.ts`), Redis DB (`db.ts`), rate limiting (`ratelimit.ts`)
- `src/types/` — Shared types (Risk, Clause, AnalysisResult)
- `src/i18n/` — next-intl config and messages; `proxy.ts` for locale middleware
- `messages/` — Locale JSON files (en, zh-CN)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture and data flow.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LLM_API_URL` | LLM API base URL (e.g. DeepSeek) |
| `LLM_API_KEY` | LLM API key |
| `LLM_MODEL` | Model name (e.g. DeepSeek-chat) |
| `REDIS_URL` | Optional. Redis for stats, ratings, and per-IP rate limiting (20 AI requests/hour). If unset, stats/rate APIs fail and rate limiting is skipped (requests allowed). |

Copy `.env.example` to `.env` and fill in your credentials.

## Deployment

Deploy to [Vercel](https://vercel.com) or any Node.js platform. See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more.
