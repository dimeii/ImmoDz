# 🏘️ ImmoDz — Plateforme immobilière Algérie

> Plateforme de recherche de biens immobiliers (location/vente) inspirée de SeLoger, adaptée au marché algérien.

## 🚀 Quick Start

```bash
# Install
npm install

# Setup BD
npm run db:setup

# Dev server
npm run dev
```

**Détails → voir [`QUICK_START.md`](docs/QUICK_START.md)**

---

## 📚 Documentation

| Document | Contenu |
|----------|---------|
| **[`CLAUDE.md`](CLAUDE.md)** | 📌 **ESSENTIEL** — Stack, architecture, conventions, gotchas |
| **[`docs/ETAT_LIEUX_ARCHITECTURE.md`](docs/ETAT_LIEUX_ARCHITECTURE.md)** | 📊 État des lieux complet + coûts production + roadmap |
| **[`docs/SCHEMAS_MERMAID.md`](docs/SCHEMAS_MERMAID.md)** | 🗺️ Diagrammes (architecture, data model, flux, coûts) |
| **[`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)** | 📈 Status des features (Phase 1/2/3) |
| **[`docs/COMPTES_TEST.md`](docs/COMPTES_TEST.md)** | 👤 Comptes de test (users, password, roles) |
| **[`docs/QUICK_START.md`](docs/QUICK_START.md)** | 🚀 Guide démarrage dev |
| **[`docs/CHANGELOG-DEV.md`](docs/CHANGELOG-DEV.md)** | 📝 Historique commits dev |

---

## 🏗️ Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 (App Router) + React 18 + Tailwind CSS |
| **Backend** | Next.js API Routes + NextAuth v5 |
| **Database** | PostgreSQL 15 + PostGIS |
| **ORM** | Prisma 5 |
| **Map** | Mapbox GL JS + Supercluster |
| **Auth** | NextAuth v5 (JWT + Sessions) |
| **Storage** | Cloudinary (photos) |
| **Cache** | Upstash Redis |
| **Email** | Resend |
| **Deploy** | Vercel (frontend) + Railway (DB) |

---

## 📁 Structure

```
src/
├── app/              # Next.js 14 App Router (pages + API)
├── components/       # React components (Map, Forms, UI)
├── lib/              # Utilities (db, auth, cache, validation)
└── types/            # TypeScript types

docs/                 # Documentation (markdown)
prisma/              # Database schema + migrations
```

**Détails complets → [`CLAUDE.md`](CLAUDE.md)**

---

## 🎯 Current Status

### ✅ Phase 1 (Done)
- Landing page + carte avec 37 listings
- Auth (register/login/logout)
- Créer/éditer annonces
- Upload photos (Cloudinary)
- Contact form + email
- Dashboard

### 🔄 Phase 2 (In Progress)
- Gestion agences (DIRECTOR/EMPLOYEE)
- Champs commerciaux
- Géocodage annonces
- Back-office admin

### 📋 Phase 3 (TODO)
- Favoris/Wishlist
- Notifications real-time
- Avis agences
- Visite virtuelle
- Mobile app

**Détails → [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)**

---

## 💰 Production Costs

| Service | Estimated |
|---------|-----------|
| **Mapbox** | $100-500/month ⚠️ (main driver) |
| **Vercel** | $15-50/month |
| **Railway** | $10-30/month |
| **Cloudinary** | $0-99/month |
| **Others** | $20-50/month |
| **TOTAL** | **$150-750/month** |

**Analysis complet → [`docs/ETAT_LIEUX_ARCHITECTURE.md`](docs/ETAT_LIEUX_ARCHITECTURE.md#-estimation-des-coûts-de-production)**

---

## 🔐 Rôles

| Role | Perms |
|------|-------|
| **USER** | Max 3 listings, max 10 photos |
| **AGENCY_EMPLOYEE** | Unlimited listings, max 50 photos |
| **AGENCY_DIRECTOR** | Manage agency + members |
| **ADMIN** | Moderation + full access |

---

## 🌐 Key Endpoints

```
Public
├── GET  /                          # Homepage
├── GET  /annonces/[id]            # Listing detail
├── GET  /recherche                # Search
├── POST /api/auth/register        # Register
└── POST /api/contact              # Contact form

Protected (Auth required)
├── GET  /dashboard                # My dashboard
├── POST /api/annonces             # Create listing
└── GET  /api/annonces?userId      # My listings

Map API
├── GET  /api/map/pins             # GeoJSON + clustering
└── POST /api/upload/signature     # Cloudinary signature

Admin only
└── GET  /admin                    # Moderation
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Setup database (migrate + seed)
npm run db:setup

# Run dev server (http://localhost:3000)
npm run dev

# Build
npm run build

# Start production
npm start

# Run linter
npm run lint
```

### Env vars
Voir `.env.local` ou [`CLAUDE.md`](CLAUDE.md#variables-denvironnement)

---

## 📊 Diagrams

Voir [`docs/SCHEMAS_MERMAID.md`](docs/SCHEMAS_MERMAID.md) pour :
- Architecture système
- Modèle de données (ERD)
- Flux utilisateur
- Rate limiting & cache strategy
- Breakdown coûts

**Visualiser** :
- VS Code + "Markdown Preview Mermaid Support"
- Navigateur : https://mermaid.live

---

## 🤝 Contributing

1. Read [`CLAUDE.md`](CLAUDE.md) (conventions, gotchas)
2. Create feature branch : `git checkout -b feat/xyz`
3. Commit with clear messages
4. Open PR to `dev` branch
5. Main branch is production-only

---

## 📝 Git Flow

```
master (production)
  ↑
  |
dev (staging)
  ↑
  |
feat/* (feature branches)
```

---

## 🆘 Troubleshooting

### BD issues
- `prisma migrate dev` — run migrations
- `npm run db:setup` — reset + seed (dev only)
- See [`CLAUDE.md#gotchas`](CLAUDE.md#gotchas) for PostGIS setup

### Map issues
- Check Mapbox token in `.env.local`
- Verify bounds format in `/api/map/pins`
- See browser console for errors

### Auth issues
- Check `NEXTAUTH_SECRET` + `NEXTAUTH_URL`
- Clear cookies/localStorage
- See `middleware.ts` for route protection

---

## 📞 References

- [Next.js Docs](https://nextjs.org)
- [Prisma Docs](https://prisma.io)
- [NextAuth v5](https://authjs.dev)
- [Mapbox GL JS](https://docs.mapbox.com)
- [PostGIS Docs](https://postgis.net)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📄 License

ISC

---

**Last updated**: 2026-04-02  
**Current branch**: `dev`  
**Main branch**: `master`
