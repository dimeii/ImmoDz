import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    if (transactionType) where.transactionType = transactionType;
    if (propertyType) where.propertyType = propertyType;
    if (wilayaCode) where.wilayaCode = Number(wilayaCode);
    if (rooms) where.rooms = { gte: Number(rooms) };

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
