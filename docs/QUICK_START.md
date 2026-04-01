# 🚀 ImmoDz — Quick Start Guide

## 1️⃣ PostgreSQL Setup (Windows)

```bash
# Vérifier que PostgreSQL 15 + PostGIS sont installés
psql --version

# Créer la base de données
createdb immodz

# Vérifier la connexion
psql postgresql://admin:admin@localhost:5432/immodz -c "SELECT version();"
```

## 2️⃣ Variables d'environnement ✅

Le fichier `.env.local` est déjà configuré avec :
- ✅ DATABASE_URL pointant vers PostgreSQL local
- ✅ NEXTAUTH_SECRET généré
- ❌ NEXT_PUBLIC_MAPBOX_TOKEN — **À remplir** (voir étape 3)

### Générer un Mapbox Token (gratuit)

1. Aller sur https://account.mapbox.com/tokens/
2. Créer un nouveau token public
3. Copier le token (commence par `pk_`)
4. Coller dans `.env.local` :

```env
NEXT_PUBLIC_MAPBOX_TOKEN="pk_live_..."
```

**Note** : Les autres services (Cloudinary, Upstash, Resend) sont optionnels pour le dev local.

## 3️⃣ Lancer les migrations Prisma

```bash
# Créer/migrer le schéma
npx prisma migrate dev --name init

# Verifier les tables
npx prisma studio
```

> **Important** : Après `npx prisma migrate dev`, il faut configurer PostGIS manuellement. Lancez ceci dans psql :

```sql
psql immodz
\c immodz
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);
CREATE INDEX IF NOT EXISTS listings_location_gist ON listings USING GIST(location);
\q
```

## 4️⃣ Seed des fake data

```bash
# Populate wilayas, users, agencies, listings, etc.
npm run db:seed
```

**Données créées** :
- 5 users (admin, director, employee, user1, user2)
- 1 agence avec 2 membres
- 8 annonces avec coordonnées PostGIS réelles

**Logins disponibles** :
```
Email              Password      Role
──────────────────────────────────────────
admin@immodz.local password123   ADMIN
director@...       password123   DIRECTOR
employee@...       password123   EMPLOYEE
user1@immodz.local password123   USER
user2@immodz.local password123   USER
```

## 5️⃣ Lancer le dev server

```bash
npm run dev
```

Ouvrir http://localhost:3000 — vous devriez voir :
- ✅ **Homepage** avec toggle Carte/Liste
- ✅ **Carte Mapbox** avec 8 annonces + clustering
- ✅ **Filtres** (transaction, bien, wilaya, prix, surface, pièces)
- ✅ **Fiche annonce** en cliquant une annonce
- ✅ **Login** avec credentials au-dessus

## 🧪 Test Flow

1. **Voir les annonces** → Accueil `/`
2. **Tester filtres** → Sélectionner wilaya, type bien, prix
3. **Cliquer une annonce** → Voir `/annonces/[id]` avec photos + contact form
4. **Envoyer un contact** → Email + historique BDD (si RESEND_API_KEY configuré)
5. **Se connecter** → `/login` avec `user1@immodz.local` / `password123`
6. **Dashboard** → `/dashboard` (à implémenter)

## 📝 Prochaines tâches prioritaires

Voir `PROJECT_STATUS.md` section "Prochaines étapes recommandées" :
1. ✅ Configurer PostgreSQL
2. ✅ Migrations Prisma + seed
3. ✅ Tester homepage
4. ⏭️ Créer formulaire **Créer annonce** (#5)
5. ⏭️ Créer formulaire **Éditer annonce** (#6)
6. ⏭️ Drag-drop photos (#7)
7. ⏭️ Dashboard utilisateur (#8)

## 🐛 Troubleshooting

### "DATABASE_URL not found"
```bash
# Vérifier que .env.local existe dans la racine
ls .env.local

# Si seed.ts échoue, lancer migra d'abord
npx prisma migrate dev
```

### Mapbox token vide
La carte ne s'affichera pas sans token. Ajouter un token temporaire pour dev :
```env
NEXT_PUBLIC_MAPBOX_TOKEN="pk_test_abc123"  # Token factice pour dev
```

### PostGIS non activé
```bash
psql immodz
CREATE EXTENSION postgis;
\q
```

## 📚 Docs

- **CLAUDE.md** — Architecture & conventions
- **PROJECT_STATUS.md** — État global du projet
- **prisma/schema.prisma** — Schéma complet
