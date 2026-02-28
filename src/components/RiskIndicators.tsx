"use client";

import { useTranslations } from "next-intl";
import { Risk } from "@/types";

export function RiskBadge({ risk }: { risk: Risk }) {
  const t = useTranslations("risk");
  const config = {
    low:    { label: t("lowRiskFull"),   cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    medium: { label: t("mediumRiskFull"), cls: "bg-amber-100 text-amber-700 border border-amber-200" },
    high:   { label: t("highRiskFull"),  cls: "bg-red-100 text-red-700 border border-red-200" },
  };
  const { label, cls } = config[risk];
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

export function RiskCircle({ risk }: { risk: Risk }) {
  const t = useTranslations("risk");
  const map = {
    low:    { pct: 25, color: "#10b981", label: t("lowRiskFull"),    sub: t("lowSub") },
    medium: { pct: 60, color: "#f59e0b", label: t("mediumRiskFull"), sub: t("mediumSub") },
    high:   { pct: 90, color: "#ef4444", label: t("highRiskFull"),   sub: t("highSub") },
  };
  const { pct, color, label, sub } = map[risk];
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
