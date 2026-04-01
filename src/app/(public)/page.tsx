"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const WILAYAS_POPULAIRES = [
  { code: "16", name: "Alger" },
  { code: "31", name: "Oran" },
  { code: "25", name: "Constantine" },
  { code: "09", name: "Blida" },
  { code: "15", name: "Tizi Ouzou" },
  { code: "06", name: "Béjaïa" },
  { code: "19", name: "Sétif" },
  { code: "23", name: "Annaba" },
];

const STATS = [
  { value: "10 000+", label: "Annonces actives" },
  { value: "58", label: "Wilayas couvertes" },
  { value: "5 000+", label: "Utilisateurs satisfaits" },
  { value: "200+", label: "Agences partenaires" },
];

const TRUST_POINTS = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Annonces vérifiées",
    desc: "Chaque annonce est contrôlée par notre équipe pour garantir authenticité et transparence.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Relations humaines",
    desc: "Particuliers et agences échangent directement. Pas d'intermédiaire, pas de commission cachée.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: "BTP & Programmes neufs",
    desc: "Accédez aux projets de construction neufs et suivez l'évolution du bâtiment en Algérie.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Recherche géolocalisée",
    desc: "Explorez la carte interactive pour trouver des biens près de chez vous, dans toutes les wilayas.",
  },
];

