"use client";

import { useTranslations } from "next-intl";
import type { Risk } from "@/types";

const VALID_RISKS: Risk[] = ["low", "medium", "high"];

function normalizeRisk(risk: unknown): Risk {
  if (typeof risk === "string" && VALID_RISKS.includes(risk as Risk)) {
    return risk as Risk;
  }
  return "medium";
}

export function RiskBadge({ risk }: { risk: Risk }) {
  const t = useTranslations("risk");
  const config = {
    low: {
      label: t("lowRiskFull"),
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    medium: {
      label: t("mediumRiskFull"),
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    high: {
      label: t("highRiskFull"),
      cls: "bg-red-100 text-red-700 border border-red-200",
    },
  };
  const riskKey = normalizeRisk(risk);
  const { label, cls } = config[riskKey];
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

export function RiskCircle({ risk }: { risk: Risk }) {
  const t = useTranslations("risk");
  const map = {
    low: {
      pct: 25,
      color: "#10b981",
      label: t("lowRiskFull"),
      sub: t("lowSub"),
    },
    medium: {
      pct: 60,
      color: "#f59e0b",
      label: t("mediumRiskFull"),
      sub: t("mediumSub"),
    },
    high: {
      pct: 90,
      color: "#ef4444",
      label: t("highRiskFull"),
      sub: t("highSub"),
    },
  };
  const riskKey = normalizeRisk(risk);
  const { pct, color, label, sub } = map[riskKey];
  const r = 36,
    circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex items-center gap-5 animate-scale-in">
      <div className="relative w-28 h-28 shrink-0">
        <svg
          className="w-28 h-28 -rotate-90"
          viewBox="0 0 88 88"
          role="img"
          aria-label={`Risk score: ${pct}%`}
        >
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-extrabold tabular-nums"
            style={{ color }}
          >
            {pct}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          {label}
        </p>
        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{sub}</p>
      </div>
    </div>
  );
}
