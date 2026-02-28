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
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50/50"
      aria-label="Switch language"
    >
      <span className={locale === "en" ? "font-semibold text-indigo-600" : "opacity-70"}>EN</span>
      <span className="text-gray-300">|</span>
      <span className={locale === "zh-CN" ? "font-semibold text-indigo-600" : "opacity-70"}>中文</span>
    </button>
  );
}
