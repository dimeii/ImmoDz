"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 50 || y < lastScrollY.current) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-emerald-900 tracking-tighter font-headline"
        >
          ImmoDz
        </Link>

        <div className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm tracking-tight">
          <Link
            href="/recherche"
            className="text-emerald-900 border-b-2 border-emerald-900 pb-1"
          >
            {t("listings")}
          </Link>
          <Link
            href="/recherche?transactionType=RENT"
            className="text-emerald-800/60 hover:text-emerald-900 transition-colors duration-300"
          >
            {t("rent")}
          </Link>
          <Link
            href="/recherche?transactionType=SALE"
            className="text-emerald-800/60 hover:text-emerald-900 transition-colors duration-300"
          >
            {t("buy")}
          </Link>
          <Link
            href="#"
            className="text-emerald-800/60 hover:text-emerald-900 transition-colors duration-300"
          >
            {t("services")}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:inline text-sm font-medium text-emerald-800/60 hover:text-emerald-900 transition-colors"
              >
                {t("account")}
              </Link>
              <Link
                href="/annonces/nouvelle"
                className="bg-primary text-on-primary px-6 py-2 rounded-md font-headline text-sm font-semibold hover:opacity-90 transition-all"
              >
                {t("postListing")}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden md:inline text-sm font-medium text-emerald-800/60 hover:text-emerald-900 transition-colors"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline text-sm font-medium text-emerald-800/60 hover:text-emerald-900 transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="bg-primary text-on-primary px-6 py-2 rounded-md font-headline text-sm font-semibold hover:opacity-90 transition-all"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
