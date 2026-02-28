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
      onClick={toggleLocale}
      className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
      aria-label="Switch language"
    >
      {locale === "en" ? "简体中文" : "English"}
    </button>
  );
}
