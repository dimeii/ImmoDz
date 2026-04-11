import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const bounds = searchParams.get("bounds");
    const transactionType = searchParams.get("transactionType");
    const propertyType = searchParams.get("propertyType");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const wilayaCode = searchParams.get("wilayaCode");
    const surfaceMin = searchParams.get("surfaceMin");
    const surfaceMax = searchParams.get("surfaceMax");
    const rooms = searchParams.get("rooms");

    if (!bounds) {
      return NextResponse.json(
        { error: "Le paramètre bounds est requis" },
        { status: 400 }
      );
    }

    const [west, south, east, north] = bounds.split(",").map(Number);
    if ([west, south, east, north].some(isNaN)) {
      return NextResponse.json(
        { error: "Format bounds invalide (west,south,east,north)" },
        { status: 400 }
      );
    }

    // Construire les filtres Prisma
    const where: Record<string, unknown> = {
      status: "ACTIVE",
      latitude: { not: null, gte: south, lte: north },
      longitude: { not: null, gte: west, lte: east },
    };

    const userId = searchParams.get("userId");
    if (userId) where.userId = userId;

    if (transactionType) where.transactionType = transactionType;
    if (propertyType) where.propertyType = propertyType;
    if (wilayaCode) where.wilayaCode = Number(wilayaCode);
    const quartier = searchParams.get("quartier");
    if (quartier) where.quartierId = quartier;
    if (rooms) where.rooms = { gte: Number(rooms) };

    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const floor = searchParams.get("floor");
    const yearBuilt = searchParams.get("yearBuilt");
    if (bedrooms) where.bedrooms = { gte: Number(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: Number(bathrooms) };
    if (floor) where.floor = { gte: Number(floor) };
    if (yearBuilt) where.yearBuilt = { gte: Number(yearBuilt) };

    if (priceMin || priceMax) {
      const priceFilter: Record<string, number> = {};
      if (priceMin) priceFilter.gte = Number(priceMin);
      if (priceMax) priceFilter.lte = Number(priceMax);
      where.price = priceFilter;
    }

    if (surfaceMin || surfaceMax) {
      const surfaceFilter: Record<string, number> = {};
      if (surfaceMin) surfaceFilter.gte = Number(surfaceMin);
      if (surfaceMax) surfaceFilter.lte = Number(surfaceMax);
      where.surface = surfaceFilter;
    }

    // Boolean amenities
    const booleanKeys = [
      "hasElevator", "hasParking", "hasGarden", "hasPool", "isFurnished",
      "hasStorefront", "hasWater", "hasElectricity", "hasGas", "hasFiber",
    ];
    for (const key of booleanKeys) {
      if (searchParams.get(key) === "true") where[key] = true;
    }

    const listings = await db.listing.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        transactionType: true,
        propertyType: true,
        latitude: true,
        longitude: true,
        photos: {
          select: { url: true },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    });

    const geojson = {
      type: "FeatureCollection",
      features: listings.map((l) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [l.longitude, l.latitude],
        },
        properties: {
          id: l.id,
          title: l.title,
          price: l.price,
          transactionType: l.transactionType,
          propertyType: l.propertyType,
          thumbnail: l.photos[0]?.url ?? null,
        },
      })),
    };

    return NextResponse.json(geojson);
  } catch (error) {
    console.error("Map pins error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
