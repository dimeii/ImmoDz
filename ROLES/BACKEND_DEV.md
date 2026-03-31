# Backend Developer — ImmoDz

## 🎯 Role Summary

Responsable de l'API REST, base de données, logique métier, et intégrations. Veille à la performance, sécurité et scalabilité du backend.

---

## 📋 Responsabilités

- ✅ Concevoir et implémenter les API routes
- ✅ Gérer le schéma Prisma et migrations DB
- ✅ Implémenter logique métier (auth, permissions, validations)
- ✅ Intégrer services externes (Cloudinary, Resend, Mapbox)
- ✅ Optimiser requêtes DB et caching (Redis)
- ✅ Écrire tests unitaires et d'intégration
- ✅ Monitorer et fixer les erreurs serveur
- ✅ Documentation API (endpoints, auth, errors)

---

## 🏗️ Architecture Decisions

### Database (PostgreSQL 15 + PostGIS)
- Usar Prisma ORM pour queries typage-safe
- PostGIS pour géospatial (listings location)
- Indexes stratégiques pour perf (voir schema.prisma)
- Migrations versionées (prisma migrate)

### API Design
- REST + JSON responses
- Auth : NextAuth v5 (JWT + sessions)
- Validation : Zod schemas (client + server)
- Error handling : try-catch + structured responses
- Rate limiting : Redis (Upstash)

### Caching Strategy
- Redis pour pins carte (TTL 60s)
- Rate limits (24h TTL par user)
- Session storage (NextAuth managed)
- ETag/304 Not Modified (optional)

---

## 🔄 API Development Workflow

### Phase 1 : Spec
- [ ] Lire acceptance criteria du PM
- [ ] Sketcher requête/réponse JSON
- [ ] Identifier validations Zod
- [ ] Vérifier auth requirements

### Phase 2 : Implementation
- [ ] Créer route handler (GET/POST/PUT/DELETE)
- [ ] Ajouter validations avec Zod
- [ ] Implémenter logique métier
- [ ] Ajouter error handling + logging
- [ ] Tester avec Postman/curl

### Phase 3 : Testing
- [ ] Unit tests (validation, edge cases)
- [ ] Integration tests (avec DB test)
- [ ] Authorization tests (who can call ?)
- [ ] Performance tests (slow queries ?)

### Phase 4 : Documentation
- [ ] Commenter code complexe
- [ ] Update API docs (voir API.md)
- [ ] Exemples curl/requests
- [ ] Rate limits documentés

---

## 📚 Current API Routes Status

### Implemented ✅
- `GET /api/annonces` — Search listings avec filtres + pagination
- `POST /api/annonces` — Créer listing (auth required)
- `GET /api/annonces/[id]` — Détails listing
- `GET /api/map/pins` — GeoJSON pour carte avec clustering
- `POST /api/contact` — Envoyer message contact
- `GET /api/wilayas` — Liste provinces
- `POST /api/upload/signature` — Signature Cloudinary

### Todo 🔨
- `PUT /api/annonces/[id]` — Éditer listing
- `DELETE /api/annonces/[id]` — Supprimer listing
- `POST /api/annonces/[id]/photos` — Upload photos
- `PATCH /api/annonces/[id]/photos` — Reorder photos
- `DELETE /api/annonces/[id]/photos/[photoId]` — Delete photo
- `GET /api/users/[id]` — User profile
- `PATCH /api/users/[id]` — Edit profile
- `POST /api/users/[id]/password` — Change password
- `POST /api/agencies` — Create agency
- `GET /api/agencies/[id]` — Agency details
- `POST /api/agencies/[id]/members` — Add member
- `GET /api/admin/listings` — Admin : list all listings for moderation
- `PATCH /api/admin/listings/[id]` — Admin : approve/reject
- `GET /api/admin/analytics` — Admin : stats

---

## 🔐 Authorization Checklist

Chaque endpoint MUST verify :

```typescript
// 1. User authenticated ?
const session = await auth();
if (!session?.user?.id) return 401;

// 2. User has required role ?
const role = session.user.role;
if (!['ADMIN', 'DIRECTOR'].includes(role)) return 403;

// 3. User owns resource ? (pour edit/delete)
const listing = await db.listing.findUnique({ where: { id } });
if (listing.userId !== session.user.id && role !== 'ADMIN') return 403;
```

---

