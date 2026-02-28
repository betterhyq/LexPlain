"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common");
  return (
    <footer className="relative z-10 mt-auto py-6 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm print:hidden">
      <div className="max-w-6xl mx-auto px-4 flex justify-center">
        <p className="text-xs text-zinc-400 tracking-tight">
          <span className="font-semibold text-zinc-600">
            {t("footerCredits")}
          </span>
        </p>
      </div>
    </footer>
  );
}
