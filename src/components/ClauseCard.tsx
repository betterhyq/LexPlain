"use client";

import { useState, memo } from "react";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Clause, Risk } from "@/types";
import { RiskBadge } from "./RiskIndicators";

function ClauseCardInner({ clause, index }: { clause: Clause; index: number }) {
  const [open, setOpen] = useState(false);
  const risk = clause.risk as Risk;

  const borderColor = { low: "border-l-emerald-400", medium: "border-l-amber-400", high: "border-l-red-400" }[risk];
  const bgColor     = { low: "bg-white", medium: "bg-amber-50/40", high: "bg-red-50/40" }[risk];
  const icon =
    risk === "low"
      ? <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
      : <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${risk === "high" ? "text-red-500" : "text-amber-500"}`} />;

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 border-l-4 ${borderColor} ${bgColor} shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        type="button"
        className="w-full flex items-start justify-between p-4 md:p-5 text-left gap-3 rounded-2xl hover:bg-slate-50/50 transition-colors active:scale-[0.995]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-900 text-sm md:text-base">{clause.title}</p>
            <p className="text-zinc-500 text-sm mt-0.5 leading-snug">{clause.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge risk={risk} />
          {open
            ? <ChevronUp size={18} className="text-zinc-400" />
            : <ChevronDown size={18} className="text-zinc-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 ml-7 md:ml-8 space-y-3 animate-fade-in">
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 text-sm text-zinc-700 leading-relaxed">
            {clause.detail}
          </div>
          {clause.action && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <ArrowRight size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 font-medium">{clause.action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const ClauseCard = memo(ClauseCardInner);
