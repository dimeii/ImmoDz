"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
const WILAYAS = [
  { code: "16", name: "Alger" },
  { code: "31", name: "Oran" },
  { code: "25", name: "Constantine" },
  { code: "23", name: "Annaba" },
  { code: "09", name: "Blida" },
  { code: "15", name: "Tizi Ouzou" },
  { code: "06", name: "Bejaïa" },
  { code: "19", name: "Setif" },
];

const CATEGORIES = [
  {
    label: "Appartements",
    type: "APARTMENT",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACEBGRo65XL4HtEazsT9TX00TtS3OZyeUt4T9mlUA5HUBo7sYHPyKRwYqPo3pPni05KWFafiMZfEMBSnbNe36jLDRBxUzRvNmBshF2UnGw1ru-mJTwnv0ODqSKAOUvdk0Yle_YcQu6bUlCoQf0IVJI-ikJ9LRjRU8ek4XQ5bF4CNI44t2ljCFoMObNSXRTU6PFnLL-wSVJR-PEb5EXgQPVw1p1PXo1oz5-e5MhQXmVoIJ6kgL4QU7m2vPwmWQOkutxB25-PhNvBiS5",
    offset: false,
  },
  {
    label: "Villas",
    type: "VILLA",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAf_DskJ4kz5FPLW7wAmxFdZJktsQRpodef92775b6niVSo_ojkRnQPYsYaxdmCoZIlpzq6scO2LyXyJmNf16k2EERLmPgZImWMXKv3g7wN4qznXahn2vjgYD2VCtxXO1XqdVFecZli411p4LW6VL11XrQ1_rOMnM2rIR382zOL-vdXTJB58k53ltSO4zyZoa-lj5hj9ZOCNh8VbYx9_4h8fCQAVC89dQO64d1RT7EyD_Au5HtHEVIR1ZhuhkOwPNzHrnYaHX797KBF",
    offset: true,
  },
  {
    label: "Studios",
    type: "STUDIO",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBR2TSPxupNTAtWzfZzpjwQ3puJYR5HCnMtQHGOX-9Qlx8qF9lv2z4g98_r_0fqBLg7wzhGjyppikYyDiJE8m7z-agJkghy2yyhDFpUKGIdfOASJTe4LBKCULmm6c51wCrh2xCpSqf0EbbfMDfVYNPonC_AE7YVshxFXY--WvEhihnVBDdqdGmDGsvOKUbIjWZ5v2hv34EJTJP8irbrVspt3YypZ7UIikceIy4CaYB8V37Gimib7dOQgwRgRXnO530EjnKwbve7fe26",
    offset: false,
  },
  {
    label: "Terrains",
    type: "LAND",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxvfgDd3T3Bsmz4je1yItMos-nWONuz3-MQjCGOCCM8EqJYj7F8tL8mSULggbd8JRcWTmDrb3-Cpocpo1sDlE5lBKfc_-1JnlFA-4QMwLjIE0GUX10Wf-m95x_ekO4LmIRWnGaTeKoSICrIXVeXJetq0dsnI4DEUgYitwbWd3-HR-EEkJLjPLsjluevNAR_3kriTDEiRF27OgXOuDXXMnHogycw4RwfuufhoH-wQ9hQrWv0jkiqLIBm8WXZGAEnhapP3edn1A8XrCJ",
    offset: true,
  },
];

const FEATURED_LISTINGS = [
  {
    title: "Villa El Mouradia",
    price: "120,000,000 DA",
    location: "Alger, El Mouradia",
    beds: 5,
    baths: 3,
    area: 450,
    badge: "Nouveau",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcGnFUOWvJhnZhkVref6fi0b467Nw7_knnue0ftq5yhPHW4YKklvxM4_yWgym7YBAFeDVbyU-oWjm5g01fV99bS1ktuJ8He6XJ55X-6bNUH-qSl0WVw8TJNrk8RCv9h0DU4ZUnFp5o3nBpPotn95Q81aAaWQCP4nSawbp0xNg85OLMqkQH_4gHbOR0tIfcXqTuyCdNq3qdgBMk-nhqvM2VnV2fsj0nqH7apRPstGSh6CGuwK1eAS43k9vnGiltfBfkrwZHluoF1iOI",
  },
  {
    title: "Penthouse Akid Lotfi",
    price: "45,500,000 DA",
    location: "Oran, Akid Lotfi",
    beds: 3,
    baths: 2,
    area: 180,
    badge: "Vente",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALJBIv56j8roetvvesZEuOCQuuIRm0iuLhUQWKwblCfjtiaWXsjAF6RN5pp_hsGBs4kRLzKl-1pbFoOs84es9iCrsVt20ab90U0RFG4a6KhskCw_bEp1EbD5cKSvYBYELi3HlCmR-3j_zYSe6dC051vCwThlmzk3h_nUYSNb1ogm-ls0251AYsJH_G5yqVOU10IJ_BD9H0jIL5RX-gJPh6BbDrXg1V1lpQhmYYyGmRd7DoJ_Yme7anSLoDR3-ApAxG9NxLvqipsFJD",
  },
  {
    title: "Appartement Sidi Yahia",
    price: "250,000 DA/Mois",
    location: "Alger, Hydra",
    beds: 4,
    baths: 2,
    area: 220,
    badge: "Location",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOdv7_IKemSBOuDkx41XhGF2NsRFs7tFmaUOmyaaKZqDVNjXJ64sLEBYzYJNScEnv_6J3duETQ2dilFUDQT8AVOTrumGATnnwnrTf9Z883WVWN2YwrrVO1cUieH7IYGbUSPSTInZn7d2gxRM7sv_BAxLwdReXAtKb6FkZRzhFZGKz2uX10oeLJYtTwQaCwMrqgXFZh3w9V6kCpORum6sR9Qe29SmdO5YQS-RH1VBBiMN-gCfDeIKEER3uHjfg4FNe1DuyYJl_aPFo3",
  },
];

