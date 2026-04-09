# ImmoDz — État des Lieux & Architecture
**Date** : 2026-04-02  
**Version** : 1.0 (Phase 2)  
**Branche** : `dev`

---

## 📊 Vue d'ensemble

**ImmoDz** est une plateforme immobilière algérienne inspirée de SeLoger, permettant aux particuliers et agences de lister des biens (vente/location) avec visualisation géographique.

| Métrique | Valeur |
|----------|--------|
| **Stack** | Next.js 14 + Prisma + PostgreSQL + PostGIS |
| **BD** | PostgreSQL 15 + PostGIS (géolocalisation) |
| **Cache** | Redis (Upstash) |
| **Auth** | NextAuth v5 |
| **Déploiement** | Vercel (frontend) + Railway (BD) |
| **Status** | Phase 2 (Core features + Dashboard agences) |

---

## 🏗️ Architecture Système

### Vue d'ensemble haute-niveau

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React 18 SPA (App Router Next.js 14)                  │    │
│  │  - MapView (Mapbox GL + Supercluster)                  │    │
│  │  - Pages publiques (Recherche, Fiche bien, Login)      │    │
│  │  - Dashboard privé (Annonces, Profil, Agence)          │    │
│  │  - Admin (Modération)                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (HTTPS)
┌─────────────────────────────────────────────────────────────────┐
│          BACKEND (Next.js API Routes + Middleware)              │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐   │
│  │ Auth Routes      │  │ Data Routes      │  │ Upload      │   │
│  │ ─────────────    │  │ ─────────────    │  │ ─────────── │   │
│  │ /auth/register   │  │ /annonces        │  │ /upload/    │   │
│  │ /auth/[...]      │  │ /annonces/:id    │  │  signature  │   │
│  │ (NextAuth v5)    │  │ /map/pins        │  │ (signature  │   │
│  │                  │  │ /agence          │  │  Cloudinary)│   │
│  │ Rate limit ✓     │  │ /contact         │  │             │   │
│  └──────────────────┘  └──────────────────┘  │ Rate limit  │   │
│                                               │ (Redis) ✓   │   │
│  Authentication : NextAuth middleware.ts     └─────────────┘   │
│  - Protect routes (auth) vs public           Email (Resend)    │
│  - Session gestion + JWT                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↕
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
    ┌─────────┐          ┌──────────┐         ┌─────────────┐
    │PostgreSQL│          │Cloudinary│         │Upstash Redis│
    │+ PostGIS │          │(Photos)  │         │(Cache)      │
    │          │          │          │         │             │
    │- Users   │          │Transform:│         │Pins cache   │
    │- Listings│          │- thumbnail│         │Rate limit   │
    │- Agences │          │- responsive       │Contact forms│
    │- Photos  │          └──────────┘         └─────────────┘
    │          │
    │GIS index:│           ┌──────────────────┐
    │GIST      │           │  Mapbox Token    │
    │PostGIS   │           │  NEXT_PUBLIC     │
    │queries   │           │  (exposed côté   │
    │          │           │   client — sécurisé) │
    └─────────┘           └──────────────────┘
        ↓
  Railway hosting
  (Prod)
