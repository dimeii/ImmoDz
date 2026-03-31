# ImmoDZ — CLAUDE.md

Plateforme de recherche de biens immobiliers (location / vente) en Algérie.
Inspiré de SeLoger.com, adapté au marché algérien (particuliers + agences).

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Base de données | PostgreSQL 15 + PostGIS |
| ORM | Prisma 5 |
| Auth | NextAuth v5 (Auth.js) |
| Carte | Mapbox GL JS + supercluster |
| Upload photos | Cloudinary |
| Cache | Redis via Upstash |
| Email | Resend |
| Déploiement | Vercel + Railway (PostgreSQL) |
| Styling | Tailwind CSS v3 |
| Validation | Zod |

---

## Structure du projet

```
/
├── CLAUDE.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx               ← homepage (vue carte)
│   │   │   ├── annonces/[id]/page.tsx ← fiche bien
│   │   │   └── recherche/page.tsx     ← résultats liste
│   │   ├── (auth)/
│   │   │   ├── dashboard/             ← tableau de bord
│   │   │   ├── annonces/nouvelle/
│   │   │   ├── annonces/[id]/edit/
│   │   │   └── agence/                ← gestion agence (DIRECTOR)
│   │   ├── admin/                     ← back-office (ADMIN only)
│   │   └── api/
│   │       ├── annonces/
│   │       ├── map/pins/route.ts      ← GeoJSON pour Mapbox
│   │       ├── upload/signature/      ← signature Cloudinary
│   │       └── contact/              ← envoi email via Resend
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.tsx            ← 'use client', Mapbox GL
│   │   │   ├── MapPin.tsx
│   │   │   └── ClusterPin.tsx
│   │   ├── annonces/
│   │   │   ├── AnnonceCard.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   └── ContactForm.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── db.ts                      ← instance Prisma singleton
│   │   ├── auth.ts                    ← config NextAuth
│   │   ├── cloudinary.ts
│   │   ├── resend.ts
│   │   ├── redis.ts
│   │   ├── config.ts                  ← constantes et limites
│   │   └── validations/               ← schémas Zod
│   └── types/index.ts
├── middleware.ts                      ← protection routes NextAuth
└── .env.local
```

---

## Rôles et permissions

4 rôles : `ADMIN` | `AGENCY_DIRECTOR` | `AGENCY_EMPLOYEE` | `USER`

| Action | ADMIN | DIRECTOR | EMPLOYEE | USER |
|--------|-------|----------|----------|------|
| Consulter annonces | ✓ | ✓ | ✓ | ✓ |
| Poster annonce | ✓ | ✓ | ✓ | max 3 |
| Photos par annonce | ∞ | config | config | 10 |
| Gérer son agence | ✓ | ✓ | ✗ | ✗ |
| Modérer | ✓ | ✗ | ✗ | ✗ |

```typescript
// src/lib/config.ts — ne jamais hardcoder ces valeurs
export const LIMITS = {
  USER_MAX_LISTINGS: 3,
  USER_MAX_PHOTOS: 10,
  AGENCY_MAX_PHOTOS: parseInt(process.env.AGENCY_MAX_PHOTOS ?? '50'),
}
```

---

## Modèle de données — résumé

Schéma complet dans `prisma/schema.prisma`.

- `User` — auth + rôle
- `Agency` — agence, liée à un DIRECTOR
- `AgencyMember` — N:N User ↔ Agency
- `Listing` — annonce avec `location GEOGRAPHY(Point,4326)` ← colonne PostGIS
- `ListingPhoto` — photos par catégorie de pièce, avec ordre
- `ContactRequest` — formulaire contact → email + historique BDD
- `Wilaya` — table de référence des 58 wilayas algériennes

---

## Vue carte — clustering

Données chargées depuis `/api/map/pins`, clustering côté client avec `supercluster`.

**Endpoint `/api/map/pins`** reçoit `bounds` (bbox) + filtres, retourne GeoJSON.
Cache Redis : clé = hash(bounds + filtres), TTL 60s.

Requête PostGIS :
```sql
SELECT id, title, price, transaction_type, property_type,
       ST_X(location::geometry) as lng,
       ST_Y(location::geometry) as lat,
       (SELECT url FROM listing_photos
        WHERE listing_id = l.id ORDER BY "order" LIMIT 1) as thumbnail
FROM listings l
WHERE status = 'ACTIVE'
  AND ST_Within(location::geometry, ST_MakeEnvelope($1,$2,$3,$4, 4326))
```

Clustering dans `MapView.tsx` :
```typescript
const cluster = new Supercluster({ radius: 60, maxZoom: 16 })
cluster.load(geoJsonPoints)
const clusters = cluster.getClusters(bounds, zoom)
// count > 1 → <ClusterPin count={N} /> | count === 1 → <MapPin />
```

---

## Système d'email

Pas de messagerie interne. Flux contact :
1. `POST /api/contact` — rate limit 3/heure/IP (Redis)
2. Email à l'agent via Resend
3. Accusé de réception à l'expéditeur via Resend
4. `ContactRequest` enregistrée en BDD

Historique sur `/dashboard/messages` : envoyés + reçus selon le rôle.

---

## Upload photos

Jamais via le serveur Next.js (timeout Vercel 10s). Flux :
```
1. POST /api/upload/signature  →  { signature, timestamp, api_key, cloud_name }
2. Client upload direct → cloudinary.com
3. Cloudinary retourne { secure_url, public_id }
4. POST /api/annonces/:id/photos  →  enregistre en BDD
```

Transformations Cloudinary : `fetch_format:auto,quality:auto,w_1200,c_limit`
Thumbnail : `w_400,h_300,c_fill,g_auto`

---

## Variables d'environnement

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_MAPBOX_TOKEN
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RESEND_API_KEY
AGENCY_MAX_PHOTOS        # optionnel, défaut 50
```

---

## Conventions

- `'use client'` uniquement si interaction navigateur (Mapbox, formulaires)
- Server Components pour les données initiales, SWR pour les updates carte
- `try/catch` systématique dans les API Routes → `{ error: string }` + status HTTP
- Zod pour toute validation (partagé client/serveur)

---

## Gotchas

1. **PostGIS** — utiliser `GEOGRAPHY(Point, 4326)` (pas `GEOMETRY`). Prisma ne supporte pas PostGIS nativement : utiliser `prisma.$queryRaw` pour les requêtes spatiales. Après chaque `prisma migrate dev`, exécuter manuellement :
   ```sql
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);
   CREATE INDEX IF NOT EXISTS listings_location_gist ON listings USING GIST(location);
   ```

2. **Mapbox token** — `NEXT_PUBLIC_MAPBOX_TOKEN` est exposé côté client. Restreindre aux URLs autorisées dans le dashboard Mapbox.

3. **Cloudinary** — ne jamais exposer `api_secret`. La signature est générée server-side uniquement.

4. **NextAuth v5** — config dans `src/lib/auth.ts`, middleware dans `middleware.ts` à la racine (pas dans `pages/`).

5. **Rate limiting** — implémenter sur `/api/contact` ET `/api/upload/signature`.

6. **Photos order** — colonne `order` (Int) dans `ListingPhoto` pour le drag-and-drop.
