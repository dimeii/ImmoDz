import Link from "next/link";
import type { ListingStats } from "@/lib/stats";

interface Props {
  stats: ListingStats;
  title: string;
  subtitle?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" });
}

function MiniChart({ stats }: { stats: ListingStats }) {
  const w = 800;
  const h = 200;
  const padX = 28;
  const padY = 16;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const max = Math.max(
    1,
    ...stats.series.map((p) => Math.max(p.views, p.contacts))
  );
  const step = stats.series.length > 1 ? innerW / (stats.series.length - 1) : 0;

  const buildPath = (key: "views" | "contacts") =>
    stats.series
      .map((p, i) => {
        const x = padX + i * step;
        const y = padY + innerH - (p[key] / max) * innerH;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  // ticks Y (4 lignes)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(max * r));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-48 min-w-[600px]"
        preserveAspectRatio="none"
      >
        {/* Grid horizontal */}
        {ticks.map((t, i) => {
          const y = padY + innerH - (t / max) * innerH;
          return (
            <g key={i}>
              <line
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray={i === 0 ? "" : "2,2"}
              />
              <text x={4} y={y + 4} fontSize="10" fill="#9ca3af">
                {t}
              </text>
            </g>
          );
        })}

        {/* Axe X labels (chaque ~5 jours) */}
        {stats.series.map((p, i) => {
          if (i % Math.max(1, Math.floor(stats.series.length / 8)) !== 0) return null;
          const x = padX + i * step;
          return (
            <text
              key={p.date}
              x={x}
              y={h - 2}
              fontSize="9"
              fill="#9ca3af"
              textAnchor="middle"
            >
              {formatDate(p.date)}
            </text>
          );
        })}

        {/* Lignes */}
        <path
          d={buildPath("views")}
          fill="none"
          stroke="#003527"
          strokeWidth="2"
        />
        <path
          d={buildPath("contacts")}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />
      </svg>
      <div className="flex gap-4 text-xs text-gray-600 mt-2 px-7">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 bg-[#003527] rounded-sm" /> Vues
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 bg-[#10b981] rounded-sm" /> Contacts
        </span>
      </div>
    </div>
  );
}

export default function StatsView({ stats, title, subtitle }: Props) {
  const conversionRate =
    stats.totals.views > 0
      ? ((stats.totals.contacts / stats.totals.views) * 100).toFixed(1)
      : "0";

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
        </div>

        {/* Tuiles totaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Vues (30j)
            </div>
            <div className="text-3xl font-black text-gray-900 mt-2">
              {stats.totals.views.toLocaleString("fr-DZ")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Total : {stats.totals.viewsAllTime.toLocaleString("fr-DZ")}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Contacts (30j)
            </div>
            <div className="text-3xl font-black text-gray-900 mt-2">
              {stats.totals.contacts.toLocaleString("fr-DZ")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Total : {stats.totals.contactsAllTime.toLocaleString("fr-DZ")}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Taux contact
            </div>
            <div className="text-3xl font-black text-gray-900 mt-2">{conversionRate}%</div>
            <div className="text-xs text-gray-400 mt-1">vues → contacts</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Période
            </div>
            <div className="text-3xl font-black text-gray-900 mt-2">{stats.range.days}j</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(stats.range.from.toISOString().slice(0, 10))} →{" "}
              {formatDate(stats.range.to.toISOString().slice(0, 10))}
            </div>
          </div>
        </div>

        {/* Graphique */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
          <h2 className="font-bold text-gray-900 mb-4">Évolution sur 30 jours</h2>
          <MiniChart stats={stats} />
        </div>

        {/* Top 5 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Top 5 annonces (par vues)</h2>
          {stats.topListings.length === 0 ||
          stats.topListings.every((l) => l.views === 0) ? (
            <p className="text-sm text-gray-500">
              Pas encore de vues sur la période. Patience — les statistiques se construisent au fil
              de l'eau depuis aujourd'hui.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.topListings.map((l, i) => (
                <li key={l.id} className="py-3 flex items-center gap-4">
                  <span className="text-2xl font-black text-gray-300 w-6 text-center">
                    {i + 1}
                  </span>
                  {l.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.thumbnail}
                      alt=""
                      className="h-12 w-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-16 bg-gray-100 rounded-lg flex-shrink-0" />
                  )}
                  <Link
                    href={`/annonces/${l.id}`}
                    className="flex-1 min-w-0 font-semibold text-gray-900 hover:text-primary-950 truncate"
                  >
                    {l.title}
                  </Link>
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    <span className="text-gray-700">
                      <strong>{l.views}</strong>{" "}
                      <span className="text-xs text-gray-400">vues</span>
                    </span>
                    <span className="text-gray-700">
                      <strong>{l.contacts}</strong>{" "}
                      <span className="text-xs text-gray-400">contacts</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