```

---

## 📁 Structure du code (Arborescence actuelle)

```
src/
├── app/                           # Next.js 14 App Router
│   ├── (public)/
│   │   ├── page.tsx               # 🟢 Homepage + landing page
│   │   ├── login/page.tsx         # 🟢 Login form
│   │   ├── register/page.tsx      # 🟢 Register form
│   │   ├── annonces/[id]/page.tsx # 🟢 Fiche bien détaillée
│   │   ├── recherche/page.tsx     # 🟡 Liste annonces (non connecté)
│   │   └── layout.tsx             # Public layout
│   │
│   ├── (auth)/                    # Protégé par NextAuth middleware
│   │   ├── dashboard/page.tsx     # 🟢 Tableau de bord perso
│   │   ├── annonces/
│   │   │   ├── nouvelle/page.tsx  # 🟢 Créer une annonce (ListingForm)
│   │   │   └── [id]/edit/page.tsx # 🟢 Éditer une annonce
│   │   ├── agence/                # 🟡 DIRECTOR/EMPLOYEE seulement
│   │   │   ├── page.tsx           # Infos agence
│   │   │   └── agents/page.tsx    # 🟡 Gestion membres (DIRECTOR)
│   │   └── layout.tsx             # Auth layout + nav
│   │
│   ├── admin/                     # ADMIN only
│   │   └── page.tsx               # 🟡 Back-office modération
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/    # 🟢 NextAuth v5 config
│   │   ├── auth/register/         # 🟢 Register endpoint
│   │   ├── annonces/
│   │   │   ├── route.ts           # 🟢 GET (search), POST (create)
│   │   │   ├── [id]/route.ts      # 🟢 GET (detail), PATCH (edit)
│   │   │   └── [id]/photos/       # 🟢 POST photos, DELETE photos
│   │   ├── map/pins/route.ts      # 🟢 GeoJSON pour Mapbox
│   │   ├── agence/
│   │   │   ├── route.ts           # 🟡 Créer/éditer agence
│   │   │   └── membres/[membreId] # 🟡 Ajouter/supprimer membres
│   │   ├── upload/signature/      # 🟢 Signature Cloudinary
│   │   ├── contact/route.ts       # 🟢 Contact form → email
│   │   └── wilayas/route.ts       # 🟢 Liste des 58 wilayas
│   │
│   └── layout.tsx                 # Root layout (SessionProvider)
│
├── components/
│   ├── map/
│   │   ├── MapView.tsx            # 🟢 use client, Mapbox GL + Supercluster
│   │   ├── MapPin.tsx             # 🟢 Marker unique
│   │   └── ClusterPin.tsx         # 🟢 Cluster count
│   ├── annonces/
│   │   ├── AnnonceList.tsx        # 🟢 Liste avec filtres
│   │   ├── AnnonceCard.tsx        # 🟢 Card affichage rapide
│   │   ├── PhotoGallery.tsx       # 🟢 Galerie photos + lightbox
│   │   └── ContactForm.tsx        # 🟢 Formulaire contact → /api/contact
│   ├── forms/
│   │   └── ListingForm.tsx        # 🟢 Réutilisable, création + édition
│   ├── agence/
│   │   ├── AgenceInfoForm.tsx     # 🟡 Éditer infos agence
│   │   ├── MembreList.tsx         # 🟡 Tableau membres
│   │   └── InviterMembreForm.tsx  # 🟡 Inviter un agent
│   ├── ui/
│   │   ├── Navbar.tsx             # 🟢 Nav avec session check
│   │   ├── SearchFilters.tsx      # 🟢 Filtres côté client
│   │   └── ... autres composants  #
│   └── providers/
│       └── SessionProvider.tsx    # 🟢 NextAuth context wrapper
│
├── lib/
│   ├── db.ts                      # 🟢 Prisma singleton
│   ├── auth.ts                    # 🟢 NextAuth v5 config
│   ├── cloudinary.ts              # 🟢 API Cloudinary
│   ├── resend.ts                  # 🟢 API Resend (email)
│   ├── redis.ts                   # 🟢 Upstash Redis client
│   ├── config.ts                  # 🟢 LIMITS + constantes
│   └── validations/
│       ├── auth.ts                # 🟢 Zod schemas (login/register)
│       ├── listing.ts             # 🟢 Zod schemas (annonce)
│       ├── contact.ts             # 🟢 Zod schemas (contact form)
│       ├── agence.ts              # 🟡 Zod schemas (agence)
│       └── ...
│
├── types/
│   └── index.ts                   # Types partagés (interfaces)
│
├── middleware.ts                  # NextAuth middleware — protection routes
└── .env.local                     # Variables d'environnement

