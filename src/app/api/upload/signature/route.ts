import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSignature } from "@/lib/cloudinary";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const folder = `immodz/${session.user.id}`;

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = generateSignature(paramsToSign);

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
