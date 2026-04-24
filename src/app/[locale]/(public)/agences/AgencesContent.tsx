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
  coverImage: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  foundedYear: number | null;
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agencies.map((a) => {
              const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                a.slug ? (
                  <Link
                    href={`/agences/${a.slug}`}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-emerald-100/50"
                  >
                    {children}
                  </Link>
                ) : (
                  <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-emerald-100/50">
                    {children}
                  </article>
                );
              return (
                <CardWrapper key={a.id}>
                  {/* Cover image avec logo superposé */}
                  <div className="relative h-44 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 overflow-hidden">
                    {a.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverImage}
                        alt={a.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 opacity-20">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 400 200"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <pattern
                              id={`p-${a.id}`}
                              x="0"
                              y="0"
                              width="40"
                              height="40"
                              patternUnits="userSpaceOnUse"
                            >
                              <rect width="40" height="40" fill="none" />
                              <path
                                d="M20 5 L35 20 L35 35 L25 35 L25 25 L15 25 L15 35 L5 35 L5 20 Z"
                                fill="white"
                                fillOpacity="0.4"
                              />
                            </pattern>
                          </defs>
                          <rect width="400" height="200" fill={`url(#p-${a.id})`} />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Badges top-right */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                      {a.wilaya && (
                        <span className="bg-white/95 backdrop-blur-sm text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                          {isAr && a.wilaya.nameAr ? a.wilaya.nameAr : a.wilaya.name}
                        </span>
                      )}
                      {a.foundedYear && (
                        <span className="bg-white/80 backdrop-blur-sm text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Depuis {a.foundedYear}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Logo overlapping + content */}
                  <div className="px-6 pt-0 pb-5 flex-1 flex flex-col">
                    <div className="flex items-end gap-4 -mt-10 mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-white ring-4 ring-white shadow-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {a.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.logo}
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-emerald-700 font-headline font-bold text-3xl">
                            {a.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <h2 className="font-headline font-bold text-emerald-900 text-xl leading-tight truncate group-hover:text-emerald-700 transition-colors">
                          {a.name}
                        </h2>
                        {a.address && (
                          <p className="text-xs text-emerald-800/60 mt-1 truncate">
                            {a.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {a.description && (
                      <p className="text-sm text-emerald-900/70 leading-relaxed line-clamp-2 mb-4">
                        {a.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-emerald-100/70 flex items-center justify-between">
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-lg font-headline font-bold text-emerald-900">
                            {a.activeListings}
                          </span>
                          <span className="text-xs text-emerald-800/60 ml-1">
                            {t("listings")}
                          </span>
                        </div>
                        <div>
                          <span className="text-lg font-headline font-bold text-emerald-900">
                            {a.memberCount}
                          </span>
                          <span className="text-xs text-emerald-800/60 ml-1">
                            {t("members")}
                          </span>
                        </div>
                      </div>

                      {(a.phone || a.email) && (
                        <div className="flex gap-2 text-emerald-700">
                          {a.phone && (
                            <span
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50"
                              title={a.phone}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                            </span>
                          )}
                          {a.email && (
                            <span
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50"
                              title={a.email}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
