"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("locale");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const other: Locale = locale === "fr" ? "ar" : "fr";

  const switchTo = (target: Locale) => {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      router.replace(href, { locale: target });
    });
  };

  return (
    <button
      type="button"
      onClick={() => switchTo(other)}
      disabled={isPending}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      className="text-sm font-semibold text-emerald-800/60 hover:text-emerald-900 transition-colors disabled:opacity-50"
    >
      {other === "ar" ? "العربية" : "FR"}
    </button>
  );
}
