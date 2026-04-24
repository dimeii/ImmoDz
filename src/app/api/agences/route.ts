import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wilayaParam = searchParams.get("wilaya");
    const search = searchParams.get("q")?.trim();

    const where: Prisma.AgencyWhereInput = {};

    if (wilayaParam) {
      const code = parseInt(wilayaParam, 10);
      if (!Number.isNaN(code)) {
        where.wilayaCode = code;
      }
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const agencies = await db.agency.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        wilaya: true,
        _count: {
          select: {
            members: true,
            listings: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    const result = agencies.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description,
      logo: a.logo,
      phone: a.phone,
      email: a.email,
      address: a.address,
      wilaya: a.wilaya
        ? { code: a.wilaya.code, name: a.wilaya.name, nameAr: a.wilaya.nameAr }
        : null,
      memberCount: a._count.members,
      activeListings: a._count.listings,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
