import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createListingSchema, searchFiltersSchema } from "@/lib/validations/listing";
import { LIMITS } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filters = searchFiltersSchema.parse(Object.fromEntries(searchParams));
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (filters.transactionType) where.transactionType = filters.transactionType;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.wilayaCode) where.wilayaCode = filters.wilayaCode;
    if (filters.quartier) where.quartierId = filters.quartier;
    if (filters.rooms) where.rooms = { gte: filters.rooms };
    if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };
    if (filters.bathrooms) where.bathrooms = { gte: filters.bathrooms };
    if (filters.floor != null) where.floor = { gte: filters.floor };
    if (filters.yearBuilt) where.yearBuilt = { gte: filters.yearBuilt };
    if (filters.priceMin || filters.priceMax) {
      where.price = {
        ...(filters.priceMin ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax ? { lte: filters.priceMax } : {}),
      };
    }
    if (filters.surfaceMin || filters.surfaceMax) {
      where.surface = {
        ...(filters.surfaceMin ? { gte: filters.surfaceMin } : {}),
        ...(filters.surfaceMax ? { lte: filters.surfaceMax } : {}),
      };
    }
    // Boolean amenities
    const booleanKeys = [
      "hasElevator", "hasParking", "hasGarden", "hasPool", "isFurnished",
      "hasStorefront", "hasWater", "hasElectricity", "hasGas", "hasFiber",
    ] as const;
    for (const key of booleanKeys) {
      if (filters[key] === true) where[key] = true;
    }

    const [annonces, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          wilaya: true,
        quartier: true,
          photos: { take: 1, orderBy: { order: "asc" } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.listing.count({ where }),
    ]);

    return NextResponse.json({
      annonces,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/annonces error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Filtres invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createListingSchema.parse(body);

    const role = (session.user as { role?: string }).role ?? "USER";

    if (role === "USER") {
      const count = await db.listing.count({
        where: { userId: session.user.id },
      });
      if (count >= LIMITS.USER_MAX_LISTINGS) {
        return NextResponse.json(
          { error: `Limite de ${LIMITS.USER_MAX_LISTINGS} annonces atteinte` },
          { status: 403 }
        );
      }
    }

    const { lat, lng, ...listingData } = validated;

    // Auto-lier l'annonce à l'agence du user si AGENCY_DIRECTOR/EMPLOYEE
    let agencyId: string | undefined;
    if (role === "AGENCY_DIRECTOR" || role === "AGENCY_EMPLOYEE") {
      const membership = await db.agencyMember.findFirst({
        where: { userId: session.user.id },
        select: { agencyId: true },
      });
      agencyId = membership?.agencyId;
    }

    // Modération : ADMIN publie direct, les autres passent en PENDING
    const status = role === "ADMIN" ? "ACTIVE" : "PENDING";

    const annonce = await db.listing.create({
      data: {
        ...listingData,
        latitude: lat,
        longitude: lng,
        userId: session.user.id,
        agencyId,
        status,
      },
    });

    return NextResponse.json(annonce, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
