"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm">
      <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-emerald-900 tracking-tighter font-headline"
        >
          ImmoDz
        </Link>

        <div className="hidden md:flex items-center space-x-8 font-headline font-semibold text-sm tracking-tight">
          <Link
            href="/recherche"
            className="text-emerald-900 border-b-2 border-emerald-900 pb-1"
          >
            Annonces
          </Link>
          <Link
            href="/recherche?transactionType=RENT"
            className="text-emerald-800/60 hover:text-emerald-900 transition-colors duration-300"
          >
            Location
          </Link>
          <Link
            href="/recherche?transactionType=SALE"
            className="text-emerald-800/60 hover:text-emerald-900 transition-colors duration-300"
          >
            Achat
          </Link>
          <Link
            href="#"
            className="text-emerald-800/60 hover:text-emerald-900 transition-colors duration-300"
          >
            Services
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-emerald-800/60 hover:text-emerald-900 transition-colors"
              >
                Mon compte
              </Link>
              <Link
                href="/annonces/nouvelle"
                className="bg-primary text-on-primary px-6 py-2 rounded-md font-headline text-sm font-semibold hover:opacity-90 transition-all"
              >
                Deposer une annonce
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-emerald-800/60 hover:text-emerald-900 transition-colors"
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-emerald-800/60 hover:text-emerald-900 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-primary text-on-primary px-6 py-2 rounded-md font-headline text-sm font-semibold hover:opacity-90 transition-all"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
