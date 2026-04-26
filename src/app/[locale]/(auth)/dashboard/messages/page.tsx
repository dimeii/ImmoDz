import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import MessagesView from "@/components/messages/MessagesView";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Messages</h1>
            <p className="text-gray-500 mt-2">
              Vos conversations avec les annonceurs
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary-950 hover:underline"
          >
            ← Retour au dashboard
          </Link>
        </div>

        <MessagesView userId={session.user.id} />
      </div>
    </main>
  );
}
