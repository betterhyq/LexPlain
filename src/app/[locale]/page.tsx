"use client";

import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Clock,
  FileSignature,
  FileText,
  Home,
  ListChecks,
  Lock,
  Scale,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { HeroTypewriter } from "@/components/HeroTypewriter";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { RatingWidget } from "@/components/RatingWidget";
import { useRouter } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const locale = useLocale();

  const DOC_TYPES = [
    { icon: <FileSignature size={16} />, labelKey: "nda" as const },
    { icon: <Home size={16} />, labelKey: "lease" as const },
    { icon: <Briefcase size={16} />, labelKey: "employment" as const },
    { icon: <Scale size={16} />, labelKey: "settlement" as const },
    { icon: <TrendingUp size={16} />, labelKey: "investment" as const },
  ];

  const STEPS = [
    {
      icon: <Upload size={18} />,
      label: t("stepUpload"),
      desc: t("stepUploadDesc"),
    },
    { icon: <Zap size={18} />, label: t("stepAI"), desc: t("stepAIDesc") },
    {
      icon: <CheckCircle size={18} />,
      label: t("stepResult"),
      desc: t("stepResultDesc"),
    },
  ];

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalAnalyses: number;
    totalRatings: number;
    averageRating: number;
    positiveCount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStats(data))
      .catch(() => {});
  }, []);

  const totalAnalyses = stats?.totalAnalyses ?? 12400;
  const ratingCount = stats?.totalRatings ?? 800;
  const averageRating = stats?.averageRating ?? 4.9;

  const canAnalyze =
    (inputMode === "file" && !!file) ||
    (inputMode === "text" && pasteText.trim().length > 20);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setInputMode("file");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setInputMode("file");
    }
  };

  const readFileText = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(f);
    });

  const handleSubmit = async () => {
    if (!canAnalyze || loading) return;
    setError(null);
    setLoading(true);

    try {
      const text =
        inputMode === "file" && file ? await readFileText(file) : pasteText;

      const filename = inputMode === "file" && file ? file.name : "Pasted text";

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message =
          res.status === 429 && data.error === "RATE_LIMITED"
            ? data.retryAfter
              ? tErrors("rateLimitedRetry", { seconds: data.retryAfter })
              : tErrors("rateLimited")
            : data.error || "Analysis failed";
        throw new Error(message);
      }

      sessionStorage.setItem("lexplain_result", JSON.stringify(data));
      sessionStorage.setItem("lexplain_filename", filename);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors("generic"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f9fafb] flex flex-col relative overflow-hidden">
      {/* Background: neutral gradient + grid (fixed, no repaint on scroll) */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-white to-zinc-50/90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black_35%,transparent_100%)] opacity-25" />
      </div>

      <header className="relative z-10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(5,150,105,0.22)] ring-1 ring-black/5">
              <FileText size={18} className="text-white" strokeWidth={2} />
            </div>
            <button
              type="button"
              className="font-bold text-zinc-900 text-lg tracking-tight cursor-pointer select-none bg-transparent border-none p-0"
              onClick={() => router.push("/")}
            >
              {tCommon("appName")}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-4 pt-10 pb-20">
        <div className="max-w-6xl mx-auto w-full mb-10 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-3 text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-emerald-200/60 text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_4px_12px_-2px_rgba(0,0,0,0.06)]">
                <Sparkles size={12} strokeWidth={2} />
                {t("badge")}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 leading-[1.12] mb-5 tracking-tighter max-w-[28ch]">
                {t("heroTitle")}
                <HeroTypewriter
                  text={t("heroHighlight")}
                  typeSpeed={120}
                  startDelay={320}
                  className="hero-accent"
                />
              </h1>
              <p className="text-base text-zinc-600 leading-relaxed max-w-[65ch] md:text-lg animate-fade-in animate-delay-300">
                {t("heroSubtitle")}
              </p>
            </div>
            <div className="lg:col-span-2 hidden lg:block" aria-hidden />
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center gap-x-8 gap-y-3 mb-12 animate-fade-in animate-delay-100">
          {[
            {
              icon: <Users size={14} strokeWidth={1.8} />,
              text: t("statsDocs", { count: totalAnalyses.toLocaleString() }),
            },
            {
              icon: <Clock size={14} strokeWidth={1.8} />,
              text: t("statsTime"),
            },
            {
              icon: <Star size={14} strokeWidth={1.8} />,
              text: t("statsRating", {
                count: ratingCount.toLocaleString(),
                rating: averageRating,
              }),
            },
          ].map((s) => (
            <div
              key={s.text}
              className="hidden sm:flex items-center gap-2.5 text-sm text-zinc-500 tabular-nums"
            >
              <span className="text-emerald-600/90">{s.icon}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto w-full animate-slide-up animate-delay-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-glass-hover)] transition-shadow duration-300 ease-[var(--ease-out-expo)]">
                <div className="flex border-b border-slate-100 bg-slate-50/40">
                  {(["file", "text"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setInputMode(mode)}
                      className={`flex-1 py-3.5 text-sm font-semibold transition-[color,box-shadow,background] duration-200 ease-[var(--ease-out-expo)] ${inputMode === mode ? "text-emerald-600 border-b-2 border-emerald-600 bg-white shadow-[0_1px_0_0_rgba(255,255,255,0.8)_inset]" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                      {mode === "file" ? t("tabFile") : t("tabText")}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-8 lg:p-10">
                  {inputMode === "file" ? (
                    <>
                      {!file ? (
                        <label
                          htmlFor="file-upload"
                          className={`flex flex-col items-center justify-center gap-5 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ease-[var(--ease-out-expo)] focus-within:ring-2 focus-within:ring-emerald-400/40 focus-within:border-emerald-400 ${dragging ? "border-emerald-500 bg-emerald-50/80" : "border-slate-200 hover:border-emerald-400/80 hover:bg-emerald-50/50"}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                          }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={handleDrop}
                        >
                          <div
                            className={`w-16 h-16 rounded-lg flex items-center justify-center transition-transform duration-300 ease-[var(--ease-out-expo)] ${dragging ? "bg-emerald-200/80 scale-105" : "bg-slate-100"}`}
                          >
                            <Upload
                              size={28}
                              strokeWidth={1.8}
                              className={
                                dragging ? "text-emerald-600" : "text-slate-400"
                              }
                            />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-zinc-800 text-sm">
                              {dragging ? t("dropHere") : t("dragDrop")}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {t("fileHint")}
                            </p>
                          </div>
                          <span className="text-sm text-emerald-600 font-semibold border border-emerald-200/80 bg-emerald-50 px-5 py-2 rounded-lg hover:bg-emerald-100/80 transition-colors duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98]">
                            {t("browseFiles")}
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileInput}
                          />
                        </label>
                      ) : (
                        <div className="flex items-center gap-4 p-5 bg-emerald-50/70 border border-emerald-100/80 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]">
                          <div className="w-12 h-12 bg-emerald-100/90 rounded-lg flex items-center justify-center shrink-0">
                            <FileText
                              size={20}
                              strokeWidth={1.8}
                              className="text-emerald-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-900 text-sm truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-emerald-600 mt-0.5 font-medium">
                              {t("readyToAnalyze")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-slate-200/60 rounded-lg transition-colors duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98]"
                            aria-label={tCommon("remove")}
                          >
                            <X size={18} strokeWidth={2} />
                          </button>
                        </div>
                      )}

                      <div className="mt-5">
                        <p className="text-xs text-zinc-500 font-medium mb-2.5">
                          {t("popularTypes")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {DOC_TYPES.map((d) => (
                            <button
                              key={d.labelKey}
                              type="button"
                              className="flex items-center gap-1.5 text-xs text-zinc-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                            >
                              {d.icon} {t(`docTypes.${d.labelKey}`)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={t("pastePlaceholder")}
                      className="w-full h-44 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm text-zinc-700 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 focus:bg-white transition-[border-color,box-shadow,background] duration-200 ease-[var(--ease-out-expo)]"
                    />
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50/90 border border-red-200/80 rounded-lg text-sm text-red-800 flex items-start gap-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                      <AlertTriangle
                        size={16}
                        strokeWidth={1.8}
                        className="shrink-0 mt-0.5 text-red-600"
                      />
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canAnalyze || loading}
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-[0_4px_14px_-2px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_-2px_rgba(5,150,105,0.35)] disabled:shadow-none transition-[transform,background,box-shadow] duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("analyzing")}
                      </>
                    ) : (
                      <>
                        {t("analyzeDocument")} <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-zinc-500 mt-5 flex items-center justify-center gap-1.5">
                    <Lock size={12} strokeWidth={1.8} />
                    {t("privacyNote")}
                  </p>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 flex flex-col animate-slide-up animate-delay-300">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                {tCommon("howItWorks")}
              </p>
              <ul className="space-y-0 divide-y divide-slate-100 rounded-xl bg-white p-6 md:p-8 shadow-[var(--shadow-glass)]">
                {STEPS.map((step) => (
                  <li
                    key={step.label}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]">
                      {step.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 text-sm">
                        {step.label}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-8 mb-4">
                {t("whatYouGet")}
              </p>
              <ul className="space-y-3">
                {[
                  {
                    icon: <FileText size={16} strokeWidth={1.8} />,
                    label: t("outcomeSummary"),
                  },
                  {
                    icon: <ListChecks size={16} strokeWidth={1.8} />,
                    label: t("outcomeClauses"),
                  },
                  {
                    icon: <AlertTriangle size={16} strokeWidth={1.8} />,
                    label: t("outcomeRisks"),
                  },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 text-sm text-zinc-700"
                  >
                    <span className="text-emerald-600/90 shrink-0">
                      {item.icon}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <RatingWidget />
    </div>
  );
}
