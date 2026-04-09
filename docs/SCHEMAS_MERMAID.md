# ImmoDz — Schémas Mermaid

Tous les diagrammes ci-dessous sont au format **Mermaid**. 

**Visualiser** :
- VS Code : install ext. "Markdown Preview Mermaid Support"
- Navigateur : copie le code sur https://mermaid.live

---

## 1️⃣ Architecture Système

```mermaid
graph TB
    subgraph Client["🖥️ CLIENT (Browser)"]
        A["React 18 SPA<br/>(Next.js 14 App Router)"]
        A1["MapView<br/>(Mapbox GL)"]
        A2["Pages Publiques<br/>(Recherche, Fiche)"]
        A3["Dashboard<br/>(Annonces, Profil)"]
        A4["Admin<br/>(Modération)"]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end

    subgraph Server["⚙️ BACKEND (Next.js API Routes)"]
        B["NextAuth Middleware"]
        B1["Auth Routes<br/>(/auth/register)"]
        B2["Data Routes<br/>(/annonces, /agence)"]
        B3["Map Routes<br/>(/api/map/pins)"]
        B4["Upload Routes<br/>(/upload/signature)"]
        B5["Contact Routes<br/>(/api/contact)"]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
        B --> B5
    end

    subgraph Storage["💾 STORAGE & SERVICES"]
        C["PostgreSQL 15<br/>+ PostGIS"]
        D["Upstash Redis<br/>(Cache)"]
        E["Cloudinary<br/>(Photos)"]
        F["Mapbox GL<br/>(Tiles)"]
        G["Resend<br/>(Email)"]
    end

    Client -->|HTTPS| Server
    Server --> C
    Server --> D
    Server --> E
    Server -->|API| F
    Server -->|API| G

    style Client fill:#e1f5ff
    style Server fill:#f3e5f5
    style Storage fill:#e8f5e9
```

---

## 2️⃣ Modèle de données (Prisma)

```mermaid
erDiagram
    USER ||--o{ LISTING : creates
    USER ||--o{ AGENCY_MEMBER : has
    USER ||--o{ CONTACT_REQUEST : sends
    USER ||--o{ CONTACT_REQUEST : receives
    
    AGENCY ||--o{ AGENCY_MEMBER : has
    AGENCY ||--o{ WILAYA : "located in"
    
    LISTING ||--o{ LISTING_PHOTO : has
    LISTING ||--o{ CONTACT_REQUEST : receives
    LISTING }o--|| WILAYA : "located in"
    LISTING }o--|| USER : "posted by"

    USER {
        string id PK
        string email UK
        string password
        string phone
        enum role "ADMIN|DIRECTOR|EMPLOYEE|USER"
        datetime createdAt
    }

    AGENCY {
        string id PK
        string name
        text description
        string logo
        string phone
        int wilayaCode FK
    }

    AGENCY_MEMBER {
        string id PK
        string userId FK
        string agencyId FK
        enum role
        datetime joinedAt
    }

    LISTING {
        string id PK
        string title
        text description
        float price
        enum transactionType "RENT|SALE"
        enum propertyType "APARTMENT|HOUSE|VILLA|..."
        enum status "DRAFT|PENDING|ACTIVE|REJECTED|ARCHIVED"
        string address
        int wilayaCode FK
        float latitude
        float longitude
        float surface
        int rooms
        int bedrooms
        boolean hasElevator
        string userId FK
        datetime createdAt
    }

    LISTING_PHOTO {
        string id PK
        string listingId FK
        string url
        string publicId
        enum category "LIVING_ROOM|BEDROOM|..."
        int order
    }

    CONTACT_REQUEST {
        string id PK
        string listingId FK
        string senderId FK
        string receiverId FK
        text message
        string phone
        datetime createdAt
    }

    WILAYA {
        int code PK
        string name
        string nameAr
    }
```

---

## 3️⃣ Flux : Créer une annonce

```mermaid
sequenceDiagram
    participant User as 👤 User<br/>(Connected)
    participant Client as 🖥️ React<br/>(ListingForm)
    participant API as ⚙️ API<br/>/api/annonces
    participant DB as 💾 PostgreSQL
    participant Cloud as ☁️ Cloudinary
    participant Email as 📧 Resend

    User->>Client: Remplit formulaire annonce
    Client->>Client: Validation Zod client-side
    
    User->>Cloud: Upload photos<br/>(signature)
    API->>Cloud: Generate signature
    Cloud-->>API: signature + timestamp
    API-->>Client: signature
    Client->>Cloud: Upload photos<br/>(direct)
    Cloud-->>Client: { secure_url, public_id }
    
    Client->>API: POST /api/annonces<br/>{title, price, photos[], ...}
    API->>API: Validation Zod server-side
    API->>DB: Prisma: create Listing + ListingPhotos
    DB-->>API: { id, title, createdAt }
    
    API->>API: Status = PENDING<br/>(Await moderation)
    
    API-->>Client: { success: true, listingId }
    Client->>User: ✅ Annonce créée<br/>En attente de modération
    
    Note over API,Email: [FUTURE] Admin review
    Note over Email: Email notif ADMIN pour review
```