## 🐛 Error Handling Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Validation
    const filters = searchFiltersSchema.parse(Object.fromEntries(searchParams));

    // 2. Database query
    const annonces = await db.listing.findMany({ where: {...} });

    // 3. Success response
    return NextResponse.json({ annonces });
  } catch (error) {
    // 4. Error handling
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

## 📊 Database Schema Checklist

- [ ] Tables créées (Users, Listings, Photos, etc.)
- [ ] Indexes sur colonnes fréquemment queryées
- [ ] Foreign keys + cascades appropriés
- [ ] Enums typés (Role, ListingStatus, etc.)
- [ ] Timestamps (createdAt, updatedAt)
- [ ] Soft deletes (status column) si needed
- [ ] PostGIS location column (GEOGRAPHY Point)

---

## 🚀 Performance Optimizations

### Database
- [ ] SELECT only needed columns (not SELECT *)
- [ ] N+1 queries évitées (include relations)
- [ ] Indexes sur where/orderBy columns
- [ ] LIMIT pour pagination

### Caching
- [ ] Redis pour pins carte
- [ ] Redis pour rate limits
- [ ] HTTP caching headers (Cache-Control, ETag)

### API Response
- [ ] Paginer gros result sets (max 50 items)
- [ ] Compress responses (gzip auto avec Next.js)
- [ ] Lazy-load images (thumbnail URLs au lieu de base64)

---

## 🧪 Testing Requirements

### Unit Tests
```
tests/
  lib/
    db.test.ts           // Prisma queries
    validations.test.ts  // Zod schemas
    auth.test.ts         // Auth logic
```

### Integration Tests
```
tests/
  api/
    annonces.test.ts     // GET/POST/PUT/DELETE
    contact.test.ts      // Contact form
    auth.test.ts         // Login/register
```

### Test Patterns
```typescript
describe('GET /api/annonces', () => {
  it('returns listings with valid filters', async () => {...});
  it('rejects invalid filters', async () => {...});
  it('respects pagination limit', async () => {...});
  it('returns 401 if auth required but missing', async () => {...});
});
```

---

## 📋 Definition of Done (Backend)

- [ ] Route handler implémenté
- [ ] Validations Zod en place
- [ ] Authorization checks complètes
- [ ] Error handling + logging
- [ ] Unit tests (coverage ≥ 80%)
- [ ] Integration tests passées
- [ ] API docs updatées
- [ ] Tested avec Postman/curl
- [ ] Performance OK (< 500ms)
- [ ] Code review passée
- [ ] Typescript sans erreurs
- [ ] Linting OK

---

## 🛠️ Tools & Commands

```bash
# Database
npx prisma migrate dev --name <description>  # Create migration
npx prisma studio                             # GUI
npx prisma generate                           # Regenerate client

# Testing
npm run test -- api/annonces.test.ts          # Run specific test
npm run test:watch                            # Watch mode
npm run test:coverage                         # Coverage report

# Linting
npm run lint                                  # ESLint
npx tsc --noEmit                              # TypeScript check

# Dev server
npm run dev                                   # Next.js dev on :3000
```

---

## 📖 API Documentation Template

```markdown
## GET /api/annonces

Récupère liste annonces avec filtres.

### Authentication
- Required: No
- Role: Any

### Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| `transactionType` | string | RENT \| SALE |
| `wilayaCode` | number | 1-58 |
| `priceMin` | number | Min price |
| `page` | number | Page number (default: 1) |

### Response (200 OK)
```json
{
  "annonces": [...],
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### Error Responses
- 400 : Invalid filters (see ZodError in response)
- 500 : Server error
```

---

## 🔗 Integration Checklist

- [ ] Cloudinary — signature generation + upload validation
- [ ] Resend — email sending + error handling
- [ ] PostGIS — location queries + clustering
- [ ] Redis — cache + rate limiting
- [ ] NextAuth — session management + callbacks

---

## 💡 Code Style & Conventions

1. **Naming** : camelCase pour variables, SCREAMING_SNAKE_CASE pour constants
2. **Error messages** : User-friendly FR, include actionable hint
3. **Logging** : console.error(), console.warn(), console.info() with context
4. **Comments** : Why > What > How, especially for complex logic
5. **Type safety** : Never use `any`, use `unknown` + type guards
6. **Null handling** : Check for null/undefined explicitly
7. **Performance** : First optimize DB queries, then API responses

---

**Owner** : Backend Developer
**Last Updated** : 31 mars 2026
