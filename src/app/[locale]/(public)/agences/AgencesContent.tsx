"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Wilaya = {
  code: number;
  name: string;
  nameAr: string | null;
};

type Agency = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  wilaya: { code: number; name: string; nameAr: string | null } | null;
  memberCount: number;
  activeListings: number;
};

export default function AgencesContent() {
  const t = useTranslations("agencies");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [wilayaCode, setWilayaCode] = useState<string>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/wilayas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWilayas(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (wilayaCode) params.set("wilaya", wilayaCode);
    if (query.trim()) params.set("q", query.trim());

    setLoading(true);
    const debounce = setTimeout(() => {
      fetch(`/api/agences?${params.toString()}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setAgencies(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [wilayaCode, query]);

  const wilayaLabel = useMemo(
    () => (w: Wilaya) => (isAr && w.nameAr ? w.nameAr : w.name),
    [isAr]
  );

  return (
    <main className="min-h-[calc(100vh-80px)] bg-emerald-50/40 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold text-emerald-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-emerald-800/70 mt-2">{t("subtitle")}</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-emerald-900 mb-1">
              {t("filterWilaya")}
            </label>
            <select
              value={wilayaCode}
              onChange={(e) => setWilayaCode(e.target.value)}
              className="w-full border border-emerald-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{t("allWilayas")}</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {String(w.code).padStart(2, "0")} — {wilayaLabel(w)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-emerald-900 mb-1">
              {t("searchByName")}
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full border border-emerald-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-emerald-800/60 py-12">{t("loading")}</div>
        ) : agencies.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm py-16 px-6">
            <p className="text-emerald-900 font-semibold">{t("empty")}</p>
            <p className="text-emerald-800/60 text-sm mt-1">{t("emptyHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((a) => {
              const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                a.slug ? (
                  <Link
                    href={`/agences/${a.slug}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
                  >
                    {children}
                  </Link>
                ) : (
                  <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                    {children}
                  </article>
                );
              return (
                <CardWrapper key={a.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {a.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.logo}
                        alt={a.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-headline font-bold text-lg">
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-headline font-semibold text-emerald-900 truncate">
                      {a.name}
                    </h2>
                    {a.wilaya && (
                      <p className="text-xs text-emerald-800/60 mt-0.5">
                        {isAr && a.wilaya.nameAr ? a.wilaya.nameAr : a.wilaya.name}
                      </p>
                    )}
                  </div>
                </div>

                {a.description && (
                  <p className="text-sm text-emerald-800/70 line-clamp-3 mb-4">
                    {a.description}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800/70">
                  <span>
                    {a.activeListings} {t("listings")}
                  </span>
                  <span>
                    {a.memberCount} {t("members")}
                  </span>
                </div>

                {(a.phone || a.email) && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 flex flex-col gap-1 text-xs text-emerald-800/80">
                    {a.phone && <span>{a.phone}</span>}
                    {a.email && <span className="truncate">{a.email}</span>}
                  </div>
                )}
                </CardWrapper>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