---

## 4️⃣ Flux : Visualiser sur la carte

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Client as 🖥️ React<br/>(MapView)
    participant API as ⚙️ API<br/>/api/map/pins
    participant Redis as 🔴 Redis<br/>(Cache)
    participant DB as 💾 PostgreSQL
    participant Mapbox as 🗺️ Mapbox GL

    User->>Client: Ouvre la carte
    Client->>Client: Supercluster init
    
    Client->>API: GET /api/map/pins<br/>?bounds=...&filters=...
    
    API->>Redis: Check cache<br/>key = hash(bounds+filters)
    
    alt Cache HIT (TTL < 60s)
        Redis-->>API: GeoJSON cached
    else Cache MISS
        API->>DB: PostGIS query<br/>ST_Within(location, bbox)
        DB-->>API: listings { lat, lng, thumb }
        API->>API: Format GeoJSON
        API->>Redis: SET cache (TTL 60s)
    end
    
    API-->>Client: GeoJSON FeatureCollection
    
    Client->>Client: Supercluster.load(features)
    Client->>Client: Supercluster.getClusters(bbox, zoom)
    Client->>Mapbox: Render clusters + pins
    Mapbox-->>Client: 🗺️ Map rendered
    
    Client->>User: ✅ Carte avec pins/clusters

    Note over API,Redis: Cache saved ~50% API calls<br/>at zoom changes
```

---

## 5️⃣ Flux : Authentification (Register → Login → Dashboard)

```mermaid
graph LR
    A["🏠 Homepage<br/>(Public)"] -->|Click 'S'inscrire'| B["📝 Register<br/>/register"]
    B -->|POST /api/auth/register| C["⚙️ NextAuth<br/>(Hash + Create User)"]
    C -->|Save to DB| D["💾 PostgreSQL"]
    D -->|User created| E["🔐 NextAuth<br/>(Generate Session)"]
    E -->|Set cookie| F["🖥️ Browser"]
    F -->|Redirect| G["🏠 Homepage<br/>(Logged In)"]
    G -->|Click 'Dashboard'| H["📊 Dashboard<br/>Protected route"]
    H -->|Check middleware| I["🔐 NextAuth<br/>Validate session"]
    I -->|Valid ✓| H
    H -->|GET /api/annonces?userId| J["⚙️ API"]
    J -->|SELECT FROM listings| D
    D -->|Return my listings| J
    J -->|JSON| H
    H -->|Render| K["👤 My Listings"]

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style H fill:#c8e6c9
    style K fill:#c8e6c9
```

---

## 6️⃣ Structure dossiers (src/)

```mermaid
graph TD
    A["src/"] --> A1["app/"]
    A --> A2["components/"]
    A --> A3["lib/"]
    A --> A4["types/"]
    
    A1 --> A1a["(public)/"]
    A1 --> A1b["(auth)/"]
    A1 --> A1c["admin/"]
    A1 --> A1d["api/"]
    A1 --> A1e["layout.tsx"]
    
    A1a --> A1a1["page.tsx<br/>(homepage)"]
    A1a --> A1a2["annonces/[id]/"]
    A1a --> A1a3["recherche/"]
    A1a --> A1a4["login/"]
    A1a --> A1a5["register/"]
    
    A1b --> A1b1["dashboard/"]
    A1b --> A1b2["annonces/"]
    A1b --> A1b3["agence/"]
    
    A1d --> A1d1["auth/"]
    A1d --> A1d2["annonces/"]
    A1d --> A1d3["map/pins/"]
    A1d --> A1d4["upload/"]
    A1d --> A1d5["contact/"]
    A1d --> A1d6["agence/"]
    
    A2 --> A2a["map/"]
    A2 --> A2b["annonces/"]
    A2 --> A2c["forms/"]
    A2 --> A2d["agence/"]
    A2 --> A2e["ui/"]
    A2 --> A2f["providers/"]
    
    A2a --> A2a1["MapView.tsx"]
    A2a --> A2a2["MapPin.tsx"]
    A2a --> A2a3["ClusterPin.tsx"]
    
    A2b --> A2b1["AnnonceCard.tsx"]
    A2b --> A2b2["PhotoGallery.tsx"]
    A2b --> A2b3["ContactForm.tsx"]
    
    A2c --> A2c1["ListingForm.tsx<br/>(create + edit)"]
    
    A3 --> A3a["db.ts<br/>(Prisma)"]
    A3 --> A3b["auth.ts<br/>(NextAuth)"]
    A3 --> A3c["redis.ts"]
    A3 --> A3d["cloudinary.ts"]
    A3 --> A3e["resend.ts"]
    A3 --> A3f["config.ts"]
    A3 --> A3g["validations/"]
    
    style A fill:#f5f5f5
    style A1 fill:#e1f5ff
    style A2 fill:#fff3e0
    style A3 fill:#f3e5f5
    style A4 fill:#e8f5e9
