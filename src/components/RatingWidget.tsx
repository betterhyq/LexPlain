"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, X } from "lucide-react";

export function RatingWidget() {
  const t = useTranslations("home");
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (selected < 1 || selected > 5 || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: selected }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <span className="text-sm font-medium text-emerald-700">{t("ratingThanks")}</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm hover:border-emerald-300 hover:shadow-emerald-100/50 transition-all active:scale-[0.98]"
        aria-label={t("ratingTitle")}
      >
        <Star size={18} className="text-amber-500 fill-amber-500" />
        <span className="text-sm font-semibold text-zinc-700">{t("ratingTitle")}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-zinc-800">{t("ratingTitle")}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-slate-100 active:scale-[0.98]"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setSelected(star)}
            className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Star
              size={28}
              className={
                star <= (hover || selected)
                  ? "text-amber-500 fill-amber-500 transition-colors"
                  : "text-zinc-300"
              }
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selected < 1 || sending}
        className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
      >
        {sending ? "…" : t("ratingSubmit")}
      </button>
    </div>
  );
}