const PROPERTY_TYPES = [
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    label: "Appartements",
    type: "APARTMENT",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
    label: "Maisons",
    type: "HOUSE",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    label: "Villas",
    type: "VILLA",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V7.5A.75.75 0 013.75 6.75h16.5a.75.75 0 01.75.75v1.849M3 9.349h18M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    label: "Commerces",
    type: "COMMERCIAL",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-14.032a22.373 22.373 0 00-6.006 0C8.09 3.394 7 4.587 7 5.942v12.116c0 1.355 1.09 2.548 2.497 2.724a22.373 22.373 0 006.006 0C16.91 20.606 18 19.413 18 18.058V5.942c0-1.355-1.09-2.548-2.497-2.724z" />
      </svg>
    ),
    label: "Terrains",
    type: "LAND",
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTransaction, setSearchTransaction] = useState("RENT");
  const [searchWilaya, setSearchWilaya] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("transactionType", searchTransaction);
    if (searchWilaya) params.set("wilayaCode", searchWilaya);
    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800" />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-28">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full border border-white/20">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              La plateforme immobiliere n&deg;1 en Algerie
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight max-w-4xl mx-auto">
            Trouvez votre bien
            <br />
            <span className="text-primary-200">en toute confiance</span>
          </h1>
          <p className="text-center text-white/70 text-lg sm:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
            ImmoDz connecte particuliers, agences et professionnels du BTP
            pour des transactions immobilieres transparentes et humaines.
          </p>

          {/* ---- Search Box ---- */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
              {/* Transaction toggle */}
              <div className="flex gap-1 mb-3 px-1">
                <button
                  onClick={() => setSearchTransaction("RENT")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    searchTransaction === "RENT"
                      ? "bg-primary-950 text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Location
                </button>
                <button
                  onClick={() => setSearchTransaction("SALE")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    searchTransaction === "SALE"
                      ? "bg-accent-red text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Achat
                </button>
              </div>

              {/* Search row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <select
                    value={searchWilaya}
                    onChange={(e) => setSearchWilaya(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-0 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                  >
                    <option value="">Toutes les wilayas</option>
                    {WILAYAS_POPULAIRES.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-primary-950 hover:bg-primary-900 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  Rechercher
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {WILAYAS_POPULAIRES.slice(0, 5).map((w) => (
                <Link
                  key={w.code}
                  href={`/recherche?wilayaCode=${w.code}&transactionType=RENT`}
                  className="text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all"
                >
                  {w.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 40V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="max-w-5xl mx-auto px-4 -mt-2 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="text-center py-6">
              <div className="text-3xl sm:text-4xl font-black text-primary-950">{s.value}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PROPERTY TYPES ============ */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Quel type de bien recherchez-vous ?
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
          Appartements, maisons, villas, commerces ou terrains — explorez toutes les categories.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {PROPERTY_TYPES.map((pt) => (
            <Link
              key={pt.type}
              href={`/recherche?propertyType=${pt.type}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all bg-white hover:bg-primary-50"
            >
              <div className="text-gray-400 group-hover:text-primary-950 transition-colors">
                {pt.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-950 transition-colors">
                {pt.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ TRUST & VALUES ============ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Pourquoi choisir ImmoDz ?
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Une plateforme construite sur la confiance, la transparence et les valeurs humaines.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {TRUST_POINTS.map((tp, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary-950">
                  {tp.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{tp.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{tp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BTP SECTION ============ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: illustration */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden">
                {/* Stylized building illustration using CSS */}
                <div className="relative w-full h-full flex items-end justify-center pb-8 gap-3">
                  {/* Building 1 */}
                  <div className="w-16 bg-primary-950/80 rounded-t-lg relative" style={{ height: "55%" }}>
                    <div className="absolute inset-x-2 top-3 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-2 bg-primary-200/60 rounded-sm" />
                      ))}
                    </div>
                  </div>
                  {/* Building 2 (tall) */}
                  <div className="w-20 bg-primary-900/70 rounded-t-lg relative" style={{ height: "75%" }}>
                    <div className="absolute inset-x-2 top-3 grid grid-cols-2 gap-1.5">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-2 bg-primary-200/50 rounded-sm" />
                      ))}
                    </div>
                  </div>
                  {/* Building 3 */}
                  <div className="w-14 bg-primary-800/60 rounded-t-lg relative" style={{ height: "45%" }}>
                    <div className="absolute inset-x-2 top-3 space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-2 bg-primary-200/50 rounded-sm" />
                      ))}
                    </div>
                  </div>
                  {/* Crane */}
                  <div className="absolute top-4 right-12">
                    <div className="w-0.5 h-28 bg-primary-950/40" />
                    <div className="absolute top-0 left-0 w-20 h-0.5 bg-primary-950/40" />
                    <div className="absolute top-0 right-0 w-0.5 h-4 bg-primary-950/40" style={{ transform: "translateX(0)" }} />
                  </div>
                  {/* Ground */}
                  <div className="absolute bottom-0 inset-x-0 h-8 bg-primary-200/40" />
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg className="h-5 w-5 text-primary-950" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Programmes neufs</div>
                    <div className="text-xs text-gray-500">Directement du promoteur</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: text */}
            <div>
              <span className="text-sm font-bold text-primary-950 tracking-wide uppercase">BTP & Construction</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-5 leading-snug">
                Le secteur du batiment algérien, au coeur de notre plateforme
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                ImmoDz collabore avec les promoteurs immobiliers et les entreprises du BTP
                pour vous donner acces aux programmes neufs des leur lancement.
                Suivez l&apos;avancement des chantiers, découvrez les nouvelles résidences
                et investissez en toute sérénité.
              </p>
              <ul className="space-y-3">
                {[
                  "Programmes neufs référencés dès le lancement",
                  "Promoteurs et agences vérifiés",
                  "Suivi des projets de construction",
                  "Accompagnement personnalisé",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <svg className="h-5 w-5 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l2 3.5-2 3z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pret a vous lancer ?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Que vous cherchiez un bien, que vous souhaitiez publier une annonce
            ou rejoindre notre communauté — tout commence ici.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recherche"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-950 font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Explorer les annonces
            </Link>

            {session ? (
              <Link
                href="/annonces/nouvelle"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Deposer une annonce
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Creer un compte gratuit
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL / SOCIAL PROOF ============ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-12">
            Ils nous font confiance
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: "J'ai trouvé mon appartement à Alger en moins d'une semaine. Le contact direct avec le propriétaire a tout simplifié.",
                name: "Karim B.",
                role: "Locataire à Alger",
              },
              {
                quote: "En tant qu'agence, ImmoDz nous permet de toucher des clients sérieux. L'interface est claire et professionnelle.",
                name: "Agence El Baraka",
                role: "Agence immobilière, Oran",
              },
              {
                quote: "J'ai vendu mon terrain en 3 semaines. La visibilité sur la carte interactive fait vraiment la différence.",
                name: "Nadia M.",
                role: "Particulière, Constantine",
              },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CARTE CTA ============ */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <Link
          href="/recherche"
          className="group block relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-100 to-primary-50 border-2 border-primary-200 hover:border-primary-400 transition-all hover:shadow-xl"
        >
          <div className="flex items-center justify-between p-8 sm:p-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary-950 mb-2">
                Explorez la carte interactive
              </h3>
              <p className="text-primary-700 text-sm sm:text-base">
                Visualisez tous les biens disponibles pres de chez vous sur notre carte en temps réel.
              </p>
            </div>
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary-950 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </Link>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="text-2xl font-black text-primary-950 mb-3">ImmoDz</div>
              <p className="text-sm text-gray-500 leading-relaxed">
                La plateforme immobiliere de confiance pour l&apos;Algérie.
                Location, vente, programmes neufs.
              </p>
            </div>
            {/* Navigation */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3">Navigation</h4>
              <ul className="space-y-2">
                <li><Link href="/recherche" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Rechercher</Link></li>
                <li><Link href="/recherche?transactionType=RENT" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Location</Link></li>
                <li><Link href="/recherche?transactionType=SALE" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Vente</Link></li>
                <li><Link href="/annonces/nouvelle" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Déposer une annonce</Link></li>
              </ul>
            </div>
            {/* Compte */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3">Compte</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Connexion</Link></li>
                <li><Link href="/register" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Inscription</Link></li>
                <li><Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary-950 transition-colors">Mon tableau de bord</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} ImmoDz. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