```

---

## 7️⃣ Breakdown Coûts (Par service)

```mermaid
pie title "Estimation coûts production (scénario 100K-1M visites/mois)"
    "Mapbox Maps" : 150
    "Vercel Hosting" : 20
    "Railway PostgreSQL" : 15
    "Cloudinary Photos" : 40
    "Resend Email" : 5
    "Upstash Redis" : 7
    "Other/Buffer" : 13
```

### Détail Mapbox (PRINCIPAL DRIVER)

```mermaid
graph TB
    A["Mapbox Coûts"] --> B["Raster Tiles<br/>$1 per 1M requests<br/>60-80% du trafic"]
    A --> C["API Calls<br/>Geocoding: $0.50/1K<br/>Directions: $0.50/1K"]
    A --> D["Base Plan<br/>$5/month<br/>fixed"]
    A --> E["Vector Tiles<br/>$2 per 1M<br/>(alt à Raster)"]
    
    B --> B1["100M req/mois<br/>= $100"]
    C --> C1["~50K req/mois<br/>= $25"]
    D --> D1["$5 fixed"]
    E --> E1["Si scale-up:<br/>$200-300/mois"]
    
    style A fill:#ffebee
    style B fill:#ffcdd2
    style B1 fill:#ef5350
    style E1 fill:#ef5350
```

---

## 8️⃣ Rate Limiting & Cache Strategy

```mermaid
graph LR
    A["POST /api/contact"] -->|Rate limit<br/>3/hour/IP| B["Redis<br/>key:ip"]
    B -->|BLOCKED| C["429 Too Many<br/>Requests"]
    B -->|ALLOWED| D["Email sent<br/>+ DB log"]
    
    E["GET /api/map/pins"] -->|Check cache<br/>key:hash| F["Redis"]
    F -->|HIT<br/>TTL < 60s| G["Return cached<br/>GeoJSON"]
    F -->|MISS| H["Query PostGIS"]
    H -->|Result| I["Store in Redis<br/>TTL 60s"]
    I -->|Return| G

    J["POST /api/upload/signature"] -->|Rate limit<br/>by userId| B
    
    style C fill:#ffcdd2
    style D fill:#c8e6c9
    style G fill:#c8e6c9
    style F fill:#fff9c4
```

---

## 9️⃣ Rôles & Permissions

```mermaid
graph TD
    A["Rôles"] --> B["👤 USER<br/>- Max 3 listings<br/>- Max 10 photos<br/>- Contact listings"]
    A --> C["🏢 AGENCY_EMPLOYEE<br/>- Listings illimitées<br/>- Max 50 photos<br/>- No agency mgmt"]
    A --> D["🏢 AGENCY_DIRECTOR<br/>- Listings illimitées<br/>- Max 50 photos<br/>- Gérer agence<br/>- Ajouter/remove membres"]
    A --> E["👨‍💼 ADMIN<br/>- Tous les accès<br/>- Modérer annonces<br/>- Gérer utilisateurs"]
    
    style B fill:#e3f2fd
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#ffebee
```

---

## 🔟 Checklist Features (Phase 1 vs 2 vs 3)

```mermaid
graph LR
    subgraph Phase1["✅ PHASE 1 (Complétée)"]
        P1A["Landing page"]
        P1B["37 listings + map"]
        P1C["Register/Login"]
        P1D["Créer annonce"]
        P1E["Upload photos"]
        P1F["Contact form"]
        P1G["Dashboard basic"]
    end
    
    subgraph Phase2["🔄 PHASE 2 (En cours)"]
        P2A["Gestion agences"]
        P2B["Champs commerciaux"]
        P2C["Géocodage auto"]
        P2D["Back-office admin"]
        P2E["Recherche avancée"]
        P2F["Messages/Inbox"]
    end
    
    subgraph Phase3["📋 PHASE 3 (TODO)"]
        P3A["Mobile app"]
        P3B["Favoris/Wishlist"]
        P3C["Notifications RT"]
        P3D["Avis agences"]
        P3E["Visite virtuelle"]
        P3F["Paiement premium"]
    end
    
    Phase1 -.->|Sprint +2| Phase2
    Phase2 -.->|Sprint +4| Phase3
    
    style Phase1 fill:#c8e6c9
    style Phase2 fill:#fff9c4
    style Phase3 fill:#ffe0b2
```

---

## 📌 Note technique

Tous ces diagrammes peuvent être :
- ✅ Visualisés ici en Markdown (avec ext. VS Code)
- ✅ Exportés en PNG/SVG via https://mermaid.live
- ✅ Intégrés dans la documentation (GitHub wiki, Notion, etc.)

**Pour modifier** : change le code Mermaid + refresh.

---

*Généré par Claude Code — 2026-04-02*
