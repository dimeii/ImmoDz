import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import crypto from "crypto";

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

    // Cache Redis
    const cacheKey = `pins:${crypto
      .createHash("md5")
      .update(JSON.stringify({ bounds, transactionType, propertyType, priceMin, priceMax, wilayaCode, surfaceMin, surfaceMax, rooms }))
      .digest("hex")}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Requête PostGIS
    const conditions: string[] = [
      `status = 'ACTIVE'`,
      `ST_Within(location::geometry, ST_MakeEnvelope($1, $2, $3, $4, 4326))`,
    ];
    const params: (string | number)[] = [west, south, east, north];
    let paramIndex = 5;

    if (transactionType) {
      conditions.push(`transaction_type = $${paramIndex++}`);
      params.push(transactionType);
    }
    if (propertyType) {
      conditions.push(`property_type = $${paramIndex++}`);
      params.push(propertyType);
    }
    if (priceMin) {
      conditions.push(`price >= $${paramIndex++}`);
      params.push(Number(priceMin));
    }
    if (priceMax) {
      conditions.push(`price <= $${paramIndex++}`);
      params.push(Number(priceMax));
    }
    if (wilayaCode) {
      conditions.push(`wilaya_code = $${paramIndex++}`);
      params.push(Number(wilayaCode));
    }
    if (surfaceMin) {
      conditions.push(`surface >= $${paramIndex++}`);
      params.push(Number(surfaceMin));
    }
    if (surfaceMax) {
      conditions.push(`surface <= $${paramIndex++}`);
      params.push(Number(surfaceMax));
    }
    if (rooms) {
      conditions.push(`rooms >= $${paramIndex++}`);
      params.push(Number(rooms));
    }

    const pins: {
      id: string;
      title: string;
      price: number;
      transaction_type: string;
      property_type: string;
      lng: number;
      lat: number;
      thumbnail: string | null;
    }[] = await db.$queryRawUnsafe(
      `SELECT l.id, l.title, l.price, l.transaction_type, l.property_type,
              ST_X(l.location::geometry) as lng,
              ST_Y(l.location::geometry) as lat,
              (SELECT url FROM listing_photos
               WHERE listing_id = l.id ORDER BY "order" LIMIT 1) as thumbnail
       FROM listings l
       WHERE ${conditions.join(" AND ")}`,
      ...params
    );

    const geojson = {
      type: "FeatureCollection",
      features: pins.map((pin) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [pin.lng, pin.lat],
        },
        properties: {
          id: pin.id,
          title: pin.title,
          price: pin.price,
          transactionType: pin.transaction_type,
          propertyType: pin.property_type,
          thumbnail: pin.thumbnail,
        },
      })),
    };

    // Cache 60s
    await redis.set(cacheKey, JSON.stringify(geojson), { ex: 60 });

    return NextResponse.json(geojson);
  } catch (error) {
    console.error("Map pins error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
