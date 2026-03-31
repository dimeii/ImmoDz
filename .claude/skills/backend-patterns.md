# Backend Development Patterns

Patterns réutilisables et best practices pour le backend ImmoDz.

---

## 📡 API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { mySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication (if needed)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validation
    const { searchParams } = request.nextUrl;
    const params = mySchema.parse(Object.fromEntries(searchParams));

    // 3. Authorization (if needed)
    const role = session.user.role;
    if (!["ADMIN", "DIRECTOR"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Business logic
    const data = await db.myTable.findMany({ where: {...} });

    // 5. Success response
    return NextResponse.json({ data });
  } catch (error) {
    // 6. Error handling
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const body = await request.json();
    const data = mySchema.parse(body);

    const result = await db.myTable.create({ data: {...data, userId: session.user.id} });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // ...
  }
}
```

---

## 🔐 Authorization Patterns

### Check Auth + Role
```typescript
const session = await auth();
if (!session?.user?.id) return 401;

const role = session.user.role;
if (!["ADMIN"].includes(role)) return 403;
```

### Check Ownership
```typescript
const item = await db.item.findUnique({ where: { id } });
if (!item || (item.userId !== session.user.id && role !== "ADMIN")) {
  return 403; // Or 404 to not reveal existence
}
```

### Agency Check
```typescript
const member = await db.agencyMember.findUnique({
  where: { userId_agencyId: { userId: session.user.id, agencyId } }
});
if (!member && role !== "ADMIN") return 403;
```

---

## 💾 Database Patterns

### Pagination
```typescript
const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

const [items, total] = await Promise.all([
  db.item.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  }),
  db.item.count(),
]);

return NextResponse.json({
  items,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
```

### Include Relations
```typescript
// ✅ Good: only fetch needed columns
const listings = await db.listing.findMany({
  select: {
    id: true,
    title: true,
    price: true,
    wilaya: { select: { name: true } },
    photos: { take: 1, orderBy: { order: "asc" } },
  },
});

// ❌ Bad: SELECT * (inefficient)
const listings = await db.listing.findMany({
  include: { wilaya: true, photos: true, user: true }, // Too much data
});
```

### Filter Building
```typescript
const where: Record<string, unknown> = { status: "ACTIVE" };

if (filters.transactionType) where.transactionType = filters.transactionType;
if (filters.priceMin || filters.priceMax) {
  where.price = {
    ...(filters.priceMin ? { gte: filters.priceMin } : {}),
    ...(filters.priceMax ? { lte: filters.priceMax } : {}),
  };
}

const listings = await db.listing.findMany({ where });
```

### PostGIS Queries
```typescript
// Spatial query (with typing)
const listings = await db.$queryRaw`
  SELECT l.id, l.title, l.price,
         ST_X(l.location::geometry) as lng,
         ST_Y(l.location::geometry) as lat
  FROM listings l
  WHERE status = 'ACTIVE'
    AND ST_Within(l.location::geometry, ST_MakeEnvelope($1, $2, $3, $4, 4326))
  LIMIT ${limit}
` as Array<{id: string; title: string; price: number; lng: number; lat: number}>;
```

---

## 🔄 Service Layer Pattern

```typescript
// lib/services/listing.service.ts
export const listingService = {
  async create(data: CreateListingInput, userId: string) {
    const listing = await db.listing.create({
      data: { ...data, userId, status: "PENDING" },
    });
    // Set PostGIS location if coords provided
    if (data.lat && data.lng) {
      await db.$executeRaw`
        UPDATE listings SET location = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography
        WHERE id = ${listing.id}
      `;
    }
    return listing;
  },

  async findById(id: string) {
    return await db.listing.findUnique({
      where: { id },
      include: { wilaya: true, photos: true, user: { select: { name: true } } },
    });
  },

  async findMany(filters: SearchFiltersInput, page = 1, limit = 20) {
    const where: Record<string, unknown> = { status: "ACTIVE" };
    // Build where clause from filters...
    return await db.listing.findMany({ where, skip: (page - 1) * limit, take: limit });
  },
};

// Usage in route
const listing = await listingService.findById(id);
```

---

## 🧪 Testing Database

### Setup Test Database
```bash
# .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/immodz_test"

# package.json
"test": "NODE_ENV=test jest --setupFilesAfterEnv ./jest.setup.ts"
```

### Test with Fixtures
```typescript
describe('Listing API', () => {
  let testListing: any;

  beforeAll(async () => {
    testListing = await db.listing.create({
      data: {
        title: 'Test Listing',
        price: 100000,
        transactionType: 'RENT',
        propertyType: 'APARTMENT',
        wilayaCode: 16,
        userId: 'test-user-id',
      },
    });
  });

  afterAll(async () => {
    await db.listing.delete({ where: { id: testListing.id } });
  });

  it('returns listing details', async () => {
    const res = await GET(`/api/listings/${testListing.id}`);
    expect(res.status).toBe(200);
    expect(res.data.title).toBe('Test Listing');
  });
});
```

---

## 📧 Email Service Pattern

```typescript
// lib/email.service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendListingNotification(userEmail: string, listing: Listing) {
    return await resend.emails.send({
      from: 'noreply@immodz.com',
      to: userEmail,
      subject: `Your listing "${listing.title}" was approved`,
      html: `<h1>${listing.title}</h1><p>Your listing is now live!</p>`,
    });
  },

  async sendContactNotification(toEmail: string, fromName: string, message: string) {
    return await resend.emails.send({
      from: 'noreply@immodz.com',
      to: toEmail,
      subject: `New message from ${fromName}`,
      html: `<p>${message}</p>`,
    });
  },
};

// Usage in API route
await emailService.sendListingNotification(user.email, listing);
```

---

## 🚨 Error Handling

### Custom Error Class
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Usage
if (!user) throw new AppError(404, 'User not found');
if (!isOwner) throw new AppError(403, 'Not authorized to edit');

// In route
try {
  // ...
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

## 🔒 Security Validation

### Zod Schema
```typescript
import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  price: z.number().positive(),
  transactionType: z.enum(['RENT', 'SALE']),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO']),
  wilayaCode: z.number().int().min(1).max(58),
  surface: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// Validate in route
const data = createListingSchema.parse(body);
```

---

## ♻️ Rate Limiting

### Redis Pattern
```typescript
import { redis } from '@/lib/redis';

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= limit;
}

// Usage in route
const allowed = await rateLimit(`contact:${ip}`, 3, 3600); // 3 per hour
if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

---

## 🔗 Useful Commands

```bash
# Database
npx prisma migrate dev --name <desc>   # Create migration
npx prisma studio                      # GUI browser
npx prisma generate                    # Regenerate client

# Testing
npm run test -- api/listings.test.ts   # Run specific test
npm run test:watch                     # Watch mode
npm run test:coverage                  # Coverage

# Linting
npm run lint                           # Check code
npx tsc --noEmit                       # Type check
```

---

**Last Updated** : 31 mars 2026
