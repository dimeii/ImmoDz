# ImmoDz — État des lieux du projet

**Date** : 31 mars 2026
**Repo** : https://github.com/dimeii/ImmoDz
**Commit initial** : a2c164f

---

## 📊 Avancement global

**70-80% d'avancement** — Fondations solides, interfaces publiques complètes, authentication en place, API fonctionnelle. Reste : formulaires authentifiés (créer/éditer annonces), dashboard utilisateur, modération.

---

## ✅ Implémenté

### Infrastructure & Stack
- ✅ Next.js 14 (App Router) + TypeScript strict
- ✅ Prisma 5 ORM avec PostgreSQL 15 + PostGIS
- ✅ NextAuth v5 (Auth.js) avec credentials provider
- ✅ Tailwind CSS v4 + PostCSS
- ✅ Redis Upstash pour caching
- ✅ Mapbox GL JS + Supercluster
- ✅ Cloudinary (upload photos)
- ✅ Resend (email)

### Modèle de données
- ✅ Users, Agencies, AgencyMembers (rôles : ADMIN, DIRECTOR, EMPLOYEE, USER)
- ✅ Listings (annonces) avec PostGIS location
- ✅ ListingPhotos (catégories pièces + ordering)
- ✅ ContactRequests (historique messages)
- ✅ Wilayas (58 provinces algériennes en arabe)

### Pages publiques
- ✅ **Homepage** (`/`) — Vue unifiée avec toggle Carte/Liste
  - Sidebar filtres (transaction type, bien, wilaya, prix, surface, pièces)
  - **Vue Carte** — Mapbox avec clustering Supercluster
  - **Vue Liste** — Grille d'annonces avec pagination
  - Filtres temps réel, cache Redis (60s)
- ✅ **Fiche annonce** (`/annonces/[id]`) — Détails complets + photos + formulaire contact
- ✅ **Login** (`/login`) — Credentials auth
- ✅ **Register** (`/register`) — Inscription utilisateurs

### API Routes
- ✅ `GET/POST /api/annonces` — Recherche, création listings
- ✅ `GET/PUT/DELETE /api/annonces/[id]` — Gestion annonce individuelle
- ✅ `POST /api/annonces/[id]/photos` — Upload photos
- ✅ `GET /api/map/pins` — GeoJSON pour carte (avec clustering coords)
- ✅ `POST /api/contact` — Envoi email + enregistrement BDD
- ✅ `POST /api/upload/signature` — Signature Cloudinary (upload côté client)
- ✅ `POST /api/auth/register` — Inscription API
- ✅ `GET /api/wilayas` — Liste provinces

### Composants UI
- ✅ **Navbar** — Logo, liens, auth state
- ✅ **SearchFilters** — 8 filtres (transaction, bien, wilaya, prix min/max, surface min/max, pièces)
- ✅ **AnnonceCard** — Affichage annonce (thumb, prix, type, surface, pièces, wilaya)
- ✅ **AnnonceList** — Grille responsive + pagination
- ✅ **MapView** — Mapbox + clustering + markers interactifs
- ✅ **PhotoGallery** — Affichage photos par catégorie
- ✅ **ContactForm** — Formulaire contact avec validation Zod

---

## ⚠️ Non implémenté / À faire

### Pages authentifiées (stubées)
- ❌ **Dashboard** (`/dashboard`) — Affichage annonces utilisateur, pas encore de UI
- ❌ **Créer annonce** (`/annonces/nouvelle`) — Form complète manquante
- ❌ **Éditer annonce** (`/annonces/[id]/edit`) — Form pré-remplie manquante
- ❌ **Gestion agence** (`/agence`) — Interface DIRECTOR seulement
- ❌ **Admin panel** (`/admin`) — Modération, statistiques