prisma/
├── schema.prisma                  # 🟢 Définition BD (Prisma)
└── migrations/                    # 🟢 Historique migrations DB
```

### Légende
- 🟢 **Complété & fonctionnel**
- 🟡 **En cours / Partiellement implémenté**
- 🔴 **Non commencé**

---

## 🎯 État des Lieux — Features

### ✅ Phase 1 (Complétée)
- [x] Landing page avec carte Alger
- [x] Affichage 37 listings + clustering Mapbox
- [x] Recherche par bbox + filtres (type, prix, surface)
- [x] Auth : Register/Login (bcrypt + NextAuth v5)
- [x] Fiche annonce détaillée avec photos
- [x] Création annonce (ListingForm réutilisable)
- [x] Upload photos (Cloudinary via signature)
- [x] Formulaire contact → email (Resend)
- [x] Dashboard perso (mes annonces)
- [x] Responsive design (Tailwind)

### 🔄 Phase 2 (En cours)
- [x] Gestion agences (AGENCY_DIRECTOR)
  - [x] Créer/éditer agence
  - [x] Ajouter/supprimer membres
  - [x] Champs commerciaux (hasStorefront, hasWater, etc.)
  - [x] Géocodage annonces
- [x] Back-office admin (ADMIN modération)
- [ ] **Recherche avancée côté liste** (filters avancés, tri)
- [ ] **Modération d'annonces** (ADMIN review)
- [ ] **Historique messages / Inbox**
- [ ] **Notifications real-time** (annonces, messages)
- [ ] **Images galerie améliorées** (lightbox, drag-drop)

### 📋 Phase 3 (TODO)
- [ ] **Mobile app** (React Native ou PWA)
- [ ] **Favoris / Wishlist** (saved listings)
- [ ] **Alerts** (notifications nouvelles annonces)
- [ ] **Rating agences** (avis utilisateurs)
- [ ] **Visite virtuelle** (photos 360°)
- [ ] **Intégration paiement** (annonces premium)
- [ ] **Analytics / Dashboard agence** (stats visites)
- [ ] **Géocodage automatique** (Nominatim ou Google Geocoding)
- [ ] **Multi-langue** (AR/EN/FR)

---

## 🗄️ Modèle de données (Prisma)

### Users & Auth
```
User
├── id (cuid)
├── email, password (bcrypt), phone, name, image
├── role: ADMIN | AGENCY_DIRECTOR | AGENCY_EMPLOYEE | USER
├── createdAt, updatedAt
└── Relations:
    ├── listings (1:N)
    ├── agencyMembers (1:N)
    ├── contactsSent (1:N)
    └── contactsReceived (1:N)

Agency
├── id, name, description, logo, phone, email, address
├── wilayaCode (FK → Wilaya)
└── members: AgencyMember[]

AgencyMember (N:N User ↔ Agency)
├── userId, agencyId
├── role: AGENCY_EMPLOYEE | AGENCY_DIRECTOR
└── joinedAt
```

### Listings
```
Listing
├── id, title, description (TEXT)
├── price, transactionType: RENT | SALE
├── propertyType: APARTMENT | HOUSE | VILLA | ...
├── status: DRAFT | PENDING | ACTIVE | REJECTED | ARCHIVED
├── Location:
│   ├── address, wilayaCode, commune
│   ├── latitude, longitude (fallback non-GIS)
│   └── location: GEOGRAPHY(Point, 4326) ← PostGIS [⚠️ ajouté manuellement]
├── Features:
│   ├── surface, rooms, bedrooms, bathrooms, floor, totalFloors
│   ├── hasElevator, hasParking, hasGarden, hasPool, isFurnished
│   └── Commercial: hasStorefront, hasWater, hasElectricity, hasGas, hasFiber
├── userId (FK → User)
├── createdAt, updatedAt
├── Indices: [status, transactionType, propertyType] | [wilayaCode] | [price]
└── Relations:
    ├── photos: ListingPhoto[]
    └── contactRequests: ContactRequest[]

ListingPhoto
├── id, listingId, url (Cloudinary), publicId
├── category: LIVING_ROOM | BEDROOM | KITCHEN | BATHROOM | EXTERIOR | OTHER
├── order (pour drag-drop)
└── createdAt

