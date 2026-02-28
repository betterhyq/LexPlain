"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Upload, FileText, Shield, Zap, Lock, ArrowRight, X, Sparkles,
  TrendingUp, Scale, Home, Briefcase, FileSignature, CheckCircle,
  Star, Users, Clock,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function HomePage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const router = useRouter();

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
        body: JSON.stringify({ text }),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{tCommon("appName")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#how" className="hover:text-gray-800 transition-colors">{tCommon("howItWorks")}</a>
            <a href="#" className="hover:text-gray-800 transition-colors">{tCommon("pricing")}</a>
            <a href="#" className="hover:text-gray-800 transition-colors">{tCommon("forTeams")}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <button className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors hidden sm:block">
              {tCommon("signIn")}
            </button>
            <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              {tCommon("getStartedFree")}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 bg-white/80 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-5 shadow-sm">
            <Sparkles size={11} />
            {t("badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            {t("heroTitle")}<br />
            <span className="shimmer-text">{t("heroHighlight")}</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-lg mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-6 mb-8 animate-fade-in animate-delay-100">
          {[
            { icon: <Users size={13} />, text: t("statsDocs") },
            { icon: <Clock size={13} />, text: t("statsTime") },
            { icon: <Star size={13} />, text: t("statsRating") },
          ].map((s) => (
            <div key={s.text} className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <span className="text-indigo-400">{s.icon}</span>
              {s.text}
            </div>
          ))}
        </div>

        <div className="w-full max-w-xl animate-slide-up animate-delay-200">
          <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(["file", "text"] as const).map((mode) => (
                <button key={mode} onClick={() => setInputMode(mode)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${inputMode === mode ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
                  {mode === "file" ? t("tabFile") : t("tabText")}
                </button>
              ))}
            </div>

            <div className="p-6">
              {inputMode === "file" ? (
                <>
                  {!file ? (
                    <label htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40"}`}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-indigo-100" : "bg-gray-100"}`}>
                        <Upload size={24} className={dragging ? "text-indigo-600" : "text-gray-400"} />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-700 text-sm">
                          {dragging ? t("dropHere") : t("dragDrop")}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{t("fileHint")}</p>
                      </div>
                      <span className="text-sm text-indigo-600 font-semibold border border-indigo-200 bg-indigo-50 px-4 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                        {t("browseFiles")}
                      </span>
                      <input id="file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileInput} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{t("readyToAnalyze")}</p>
                      </div>
                      <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">{t("popularTypes")}</p>
                    <div className="flex flex-wrap gap-2">
                      {DOC_TYPES.map((d) => (
                        <button key={d.labelKey}
                          className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                          {d.icon} {t(`docTypes.${d.labelKey}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                  placeholder={t("pastePlaceholder")}
                  className="w-full h-44 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
              )}

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={!canAnalyze || loading}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("analyzing")}
                  </>
                ) : (
                  <>{t("analyzeDocument")} <ArrowRight size={16} /></>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={10} />
                {t("privacyNote")}
              </p>
            </div>
          </div>
        </div>

        <div id="how" className="max-w-xl w-full mx-auto mt-12 animate-fade-in animate-delay-300">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">{tCommon("howItWorks")}</p>
          <div className="grid grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-2 text-indigo-500">
                  {s.icon}
                </div>
                <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 animate-fade-in animate-delay-400">
          {[
            { icon: <Shield size={13} />, text: t("trustAPI") },
            { icon: <Zap size={13} />, text: t("trustDeepSeek") },
            { icon: <Scale size={13} />, text: t("trustDisclaimer") },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="text-indigo-400">{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
