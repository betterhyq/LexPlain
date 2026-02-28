"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Upload, FileText, Shield, Zap, Lock, ArrowRight, X, Sparkles,
  TrendingUp, Scale, Home, Briefcase, FileSignature, CheckCircle,
  Star, Users, Clock, AlertTriangle, ListChecks,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Footer } from "@/components/Footer";
import { RatingWidget } from "@/components/RatingWidget";

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
    { icon: <Upload size={18} />, label: t("stepUpload"), desc: t("stepUploadDesc") },
    { icon: <Zap size={18} />, label: t("stepAI"), desc: t("stepAIDesc") },
    { icon: <CheckCircle size={18} />, label: t("stepResult"), desc: t("stepResultDesc") },
  ];

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalAnalyses: number; totalRatings: number; averageRating: number; positiveCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.ok ? res.json() : null)
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
    if (f) { setFile(f); setInputMode("file"); }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setInputMode("file"); }
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
      const text = inputMode === "file" && file
        ? await readFileText(file)
        : pasteText;

      const filename = inputMode === "file" && file ? file.name : "Pasted text";

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      sessionStorage.setItem("lexplain_result", JSON.stringify(data));
      sessionStorage.setItem("lexplain_filename", filename);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors("generic"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] flex flex-col relative overflow-hidden">
      {/* Background: neutral gradient + grid (no purple) */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white to-zinc-50/80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] opacity-30" />
      </div>

      <header className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(5,150,105,0.25)]">
              <FileText size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight cursor-pointer" onClick={() => router.push("/")}>{tCommon("appName")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500">
              {tCommon("freeNoLogin")}
            </span>
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-4 pt-10 pb-20">
        <div className="max-w-6xl mx-auto w-full mb-10 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-3 text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur border border-emerald-200/80 text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
                <Sparkles size={12} />
                {t("badge")}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 leading-[1.15] mb-5 tracking-tight max-w-[28ch]">
                {t("heroTitle")}
                <span className="hero-accent">{t("heroHighlight")}</span>
              </h1>
              <p className="text-zinc-600 text-lg md:text-xl leading-relaxed max-w-[42ch]">
                {t("heroSubtitle")}
              </p>
            </div>
            <div className="lg:col-span-2 hidden lg:block" aria-hidden />
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex items-center gap-8 mb-10 animate-fade-in animate-delay-100">
          {[
            { icon: <Users size={14} />, text: t("statsDocs", { count: totalAnalyses.toLocaleString() }) },
            { icon: <Clock size={14} />, text: t("statsTime") },
            { icon: <Star size={14} />, text: t("statsRating", { count: ratingCount.toLocaleString(), rating: averageRating }) },
          ].map((s) => (
            <div key={s.text} className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
              <span className="text-emerald-600">{s.icon}</span>
              {s.text}
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto w-full animate-slide-up animate-delay-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.08)] transition-shadow duration-300">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {(["file", "text"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${inputMode === mode ? "text-emerald-600 border-b-2 border-emerald-600 bg-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  {mode === "file" ? t("tabFile") : t("tabText")}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {inputMode === "file" ? (
                <>
                  {!file ? (
                    <label
                      htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center gap-5 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${dragging ? "border-emerald-500 bg-emerald-50/80" : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50"}`}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-emerald-200/80 scale-105" : "bg-slate-100"}`}>
                        <Upload size={28} className={dragging ? "text-emerald-600" : "text-slate-400"} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-zinc-800 text-sm">
                          {dragging ? t("dropHere") : t("dragDrop")}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{t("fileHint")}</p>
                      </div>
                      <span className="text-sm text-emerald-600 font-semibold border border-emerald-200 bg-emerald-50 px-5 py-2 rounded-xl hover:bg-emerald-100 transition-colors active:scale-[0.98]">
                        {t("browseFiles")}
                      </span>
                      <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileInput} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 p-5 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-emerald-600 mt-0.5 font-medium">{t("readyToAnalyze")}</p>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-slate-200/60 rounded-lg transition-colors active:scale-[0.98]">
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div className="mt-5">
                    <p className="text-xs text-zinc-500 font-medium mb-2.5">{t("popularTypes")}</p>
                    <div className="flex flex-wrap gap-2">
                      {DOC_TYPES.map((d) => (
                        <button
                          key={d.labelKey}
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-zinc-600 border border-slate-200 rounded-xl px-3 py-1.5 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors active:scale-[0.98]"
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
                  className="w-full h-44 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm text-zinc-700 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 focus:bg-white transition-all"
                />
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canAnalyze || loading}
                className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm shadow-[0_4px_14px_-2px_rgba(5,150,105,0.35)] hover:shadow-[0_6px_20px_-2px_rgba(5,150,105,0.4)] disabled:shadow-none active:scale-[0.98]"
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

              <p className="text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1.5">
                <Lock size={12} />
                {t("privacyNote")}
              </p>
            </div>
              </div>
            </div>

            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 md:p-8">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">
                  {tCommon("howItWorks")}
                </p>
                <ul className="space-y-5">
                  {STEPS.map((step) => (
                    <li key={step.label} className="flex gap-4">
                      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                        {step.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{step.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    {t("whatYouGet")}
                  </p>
                  <ul className="space-y-3">
                    {[
                      { icon: <FileText size={16} />, label: t("outcomeSummary") },
                      { icon: <ListChecks size={16} />, label: t("outcomeClauses") },
                      { icon: <AlertTriangle size={16} />, label: t("outcomeRisks") },
                    ].map((item) => (
                      <li key={item.label} className="flex items-center gap-3 text-sm text-zinc-700">
                        <span className="text-emerald-600 shrink-0">{item.icon}</span>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <RatingWidget />
    </div>
  );
}
