"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Upload, FileText, Shield, Zap, Lock, ArrowRight, X, Sparkles,
  TrendingUp, Scale, Home, Briefcase, FileSignature, CheckCircle,
  Star, Users, Clock, AlertTriangle,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
      {/* Background: soft gradient + grid */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] opacity-40" />
      </div>

      <header className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200/50">
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

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pt-10 pb-20">
        <div className="max-w-2xl mx-auto text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur border border-indigo-200/80 text-indigo-600 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
            <Sparkles size={12} />
            {t("badge")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-5 tracking-tight">
            {t("heroTitle")}<br />
            <span className="shimmer-text">{t("heroHighlight")}</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-8 mb-10 animate-fade-in animate-delay-100">
          {[
            { icon: <Users size={14} />, text: t("statsDocs", { count: totalAnalyses.toLocaleString() }) },
            { icon: <Clock size={14} />, text: t("statsTime") },
            { icon: <Star size={14} />, text: t("statsRating", { count: ratingCount.toLocaleString(), rating: averageRating }) },
          ].map((s) => (
            <div key={s.text} className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span className="text-indigo-500">{s.icon}</span>
              {s.text}
            </div>
          ))}
        </div>

        <div className="w-full max-w-2xl animate-slide-up animate-delay-200">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100/40 border border-gray-200/80 overflow-hidden hover:shadow-indigo-200/30 transition-shadow duration-300">
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              {(["file", "text"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${inputMode === mode ? "text-indigo-600 border-b-2 border-indigo-600 bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
                      className={`flex flex-col items-center justify-center gap-5 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${dragging ? "border-indigo-500 bg-indigo-50/80" : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50"}`}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-indigo-200/80 scale-105" : "bg-gray-100"}`}>
                        <Upload size={28} className={dragging ? "text-indigo-600" : "text-gray-400"} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-800 text-sm">
                          {dragging ? t("dropHere") : t("dragDrop")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{t("fileHint")}</p>
                      </div>
                      <span className="text-sm text-indigo-600 font-semibold border border-indigo-200 bg-indigo-50 px-5 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                        {t("browseFiles")}
                      </span>
                      <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileInput} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 p-5 bg-indigo-50/80 border border-indigo-100 rounded-2xl">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-indigo-600 mt-0.5 font-medium">{t("readyToAnalyze")}</p>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div className="mt-5">
                    <p className="text-xs text-gray-500 font-medium mb-2.5">{t("popularTypes")}</p>
                    <div className="flex flex-wrap gap-2">
                      {DOC_TYPES.map((d) => (
                        <button
                          key={d.labelKey}
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
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
                  className="w-full h-44 rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 focus:bg-white transition-all"
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
                className="mt-5 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 disabled:shadow-none"
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

              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                <Lock size={12} />
                {t("privacyNote")}
              </p>
            </div>
          </div>
        </div>

        <div id="how" className="max-w-2xl w-full mx-auto mt-16 animate-fade-in animate-delay-300">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">{tCommon("howItWorks")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.label} className="text-center p-5 rounded-2xl bg-white/80 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                  {s.icon}
                </div>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 animate-fade-in animate-delay-400">
          {[
            { icon: <Shield size={14} />, text: t("trustAPI") },
            { icon: <Zap size={14} />, text: t("trustJoyAI") },
            { icon: <Scale size={14} />, text: t("trustDisclaimer") },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-indigo-500">{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>
      </main>
      <RatingWidget />
    </div>
  );
}
