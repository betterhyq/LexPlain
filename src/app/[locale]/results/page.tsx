"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  FileText, AlertTriangle, CheckCircle, Shield, ArrowRight,
  Download, MessageSquare, Sparkles, Scale,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const highRisk = result.clauses.filter((c) => c.risk === "high").length;
  const medRisk  = result.clauses.filter((c) => c.risk === "medium").length;
  const lowRisk  = result.clauses.filter((c) => c.risk === "low").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">{tCommon("appName")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <button className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
              <Download size={13} /> {t("exportPdf")}
            </button>
            <button
              onClick={() => router.push("/")}
              className="text-xs text-indigo-600 font-semibold border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {t("newDocument")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={14} className="text-indigo-400" />
            <span className="text-xs text-gray-400 font-medium">{filename}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{result.pages} {t("pages")}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{result.wordCount.toLocaleString()} {t("words")}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-5">{result.title}</h1>
          <RiskCircle risk={result.riskScore} />
          <div className="flex gap-4 mt-5 pt-5 border-t border-gray-100">
            {[
              { count: highRisk, labelKey: "highRisk" as const, color: "text-red-600", dot: "bg-red-400" },
              { count: medRisk, labelKey: "mediumRisk" as const, color: "text-amber-600", dot: "bg-amber-400" },
              { count: lowRisk, labelKey: "lowRisk" as const, color: "text-emerald-600", dot: "bg-emerald-400" },
            ].map((s) => (
              <div key={s.labelKey} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`text-sm font-bold ${s.color}`}>{s.count}</span>
                <span className="text-xs text-gray-400">{t(s.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {highRisk > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in animate-delay-100">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800 text-sm">
                {t("highRiskAlert", { count: highRisk })}
              </p>
              <p className="text-red-600 text-sm mt-0.5 leading-relaxed">
                {t("highRiskDesc")}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in animate-delay-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
              <CheckCircle size={12} className="text-indigo-600" />
            </div>
            {t("plainSummary")}
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm">{result.summary}</p>
        </div>

        {result.actions?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 animate-fade-in animate-delay-200 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <div className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center">
                <AlertTriangle size={12} className="text-amber-600" />
              </div>
              {t("whatToDo")}
            </h2>
            <ul className="space-y-2">
              {result.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="animate-fade-in animate-delay-300">
          <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <Scale size={14} className="text-indigo-500" />
            {t("keyClauses")} ({result.clauses.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {result.clauses.map((clause, i) => (
              <ClauseCard key={clause.title} clause={clause} index={i} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in animate-delay-400 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
              <MessageSquare size={12} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">{t("askTitle")}</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-7">
            {t("askHint")}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={t("askPlaceholder")}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition-all"
            />
            <button onClick={handleAsk} disabled={asking || !question.trim()}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors min-w-[60px]">
              {asking ? "…" : t("ask")}
            </button>
          </div>
          {answer && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-900 leading-relaxed">
              {answer}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                <Sparkles size={10} /> {t("proFeature")}
              </div>
              <p className="font-bold text-lg leading-snug mb-1">{t("getPdfReport")}</p>
              <p className="text-indigo-200 text-sm leading-relaxed">
                {t("pdfReportDesc")}
              </p>
              <button className="mt-4 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm inline-flex items-center gap-2">
                {t("upgradePro")}
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="hidden sm:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center shrink-0">
              <Download size={28} className="text-white/70" />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4 flex items-center justify-center gap-1">
          <Shield size={10} />
          {t("legalDisclaimer")}
        </p>
      </main>
    </div>
  );
}
