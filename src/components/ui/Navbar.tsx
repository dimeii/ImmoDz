"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          ImmoDz
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/annonces/nouvelle"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
              >
                Déposer une annonce
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Mon compte
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
