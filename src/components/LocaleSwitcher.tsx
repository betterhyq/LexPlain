"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "zh-CN" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-emerald-600 transition-colors font-medium px-2.5 py-1.5 rounded-lg hover:bg-emerald-50/50 active:scale-[0.98]"
      aria-label="Switch language"
    >
      <span
        className={
          locale === "en" ? "font-semibold text-emerald-600" : "opacity-70"
        }
      >
        EN
      </span>
      <span className="text-zinc-300">|</span>
      <span
        className={
          locale === "zh-CN" ? "font-semibold text-emerald-600" : "opacity-70"
        }
      >
        中文
      </span>
    </button>
  );
}
