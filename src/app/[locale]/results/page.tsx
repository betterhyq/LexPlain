"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  FileText, AlertTriangle, CheckCircle, Shield,
  Download, MessageSquare, Scale,
} from "lucide-react";
import { AnalysisResult } from "@/types";
import { RiskCircle } from "@/components/RiskIndicators";
import { ClauseCard } from "@/components/ClauseCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function ResultsPage() {
  const t = useTranslations("results");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const locale = useLocale();

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filename, setFilename] = useState("Your document");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("lexplain_result");
    const name = sessionStorage.getItem("lexplain_filename");
    if (!stored) { router.push("/"); return; }
    setResult(JSON.parse(stored));
    if (name) setFilename(name);
  }, [router]);

  const handleAsk = async () => {
    if (!question.trim() || asking || !result) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          title: result.title,
          summary: result.summary,
          clauses: result.clauses,
          locale,
        }),
      });
      const data = await res.json();
      setAnswer(data.answer || data.error || tErrors("noAnswer"));
    } catch {
      setAnswer(tErrors("generic"));
    } finally {
      setAsking(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-[100dvh] bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">{t("loadingReport")}</p>
        </div>
      </div>
    );
  }

  const highRisk = result.clauses.filter((c) => c.risk === "high").length;
  const medRisk  = result.clauses.filter((c) => c.risk === "medium").length;
  const lowRisk  = result.clauses.filter((c) => c.risk === "low").length;

  const handleExportPdf = () => window.print();

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] print:bg-white">
      <header className="print:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(5,150,105,0.25)]">
              <FileText size={18} className="text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-lg tracking-tight cursor-pointer" onClick={() => router.push("/")}>{tCommon("appName")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <button
              type="button"
              onClick={handleExportPdf}
              className="print:hidden text-sm text-zinc-500 hover:text-emerald-600 flex items-center gap-2 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-emerald-50/50 active:scale-[0.98]"
            >
              <Download size={16} /> {t("exportPdf")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-emerald-600 font-semibold border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors active:scale-[0.98]"
            >
              {t("newDocument")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 md:p-8 animate-fade-in shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-emerald-600" />
            <span className="text-sm text-zinc-500 font-medium">{filename}</span>
            <span className="text-zinc-300">·</span>
            <span className="text-sm text-zinc-500">{result.pages} {t("pages")}</span>
            <span className="text-zinc-300">·</span>
            <span className="text-sm text-zinc-500">{result.wordCount.toLocaleString()} {t("words")}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-6 leading-snug">{result.title}</h1>
          <RiskCircle risk={result.riskScore} />
          <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100">
            {[
              { count: highRisk, labelKey: "highRisk" as const, color: "text-red-600", dot: "bg-red-400" },
              { count: medRisk, labelKey: "mediumRisk" as const, color: "text-amber-600", dot: "bg-amber-400" },
              { count: lowRisk, labelKey: "lowRisk" as const, color: "text-emerald-600", dot: "bg-emerald-400" },
            ].map((s) => (
              <div key={s.labelKey} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`text-sm font-bold ${s.color}`}>{s.count}</span>
                <span className="text-xs text-zinc-400">{t(s.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {highRisk > 0 && (
          <div className="bg-red-50/90 border border-red-200 rounded-[2.5rem] p-5 flex items-start gap-4 animate-fade-in animate-delay-100 shadow-sm">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 text-sm">
                {t("highRiskAlert", { count: highRisk })}
              </p>
              <p className="text-red-600/90 text-sm mt-1 leading-relaxed">
                {t("highRiskDesc")}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 md:p-8 animate-fade-in animate-delay-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
          <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2.5 text-base">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            {t("plainSummary")}
          </h2>
          <p className="text-zinc-700 leading-relaxed">{result.summary}</p>
        </div>

        {result.actions?.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-[2.5rem] p-6 md:p-8 animate-fade-in animate-delay-200 shadow-sm">
            <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2.5 text-base">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              {t("whatToDo")}
            </h2>
            <ul className="space-y-3">
              {result.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="animate-fade-in animate-delay-300">
          <h2 className="font-bold text-zinc-900 mb-4 text-base flex items-center gap-2.5">
            <Scale size={18} className="text-emerald-600" />
            {t("keyClauses")} ({result.clauses.length})
          </h2>
          <div className="flex flex-col gap-3">
            {result.clauses.map((clause, i) => (
              <ClauseCard key={clause.title} clause={clause} index={i} />
            ))}
          </div>
        </div>

        <div className="print:hidden bg-white rounded-[2.5rem] border border-slate-200/60 p-6 md:p-8 animate-fade-in animate-delay-400 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MessageSquare size={16} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-zinc-900 text-base">{t("askTitle")}</h2>
          </div>
          <p className="text-sm text-zinc-500 mb-4 ml-10">
            {t("askHint")}
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={t("askPlaceholder")}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 bg-slate-50/80 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all min-w-[72px] shadow-[0_4px_14px_-2px_rgba(5,150,105,0.3)] active:scale-[0.98]"
            >
              {asking ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t("ask")
              )}
            </button>
          </div>
          {answer && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm text-emerald-900 leading-relaxed">
              {answer}
            </div>
          )}
        </div>

        <p className="print:hidden text-center text-sm text-zinc-500 pb-2 flex items-center justify-center gap-1.5">
          {t("exportHint")}
        </p>
        <p className="text-center text-xs text-zinc-400 pb-4 flex items-center justify-center gap-1 print:text-zinc-600 print:pt-6">
          <Shield size={10} />
          {t("legalDisclaimer")}
        </p>
      </main>
    </div>
  );
}
