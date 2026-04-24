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
          },
        },
      },
    });

    const agencyIds = agencies.map((a) => a.id);
    const memberUserIds = agencyIds.length
      ? await db.agencyMember.findMany({
          where: { agencyId: { in: agencyIds } },
          select: { agencyId: true, userId: true },
        })
      : [];

    const userIdsByAgency = new Map<string, string[]>();
    for (const m of memberUserIds) {
      const list = userIdsByAgency.get(m.agencyId) ?? [];
      list.push(m.userId);
      userIdsByAgency.set(m.agencyId, list);
    }

    const allUserIds = memberUserIds.map((m) => m.userId);
    const listingCounts = allUserIds.length
      ? await db.listing.groupBy({
          by: ["userId"],
          where: { userId: { in: allUserIds }, status: "ACTIVE" },
          _count: { _all: true },
        })
      : [];

    const countByUser = new Map(
      listingCounts.map((c) => [c.userId, c._count._all])
    );

    const result = agencies.map((a) => {
      const userIds = userIdsByAgency.get(a.id) ?? [];
      const activeListings = userIds.reduce(
        (sum, uid) => sum + (countByUser.get(uid) ?? 0),
        0
      );
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        logo: a.logo,
        phone: a.phone,
        email: a.email,
        address: a.address,
        wilaya: a.wilaya ? { code: a.wilaya.code, name: a.wilaya.name, nameAr: a.wilaya.nameAr } : null,
        memberCount: a._count.members,
        activeListings,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
