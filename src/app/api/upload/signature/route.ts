import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSignature } from "@/lib/cloudinary";
import { getRedis } from "@/lib/redis";
import { RATE_LIMITS } from "@/lib/config";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const rateLimitKey = `upload:rate:${userId}`;
    const redis = getRedis();
    const currentCount = (await redis.get<number>(rateLimitKey)) ?? 0;

    if (currentCount >= RATE_LIMITS.UPLOAD_PER_HOUR) {
      return NextResponse.json(
        { error: "Trop d'uploads. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const folder = `immodz/${userId}`;

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = generateSignature(paramsToSign);

    await redis.incr(rateLimitKey);
    if (currentCount === 0) {
      await redis.expire(rateLimitKey, 3600);
    }

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Upload signature error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
