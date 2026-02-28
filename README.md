# LexPlain

LexPlain is a web app that helps you understand legal documents in plain language. Upload a contract or paste text, and get an AI-powered summary, key clauses, and risk highlights—plus ask follow-up questions about your document.

## Features

- **Document analysis** — Upload a file (PDF, DOC, DOCX, TXT) or paste text. AI summarizes the document, extracts key clauses, and flags risk levels.
- **Plain-language results** — Summary, clause breakdowns, and risk indicators (high/medium/low) in an easy-to-scan report.
- **Ask questions** — After analysis, ask questions about your document and get short, practical answers (with a reminder to consult a lawyer for serious matters).
- **Multi-language** — English and Simplified Chinese (简体中文) via the locale switcher.
- **Privacy-focused** — No document storage; analysis runs on your input and results stay in your session.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **UI:** React 19, [Tailwind CSS](https://tailwindcss.com) 4, [lucide-react](https://lucide.dev)
- **i18n:** [next-intl](https://next-intl-docs.vercel.app)
- **AI:** JoyAI for analysis and Q&A

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Install and run

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Project structure

- `src/app/` — App Router: `[locale]/` (home, results), `api/` (analyze, ask, rate, stats)
- `src/components/` — Reusable UI (e.g. ClauseCard, RiskIndicators, RatingWidget, LocaleSwitcher)
- `src/lib/` — Utilities, AI helpers, DB (e.g. sql.js for stats)
- `src/i18n/` — next-intl config and messages

## Environment

Ensure any required environment variables for the AI backend (e.g. JoyAI) are set before running. See `.env.example` or project config for details.

## Deploy

You can deploy the Next.js app to [Vercel](https://vercel.com) or any platform that supports Node.js. See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more.

## License

Private.