### Fonctionnalités manquantes
- ❌ Rate limiting sur uploads (`/api/upload/signature`)
- ❌ Protection middleware par rôle (auth seulement)
- ❌ Workflow modération (DRAFT → PENDING → ACTIVE/REJECTED)
- ❌ Drag-and-drop ordering photos
- ❌ Historique messages (`/dashboard/messages`)
- ❌ Notifications emails templates
- ❌ Search avancée (saved searches, alerts)
- ❌ Tests (unit, integration, E2E)

---

## 🔧 Configuration requise

### Variables d'environnement (`.env.local`)
Fichier créé. À remplir :

```env
# Base de données (obligatoire pour fonctionner)
DATABASE_URL="postgresql://user:password@localhost:5432/immodz"

# NextAuth (prêt, secret généré)
NEXTAUTH_SECRET="fN5kXDBWWiPjnb5hlk08EVnK0LrHVkNoAhz+a5o/qrA="
NEXTAUTH_URL="http://localhost:3000"

# Mapbox (obligatoire pour carte)
NEXT_PUBLIC_MAPBOX_TOKEN="pk_..."

# Cloudinary (optionnel pour uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Redis Upstash (optionnel mais recommandé)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Resend (optionnel pour emails)
RESEND_API_KEY=""
```

### Base de données
1. **PostgreSQL 15** avec **PostGIS** activé
2. Créer la base : `createdb immodz`
3. Lancer migrations : `npx prisma migrate dev`
4. Seed wilayas : `npm run db:seed`

### Services externes
- **Mapbox** — Token depuis account.mapbox.com (gratuit 50k vues/mois)
- **Cloudinary** — Clés depuis cloudinary.com (gratuit 25GB/mois)
- **Upstash Redis** — URL/token depuis upstash.com (gratuit 10k cmd/jour)
- **Resend** — API key depuis resend.com (gratuit pour dev)

---

## 🚀 Commandes

```bash
# Dev
npm run dev                 # Serveur local sur :3000

# Build & production
npm run build
npm start

# DB
npx prisma migrate dev     # Créer migrations
npx prisma studio         # GUI Prisma
npm run db:seed           # Seed wilayas

# Linting
npm run lint
```

---

## 📝 Changements depuis le dernier checkpoint

### Refactors
1. **Homepage unifiée** — Page `/` avec toggle Carte/Liste (avant : 2 pages `/` et `/recherche` séparées)
2. **SearchFilters enrichis** — Ajout surface + pièces + réinitialiser
3. **AnnonceList nouveau** — Composant grille + pagination réutilisable
4. **API `/map/pins`** — Support des nouveaux filtres (wilaya, surface, pièces)
5. **Tailwind v4** — Migration de v3 (PostCSS plugin separate package)
6. **MapView bugfixes** — Null checks + typage supercluster

### Routes changées
- `/recherche` → redirige vers `/`
- Navbar « Rechercher » supprimé (redondant avec homepage)

---

## 🎯 Prochaines étapes recommandées

### Court terme (semaine 1)

