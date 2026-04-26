"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "immodz-cookies-ack";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl border border-gray-200 p-5 pointer-events-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">Cookies & vie privée</p>
            <p>
              ImmoDz utilise des cookies strictement nécessaires (session d&apos;authentification).
              Aucun cookie publicitaire, aucun tracker tiers. En savoir plus dans notre{" "}
              <Link
                href="/confidentialite"
                className="text-primary-950 underline hover:no-underline"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
          <button
            onClick={accept}
            className="flex-shrink-0 bg-primary-950 text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-900 transition-colors"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