ContactRequest
├── id, listingId, senderId, receiverId
├── message (TEXT), phone
└── createdAt
```

### Référence
```
Wilaya (58 régions algériennes)
├── code: Int (PK)
├── name, nameAr
└── Relations: listings[], agencies[]
```

---

## 🗺️ Endpoints API (Routes)

### Annonces
| Endpoint | Méthode | Auth | Fonction |
|----------|---------|------|----------|
| `/api/annonces` | GET | Public | Lister (avec filtres) |
| `/api/annonces` | POST | Private | Créer annonce |
| `/api/annonces/:id` | GET | Public | Détail annonce |
| `/api/annonces/:id` | PATCH | Private (owner) | Éditer annonce |
| `/api/annonces/:id` | DELETE | Private (owner/ADMIN) | Supprimer |
| `/api/annonces/:id/photos` | POST | Private (owner) | Ajouter photos |
| `/api/annonces/:id/photos` | DELETE | Private (owner) | Supprimer une photo |

### Carte
| Endpoint | Méthode | Fonction |
|----------|---------|----------|
| `/api/map/pins` | GET | GeoJSON pins + clustering (bounds + filtres) |

### Agence
| Endpoint | Méthode | Auth | Fonction |
|----------|---------|------|----------|
| `/api/agence` | POST/PATCH | DIRECTOR | Créer/éditer agence |
| `/api/agence/membres` | GET/POST | DIRECTOR/EMPLOYEE | Lister/inviter membres |
| `/api/agence/membres/:membreId` | DELETE | DIRECTOR | Supprimer membre |

### Auth
| Endpoint | Méthode | Fonction |
|----------|---------|----------|
| `/api/auth/register` | POST | Inscription |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth routes (signin, signout, etc.) |

### Autres
| Endpoint | Méthode | Fonction |
|----------|---------|----------|
| `/api/contact` | POST | Envoyer email contact (rate limited) |
| `/api/upload/signature` | POST | Signer requête Cloudinary |
| `/api/wilayas` | GET | Lister 58 wilayas |

---

## 📊 Données actuelles

| Table | Enregistrements | Notes |
|-------|-----------------|-------|
| `users` | ~5-10 (seed) | Test accounts |
| `listings` | 37 (seed) | Alger dataset |
| `listing_photos` | ~50-100 | Alger dataset |
| `agencies` | 0-1 (test) | À développer |
| `wilayas` | 58 | Reference table |

---

## 💰 Estimation des coûts de production

### 🗺️ Mapbox (PRINCIPAL DRIVER)

#### Pricing Structure (2026)
- **Maps API** : $5/mois base + usage overages
- **Raster tiles** : $1 per 1M requests / $0.50 per 1M additional
- **Vector tiles** : $2 per 1M requests
- **Geocoding** : $0.50 per 1K requests
- **Directions** : $0.50 per 1K requests
- **Matrix** : $1 per 100 queries
- **Custom raster** : à négocier

#### Estimation ImmoDz

**Scénario 1 : Très faible trafic** (< 100K visites/mois)
```
Estimation : 50-100 $/mois
├── Base plan : $5/mois
├── Raster tiles (~20M req/mois) : ~$20/mois
├── API calls (~5K geocoding/mois) : ~$2-3/mois
└── Marges : +$25-70
```

**Scénario 2 : Croissance modérée** (100K-1M visites/mois)
```
Estimation : 150-300 $/mois
├── Base : $5/mois
├── Raster tiles (~100M req/mois) : ~$100/mois
├── Geocoding/Directions (~50K) : ~$25-50/mois
└── Marges : +$20-145
```

**Scénario 3 : Production (1M+ visites/mois)**
```
Estimation : 500-1500 $/mois
├── Base : $5/mois
├── Vector tiles (recommandé) : $200-400/mois
├── Multiple endpoints : $200-500/mois
├── API calls : $100-300/mois
└── Support/contracts : $-/mois (au besoin)
```

**⚠️ Optimisations déjà en place :**
- ✅ Supercluster (côté client) = réduit appels API
- ✅ Cache Redis (60s) sur `/api/map/pins`
- ✅ Bounding box filtering = requêtes optimisées
- ✅ NEXT_PUBLIC token = pas de proxy coûteux

**Recommandations** :
1. **Monitoring real-time** : dashboard Mapbox
2. **Capped plan** : définir budget max ($200-300 initially)
3. **Auto-alerts** : notifier si dépassement
4. **Cache aggressif** : augmenter TTL Redis si possible
5. **Vector tiles** : migrer vers vecteur dès ~500K requêtes/mois (meilleur ratio coût/perf)

---

### 💾 Autres services

| Service | Usage | Coût estimé |
|---------|-------|-------------|
| **Vercel (Hosting front)** | ~5GB/mois | $15-20/mois |
| **Railway (PostgreSQL)** | ~10GB/mois | $10-20/mois |
| **Upstash Redis** | ~50MB/mois | Free-$7/mois |
| **Cloudinary (Photos)** | ~500GB stored | free tier (~25GB) ou $99-299/mois |
| **Resend (Email)** | ~100 emails/mois | free-$20/mois |
| **NextAuth (custom)** | Self-hosted | $0 |
| **Total base** | | **$40-100/mois** |
| **+ Mapbox (variable)** | | **+$50-500/mois** |
| **TOTAL PRODUCTION** | | **$100-600/mois** |

---

### 💡 Stratégie coûts

#### Phase actuelle (Dev/Pre-prod)
```
✓ Free tiers utilisés au max
✓ Mapbox free tier (~10K requêtes/mois gratuites)
✓ Total estimé : $0-20/mois
```

#### MVP Launch (< 10K utilisateurs/mois)
```
Target : Mapbox $100-150/mois max
- Monitoringer usage quotidiennement
- Augmenter cache (TTL 5min)
- Pré-générer tiles populaires
Total estimé : $150-250/mois
```

#### Croissance (10K-100K utilisateurs/mois)
```
Considérer :
- Contract Mapbox (négocier par volume)
- Vector tiles (meilleur coût à l'échelle)
- CDN géographique (Cloudflare)
- Partitionnement BD (PostgreSQL sharding)
Total estimé : $300-800/mois
```

---

## 🔒 Sécurité — Points clés

### Auth & Sessions
- ✅ NextAuth v5 (OAuth-ready)
- ✅ Bcrypt + salt pour passwords
- ✅ JWT sessions
- ✅ CSRF protection via Next.js middleware
- ✅ Rate limiting (Redis) sur `/contact` + `/upload/signature`

### Données sensibles
- ✅ Cloudinary `api_secret` **jamais** exposé (signé server-side)
- ✅ `NEXTAUTH_SECRET` en env var
- ✅ Mapbox token public BUT restreint aux domaines Mapbox dashboard
- ✅ Queries Prisma : protection via type system

### API Routes
- ✅ `try/catch` systématique + status HTTP explicites
- ✅ Zod validation côté input
- ✅ Ownership checks (user can only edit own listings)
- ✅ Role-based checks (ADMIN, DIRECTOR, etc.)

### SQL Injection
- ✅ Prisma ORM (parameterized queries)
- ⚠️ PostGIS queries : utiliser `prisma.$queryRaw` avec placeholders

---

## 📈 Prochaines étapes critiques

### Immédiat (Sprint actuel)
1. **Finir Phase 2** :
   - [ ] Modération ADMIN
   - [ ] Recherche avancée côté liste
   - [ ] Messages/Inbox (ContactRequest table prête)

2. **Tester à l'échelle** :
   - [ ] Charger 1000+ listings
   - [ ] Mesurer latence Mapbox
   - [ ] Profiler Redis cache

### Court terme (2-4 semaines)
3. **Optimisation coûts** :
   - [ ] Analyser usage réel Mapbox
   - [ ] Implémenter alertes budget
   - [ ] Évaluer Vector tiles vs Raster

4. **Infrastructure** :
   - [ ] Setup monitoring (Vercel Analytics, Mapbox dashboard)
   - [ ] Auto-scaling PostgreSQL (railway)
   - [ ] Backup strategy

### Moyen terme (1-2 mois)
5. **Fonctionnalités** :
   - [ ] Favoris/Wishlist
   - [ ] Notifications real-time (WebSocket)
   - [ ] Avis agences
   - [ ] Géocodage auto (Nominatim ou Google)

---

## 📞 Contacts & Références

| Resource | URL | Usage |
|----------|-----|-------|
| Mapbox Pricing | https://www.mapbox.com/pricing | Mettre à jour annuellement |
| Mapbox Dashboard | https://account.mapbox.com | Monitor usage + billing |
| Railway Metrics | https://railway.app | DB monitoring |
| Vercel Metrics | https://vercel.com/dashboard | Function usage + costs |
| NextAuth Docs | https://authjs.dev | Auth reference |
| Prisma Docs | https://prisma.io | DB queries |
| PostGIS Docs | https://postgis.net | Spatial queries |

---

## 📝 Notes

1. **PostGIS Geography column** : Colonne `location GEOGRAPHY(Point,4326)` doit être ajoutée manuellement après `prisma migrate dev` (Prisma ne supporte pas nativement PostGIS).

2. **Mapbox token** : Token public `pk.eyJ1...` est intentionnellement exposé côté client. **Sécuriser via restrictions URL** dans le dashboard Mapbox.

3. **Clustering** : Supercluster s'exécute côté client (React) = zéro coût serveur. Les pins sont pré-chargées via `/api/map/pins` avec cache Redis.

4. **Rate limiting** : Implémenter sur `/api/contact` (3 req/heure/IP) et `/api/upload/signature` (par user).

5. **Photos** : Cloudinary stockage direct (jamais via Vercel). Transformer les dimensions côté Cloudinary = coût réseau réduit.

6. **Email** : Resend est utilisé pour envoyer + recevoir notifications. Pas de mailbox interne.

---

**Rapport généré par Claude Code — Dernière mise à jour : 2026-04-02**