export default function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTransaction, setSearchTransaction] = useState<"RENT" | "SALE">("RENT");
  const [searchWilaya, setSearchWilaya] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("transactionType", searchTransaction);
    if (searchWilaya) params.set("wilayaCode", searchWilaya);
    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <main className="-mt-20 bg-background text-on-surface font-body">
      {/* ============ HERO ============ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Luxurious Algerian Living Room"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsPCJ5fZ9o8TU3DIbGnV464DSiQErC9zkcZpdbh9egHI84CNEFATn0WOyVBWQaUxzWX1I8KD3kC_kaAGhHR2q8P-u3GC5mtC3wJI7o9jzEn8TDHhmwj1cYb7l976fDuDVjfB4GPWC8_CtzAGfr4_RQSz09QwqfaCNlgmOLmXTMdW9lb18LRj6pWU0uGe828V9yN2eI3UMGzQxT0U06HO_cz1whp8uRAw4PWYaWmxB3wD_JAa5qwJ3v5q1e9j7PiAsJ0yrTMhyiNKsH"
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-brightness-75" />
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center text-white">
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl mb-8 tracking-tighter text-glow">
            Trouvez le foyer qui vous ressemble
          </h1>

          {/* Search Box */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl p-2 md:p-4 rounded-xl editorial-shadow max-w-4xl mx-auto text-on-surface">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Toggle Location/Vente */}
              <div className="flex bg-surface-container-low rounded-lg p-1 w-full md:w-auto">
                <button
                  onClick={() => setSearchTransaction("RENT")}
                  className={`flex-1 px-6 py-2 rounded-md font-headline text-sm font-bold transition-all ${
                    searchTransaction === "RENT"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  Location
                </button>
                <button
                  onClick={() => setSearchTransaction("SALE")}
                  className={`flex-1 px-6 py-2 rounded-md font-headline text-sm font-medium transition-all ${
                    searchTransaction === "SALE"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  Vente
                </button>
              </div>

              {/* Wilaya Select */}
              <div className="flex-1 relative flex items-center bg-surface-container-low rounded-lg px-4">
                <span className="material-symbols-outlined text-primary mr-3">
                  location_on
                </span>
                <select
                  value={searchWilaya}
                  onChange={(e) => setSearchWilaya(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-medium appearance-none py-3"
                >
                  <option value="">Toute l&apos;Algerie (Wilaya)</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-primary text-white px-10 py-4 rounded-lg font-headline font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all"
              >
                <span className="material-symbols-outlined">search</span>
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES BENTO GRID ============ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-primary font-headline font-bold tracking-widest text-xs uppercase mb-2 block">
              Parcourir par Type
            </span>
            <h2 className="text-on-surface font-headline font-extrabold text-4xl">
              Explorer les Categories
            </h2>
          </div>
          <p className="text-on-surface-variant max-w-sm text-sm">
            Decouvrez une selection rigoureuse de biens immobiliers adaptes a
            chaque style de vie algerien.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/recherche?propertyType=${cat.type}`}
              className={`group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer ${
                cat.offset ? "mt-8" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={cat.label}
                src={cat.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                <h3 className="text-white font-headline font-bold text-xl">
                  {cat.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ FEATURED LISTINGS ============ */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-on-surface font-headline font-extrabold text-4xl">
              Biens d&apos;Exception
            </h2>
            <Link
              href="/recherche"
              className="text-primary font-headline font-bold hover:underline underline-offset-8"
            >
              Voir tout le catalogue
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {FEATURED_LISTINGS.map((listing, i) => (
              <div key={i} className="group">
                <div className="relative overflow-hidden rounded-xl mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full aspect-[4/3] object-cover"
                    alt={listing.title}
                    src={listing.image}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                    {listing.badge}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-headline font-extrabold">
                      {listing.title}
                    </h3>
                    <span className="text-primary font-bold text-lg">
                      {listing.price}
                    </span>
                  </div>
                  <p className="text-on-surface-variant flex items-center text-sm">
                    <span className="material-symbols-outlined text-sm mr-1">
                      location_on
                    </span>
                    {listing.location}
                  </p>
                  <div className="flex gap-4 pt-4 text-on-surface-variant text-xs border-t border-outline-variant/15">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bed</span>
                      {listing.beds} Lits
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bathtub</span>
                      {listing.baths} Bains
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">square_foot</span>
                      {listing.area} m²
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-5xl font-headline font-extrabold">10,000+</div>
            <p className="text-primary-fixed uppercase tracking-widest text-xs font-bold">
              Biens Repertories
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-headline font-extrabold">500+</div>
            <p className="text-primary-fixed uppercase tracking-widest text-xs font-bold">
              Agences Partenaires
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-headline font-extrabold">15 Ans</div>
            <p className="text-primary-fixed uppercase tracking-widest text-xs font-bold">
              D&apos;Expertise Terrain
            </p>
          </div>
        </div>
      </section>

      {/* ============ BTP / CONSTRUCTION ============ */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-surface-container-low rounded-[2rem] overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center order-2 md:order-1">
            <span className="text-primary font-headline font-bold tracking-widest text-xs uppercase mb-4 block">
              Construction &amp; BTP
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-8 leading-tight">
              Batir vos reves, avec precision.
            </h2>
            <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
              Au-dela de la transaction, ImmoDz vous accompagne dans la
              concretisation de vos projets de construction. Nos architectes et
              ingenieurs transforment vos visions en structures durables et
              elegantes.
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-fixed p-3 rounded-xl text-primary">
                  <span className="material-symbols-outlined">architecture</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold">
                    Conception Architecturale
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    Plans sur mesure adaptes au climat et a l&apos;esthetique
                    locale.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary-fixed p-3 rounded-xl text-primary">
                  <span className="material-symbols-outlined">engineering</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold">
                    Gestion de Chantier
                  </h4>
                  <p className="text-sm text-on-surface-variant">
                    Suivi rigoureux pour garantir les delais et la qualite
                    superieure.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover min-h-[400px]"
              alt="Modern construction architecture"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC85Vl3b52Tkb0kGmSORl75xwWEJoBd_yT2f6WBIC7hzoN2co1YLWIU9O28tEsgAX3BFFY5ffE9xdm3G_pCzOOElc9roJVMz-KQNKMQ6fYFh9K68FaSGk6uZXw9jos-epCEgYzVIFX2yPyffZUJEQGk5M0IrDWB9DrSJio0uI88V9kF47KrRUU-8HWZ9KDdHSkbkEx9K5VsQuA8IhQtdsTPCDaDFfM9eWURPVm7TVk6NKIofdeR6jAOb9L5G6gu52Oa61WXQyuiCIUG"
            />
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-headline font-extrabold">
              Ce que nos clients disent
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface-container-low p-10 md:p-16 rounded-3xl relative">
              <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-8 left-8">
                format_quote
              </span>
              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-on-surface italic leading-relaxed mb-10">
                  &ldquo;Trouver une maison a Alger a toujours ete un defi, mais
                  avec ImmoDz, nous avons trouve notre villa a Hydra en moins de
                  deux semaines. Le professionnalisme de l&apos;equipe est sans
                  egal.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-14 h-14 rounded-full object-cover"
                    alt="Amine Benali"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUCZib6Z8rvn_hP8FjwNPsdEpaEy59-JX_vn6_WhcBa1aHd2OJV4vBWmhmm2lDKWByu3DIaBDWP6obceMEY7R4fWu75Z0wqn5p8NqYSaZH7DuGZiFHo1dZekOBDp2RSfR0TfqkM4GgxbvtxuVs2qFd5cyBBIBDBoRUG2STk5-zmrRhr6Lb6fnn6ScaRG0rXQCJOYbZnEDllO69ubOlJlGQNP7BXa3aqU-1zmTc5UFz_425otjOAzO1mX--7HHnTcY5bw-upObwJfQ1"
                  />
                  <div>
                    <h4 className="font-bold text-on-surface">Amine Benali</h4>
                    <p className="text-sm text-on-surface-variant">
                      Proprietaire a Hydra
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-primary-container p-12 md:p-20 rounded-[2.5rem] text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold mb-6 relative z-10">
              Restez informe des nouveautes
            </h2>
            <p className="text-on-primary-container mb-12 max-w-xl mx-auto relative z-10">
              Recevez les meilleures opportunites immobilieres et les actualites
              du secteur directement dans votre boite mail.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="max-w-md mx-auto flex flex-col md:flex-row gap-4 relative z-10"
            >
              <input
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-white/60 focus:ring-2 focus:ring-primary-fixed focus:outline-none"
                placeholder="Votre adresse email"
                type="email"
              />
              <button
                type="submit"
                className="bg-white text-primary px-8 py-4 rounded-lg font-headline font-bold hover:bg-primary-fixed transition-colors"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