#### 1️⃣ Configurer PostgreSQL 15 + PostGIS localement
- [ ] Installer PostgreSQL 15 (avec PostGIS dans l'installeur Windows)
- [ ] Créer la base : `createdb immodz`
- [ ] Vérifier PostGIS : `psql immodz -c "CREATE EXTENSION postgis;"`
- [ ] Tester connexion : `psql postgresql://user:pass@localhost:5432/immodz`

#### 2️⃣ Remplir variables env (.env.local)
**Fichiers à modifier** : `.env.local`
- [ ] DATABASE_URL — ta connexion PostgreSQL locale
- [ ] NEXT_PUBLIC_MAPBOX_TOKEN — depuis https://account.mapbox.com (gratuit)
- [ ] NEXTAUTH_SECRET — déjà généré ✅
- [ ] UPSTASH_REDIS_REST_URL + TOKEN — optionnel pour dev local (use in-memory par défaut)
- [ ] CLOUDINARY_* — optionnel pour dev (skip uploads)
- [ ] RESEND_API_KEY — optionnel pour dev (skip emails)

#### 3️⃣ Migrations Prisma & seed
**CLI commands** :
```bash
npx prisma migrate dev --name init
npm run db:seed                        # Populate wilayas
npx prisma studio                      # Vérifier schéma en GUI
```

#### 4️⃣ Tester homepage (carte + liste)
- [ ] `npm run dev` — serveur sur :3000
- [ ] Naviguer `/` — vérifier toggle Carte/Liste apparaît
- [ ] Cliquer toggle — passer de carte à liste
- [ ] Filtres — changer transaction type, bien, wilaya → résultats changent
- [ ] Créer 3-5 annonces de test en BDD pour voir données

#### 5️⃣ Créer formulaire **Créer annonce** (`/annonces/nouvelle`)

**Fichiers à créer/modifier** :
- `src/components/forms/ListingForm.tsx` — Formulaire réutilisable (create + edit)
  - Champs : titre, description, prix, type transaction, type bien, wilaya, commune
  - Champs optionnels : adresse, surface, pièces, chambres, salles de bain, étage, ascenseur, parking, jardin, piscine, meublé, année construction
  - Validation Zod (déjà défini dans `src/lib/validations/listing.ts`)
  - État form (isSubmitting, errors)
  - Location picker (map click ou input adresse)

- `src/app/(auth)/annonces/nouvelle/page.tsx` — Page créer
  - Wrapper auth (vérifier session)
  - Appeler `<ListingForm mode="create" />`
  - Rediriger vers `/annonces/[id]/edit` après création pour upload photos

- `src/app/api/annonces/route.ts` — Améliorer POST
  - Vérifier limite USER_MAX_LISTINGS (3 pour USER, illimité pour DIRECTOR/ADMIN)
  - Stocker location PostGIS si lat/lng fournis
  - Retourner ID annonce créée pour redirect

**Composants enfants** :
- `<LocationPicker />` — Click sur map ou géoloc automatique
- `<RichTextEditor />` (optionnel) — Description formatée

**Tests** :
- [ ] Créer annonce sans auth → 401
- [ ] USER crée 3 annonces → ok, 4e → 403 (limite atteinte)
- [ ] DIRECTOR crée N annonces → ok (pas limite)
- [ ] Location stockée en PostGIS → vérifiable en `npx prisma studio`

---

### Moyen terme (semaine 2-3)

#### 6️⃣ Formulaire **Éditer annonce** + validations

**Fichiers à créer/modifier** :
- `src/app/(auth)/annonces/[id]/edit/page.tsx` — Page éditer
  - Récupérer annonce : `GET /api/annonces/[id]`
  - Vérifier user owner ou DIRECTOR/ADMIN
  - Pré-remplir `<ListingForm mode="edit" listing={annonce} />`
  - Bouton "Supprimer" (soft delete → status ARCHIVED)

- `src/app/api/annonces/[id]/route.ts` — Améliorer PUT
  - Vérifier authorization (owner || DIRECTOR || ADMIN)
  - Validator avec `createListingSchema`
  - Mettre à jour PostGIS location si coords changent
  - Retourner annonce updatée

- `src/app/api/annonces/[id]/route.ts` — Améliorer DELETE
  - Soft delete : `status = 'ARCHIVED'` (pas de suppression réelle)
  - Retourner 200 ok

**Validations** :
- [ ] Utilisateur non-auth ne peut pas accéder
- [ ] USER ne peut éditer QUE ses propres annonces
- [ ] DIRECTOR peut éditer annonces de son agence
- [ ] ADMIN peut éditer toutes annonces
- [ ] Changement prix/localisation OK
- [ ] Submission invalide → erreurs form affichées

#### 7️⃣ Composant drag-and-drop photos

**Fichiers à créer/modifier** :
- `src/components/forms/PhotoUploadDnD.tsx` — Nouveau composant
  - Drag-and-drop zone (ou click select)
  - Preview avant upload
  - Catégorie par photo (LIVING_ROOM, BEDROOM, KITCHEN, BATHROOM, etc.)
  - Ordre (drag to reorder)
  - Upload vers Cloudinary (get signature from `/api/upload/signature`)
  - Progress bar par photo
  - Delete photo

- `src/app/(auth)/annonces/[id]/edit/page.tsx` — Ajouter section photos
  - Afficher photos existantes avec ordre actuel
  - `<PhotoUploadDnD listingId={id} />`

- `src/app/api/annonces/[id]/photos/route.ts` — Améliorer POST
  - Vérifier authorization (owner || DIRECTOR || ADMIN)
  - Vérifier limite (USER max 10 photos, DIRECTOR/AGENCY configurable)
  - Incrémenter `order` automatiquement
  - Vérifier Cloudinary public_id valide
  - Retourner photo créée

- `src/app/api/annonces/[id]/photos/route.ts` — Ajouter PATCH (reorder)
  - Body : `{ photos: [{ id, order }, ...] }`
  - Bulk update orders

- `src/app/api/annonces/[id]/photos/[photoId]/route.ts` — DELETE photo
  - Supprimer en BDD
  - Optionnel : supprimer sur Cloudinary

**Librairies** :
- `react-dropzone` (drag-drop)
- Cloudinary JS SDK (upload côté client avec signature)

**Tests** :
- [ ] Drag photos → ordre change
- [ ] Upload 15 photos (USER) → max 10 error
- [ ] Delete photo → retirer de grille
- [ ] Catégorie par photo → metadata correcte

#### 8️⃣ Page **Dashboard** utilisateur

**Fichiers à créer/modifier** :
- `src/app/(auth)/dashboard/page.tsx` — Dashboard complet
  - Onglets : Mes annonces | Mes messages | Profil

  **Onglet "Mes annonces"** :
    - Tableau : titre, prix, type, statut, créé, actions (éditer, supprimer, voir fiche)
    - Filtres : statut (DRAFT, PENDING, ACTIVE, ARCHIVED)
    - Pagination
    - Bouton "Nouvelle annonce"
    - Stats : total listings, actives, en attente, archivées

  **Onglet "Mes messages"** :
    - Historique ContactRequests envoyés + reçus
    - Tableau : de/vers, message, annonce, date, lu (checkmark)
    - Filtres : envoyés/reçus
    - Répondre via email manuellement

  **Onglet "Profil"** :
    - Form éditable : nom, email, téléphone, photo profil
    - Bouton "Changer mot de passe"
    - Lien "Devenir agence" (pour DIRECTOR)

- `src/app/api/users/[id]/route.ts` — PATCH profil utilisateur
  - Vérifier authorization (self ou ADMIN)
  - Validator : nom (optional), téléphone (optional), image (Cloudinary)
  - Retourner user updaté

- `src/app/api/users/[id]/password/route.ts` — POST change password
  - Vérifier authorization (self)
  - Body : oldPassword, newPassword
  - Vérifier oldPassword correct (bcrypt compare)
  - Hash newPassword, sauvegarder
  - Retourner 200 ok

**Composants enfants** :
- `<MyListingsTable />` — Tableau listings
- `<MessagesLog />` — Historique messages
- `<ProfileForm />` — Édition profil

**Tests** :
- [ ] Non-auth → redirect /login
- [ ] USER voir QUE ses annonces
- [ ] DIRECTOR voir annonces de son agence
- [ ] Edit profil → update dans BDD
- [ ] Change password → login avec nouveau pass

#### 9️⃣ Rate limiting uploads

**Fichiers à créer/modifier** :
- `src/app/api/upload/signature/route.ts` — Améliorer rate limiting
  - Redis key : `upload:${userId}:${date}`
  - Limit : AGENCY_MAX_PHOTOS uploads par jour (config en .env)
  - Incrémenter compteur Redis (TTL 24h)
  - Si compteur > limit → 429 Too Many Requests

- `src/lib/config.ts` — Ajouter constant
  ```typescript
  export const LIMITS = {
    USER_MAX_LISTINGS: 3,
    USER_MAX_PHOTOS: 10,
    AGENCY_MAX_PHOTOS: parseInt(process.env.AGENCY_MAX_PHOTOS ?? '50'),
    UPLOADS_PER_DAY: parseInt(process.env.UPLOADS_PER_DAY ?? '100'), // nouveau
  }
  ```

**Tests** :
- [ ] Faire 100+ requests /api/upload/signature → 429 après limit
- [ ] Vérifier Redis key expire après 24h
- [ ] Different users ont différents compteurs

#### 🔟 Middleware protection par rôle

**Fichiers à créer/modifier** :
- `middleware.ts` — Améliorer middleware existant
  - Import authConfig
  - Vérifier session.user.role pour certaines routes
  - Routes :
    - `/dashboard/*` → USER|DIRECTOR|EMPLOYEE|ADMIN
    - `/agence/*` → DIRECTOR|ADMIN seulement
    - `/admin/*` → ADMIN seulement
  - Redirect non-autorisé vers `/` ou `/login`

- `src/lib/auth.ts` — Vérifier callbacks NextAuth
  - `authorized()` — validé par middleware
  - `jwt()` — include role dans token
  - `session()` — include role dans session.user

**Tests** :
- [ ] USER accède /dashboard → ok
- [ ] USER accède /agence → 403 Forbidden (redirect /)
- [ ] DIRECTOR accède /admin → 403
- [ ] ADMIN accède tous → ok

---

### Long terme

#### 1️⃣1️⃣ Gestion agence (DIRECTOR)

**Fichiers à créer/modifier** :
- `src/app/(auth)/agence/page.tsx` — Interface gestion agence
  - Onglets : Infos | Membres | Annonces | Analytics

  **Onglet "Infos"** :
    - Form : nom, description, logo, téléphone, email, adresse, wilaya
    - Validation

  **Onglet "Membres"** :
    - Liste membres : nom, email, rôle (DIRECTOR/EMPLOYEE), joined date
    - Ajouter membre (form email + rôle)
    - Modifier rôle
    - Supprimer membre
    - Invitation email (optionnel)

  **Onglet "Annonces"** :
    - Vue toutes annonces de l'agence
    - Filtres + tri

  **Onglet "Analytics"** :
    - Stats : nb listings actives, total vues, contacts reçus ce mois
    - Graphique listings par mois

- API Routes :
  - `src/app/api/agencies/route.ts` — POST créer agence (user DIRECTOR)
  - `src/app/api/agencies/[id]/route.ts` — GET/PUT agence (DIRECTOR own || ADMIN)
  - `src/app/api/agencies/[id]/members/route.ts` — GET/POST membres (DIRECTOR || ADMIN)
  - `src/app/api/agencies/[id]/members/[memberId]/route.ts` — PATCH/DELETE membre

**Permissions** :
- [ ] USER ne peut pas créer agence
- [ ] DIRECTOR peut créer une agence (devient owner)
- [ ] DIRECTOR peut ajouter EMPLOYEE seulement
- [ ] DIRECTOR ne peut pas supprimer self
- [ ] ADMIN peut tout

#### 1️⃣2️⃣ Admin panel + modération

**Fichiers à créer/modifier** :
- `src/app/admin/page.tsx` — Dashboard admin
  - Onglets : Listings | Users | Agencies | Reports

  **Onglet "Listings"** :
    - Tableau tous listings : titre, user, status, créé, actions (approve/reject)
    - Filtres : status (DRAFT, PENDING, ACTIVE, REJECTED, ARCHIVED)
    - Bulk actions : approve multiple, reject multiple
    - Afficher reason pour rejets

  **Onglet "Users"** :
    - Tableau : email, nom, rôle, created, listings count
    - Filtres + sort
    - Action : changer rôle, suspendre (flag is_suspended)

  **Onglet "Agencies"** :
    - Tableau : nom, owner, members count, listings count
    - Action : supprimer agence (soft)

  **Onglet "Reports"** :
    - Stats : total users, listings (by status), contacts, revenue
    - Graphiques : new users/listings par jour

- API Routes :
  - `src/app/api/admin/listings/[id]/route.ts` — PATCH approve/reject (ADMIN)
  - `src/app/api/admin/users/[id]/role/route.ts` — PATCH change user role (ADMIN)
  - `src/app/api/admin/analytics/route.ts` — GET stats (ADMIN)

**Email notification** :
- [ ] User reçoit email quand listing approuvé
- [ ] User reçoit email + raison si listing rejeté

#### 1️⃣3️⃣ Notifications / emails templates

**Fichiers à créer/modifier** :
- `src/lib/emails/` — Folder pour templates email
  - `ListingApproved.tsx` — Template approuvé (JSX → HTML)
  - `ListingRejected.tsx` — Template rejeté + raison
  - `ContactRequest.tsx` — Nouveau contact reçu
  - `ContactReply.tsx` — Réponse contact
  - `RegistrationWelcome.tsx` — Bienvenue

- `src/lib/resend.ts` — Améliorer envoi emails
  - Fonctions : sendListingApproved(), sendListingRejected(), etc.
  - Utiliser templates JSX → render HTML
  - Try-catch + logging

- Intégration workflows :
  - Admin approuve listing → email user
  - User envoie contact → email propriétaire + user
  - Inscription → email bienvenue

**Librairies** :
- `@react-email/components` — Templates JSX pour Resend

#### 1️⃣4️⃣ Tests (jest, playwright)

**Structure** :
```
__tests__/
  unit/
    lib/auth.test.ts
    lib/validations.test.ts
    utils/
  integration/
    api/annonces.test.ts
    api/contact.test.ts
  e2e/
    homepage.spec.ts
    create-listing.spec.ts
```

**Coverage** :
- [ ] Validations Zod — tous les cas
- [ ] API routes — auth, permissions, edge cases
- [ ] Components — snapshots, interactions
- [ ] E2E — user flows (login → create listing → contact)

**Setup** :
- Jest + TypeScript
- @testing-library/react
- Playwright
- Database fixtures (test DB)

#### 1️⃣5️⃣ Déploiement (Vercel + Railway)

**Étapes** :
1. Créer account Vercel, connecter GitHub repo
2. Créer account Railway, créer PostgreSQL database
3. Créer Upstash Redis (ou utiliser Railway)
4. Configurer variables d'env sur Vercel
5. Configurer Cloudinary + Mapbox tokens
6. Deploy : `git push` → Vercel redeploy auto
7. Vérifier migrations auto-run sur Railway
8. Domain custom (optionnel)

**CI/CD** :
- [ ] GitHub Actions pour tests avant deploy
- [ ] Staging env (preview branches)
- [ ] Production env (main branch)

---

## 📚 Docs de référence

- **CLAUDE.md** — Architecture, gotchas, conventions
- **prisma/schema.prisma** — Modèle de données complet
- **src/lib/validations/** — Schémas Zod (input validation)
- **GitHub** — https://github.com/dimeii/ImmoDz

---

## ⚡ Notes techniques

**PostGIS gotcha** — Colonne `location GEOGRAPHY(Point, 4326)` doit être créée manuellement après `prisma migrate` (Prisma ne supporte pas PostGIS nativement). Voir ligne 187 du schema.

**Mapbox token** — Restreindre aux domaines autorisés dans Mapbox dashboard (sécurité, limiter vol de token).

**Session typing** — Certains accès à `session.user.role` ne sont pas fortement typés. À améliorer avec AuthJS callbacks.

---

## 📞 Contact & Support

Repo GitHub : https://github.com/dimeii/ImmoDz
Issues pour bugs/features : GitHub Issues

---

**État du projet** ✅ Prêt pour développement local après config DB + env vars.
