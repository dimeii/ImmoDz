"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b-4 border-primary-950 bg-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-3xl font-black text-primary-950 hover:text-primary-900 transition-all">
          🏠 ImmoDz
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/annonces/nouvelle"
                className="rounded-md bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 shadow-md transition-all hover:shadow-lg"
              >
                ➕ Déposer une annonce
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-primary-950 hover:text-primary-900 transition-colors"
              >
                👤 Mon compte
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-primary-950 hover:text-primary-900 transition-colors"
              >
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-primary-950 hover:text-primary-900 transition-colors"
              >
                🔐 Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 shadow-md transition-all hover:shadow-lg"
              >
                ✍️ Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
