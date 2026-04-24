import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ModerationQueue from "@/components/admin/ModerationQueue";

export default async function AdminModerationPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id) redirect("/login");
  if (role !== "ADMIN") redirect("/");

  const pending = await db.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      wilaya: { select: { name: true } },
      photos: { take: 1, orderBy: { order: "asc" } },
      user: { select: { id: true, name: true, email: true } },
      agency: { select: { id: true, slug: true, name: true } },
    },
    take: 100,
  });

  const serialized = JSON.parse(JSON.stringify(pending)) as Parameters<
    typeof ModerationQueue
  >[0]["initial"];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-primary-950 hover:underline">
            ← Retour
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-3">
            Modération — {pending.length} annonce{pending.length !== 1 ? "s" : ""} en attente
          </h1>
          <p className="text-gray-500 mt-1">
            Les annonces approuvées passent en ACTIVE. Les rejets sont visibles
            par l'agent dans son dashboard avec le motif renseigné.
          </p>
        </div>

        <ModerationQueue initial={serialized} />
      </div>
    </main>
  );
}
