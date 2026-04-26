import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-emerald-900 w-full relative bottom-0">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-lg font-bold text-emerald-50 mb-2 font-headline">
            ImmoDz
          </div>
          <p className="text-emerald-200/50 text-[10px] uppercase tracking-widest max-w-[200px]">
            L&apos;excellence immobiliere au coeur de l&apos;Algerie.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-body text-xs uppercase tracking-widest mb-8 md:mb-0">
          <Link
            href="/confidentialite"
            className="text-emerald-200/70 hover:text-emerald-50 transition-all underline-offset-4 hover:underline"
          >
            Politique de confidentialite
          </Link>
          <Link
            href="/cgu"
            className="text-emerald-200/70 hover:text-emerald-50 transition-all underline-offset-4 hover:underline"
          >
            Conditions d&apos;utilisation
          </Link>
          <Link
            href="/mentions-legales"
            className="text-emerald-200/70 hover:text-emerald-50 transition-all underline-offset-4 hover:underline"
          >
            Mentions legales
          </Link>
        </div>
        <div className="text-emerald-200/70 font-body text-xs uppercase tracking-widest">
          &copy; {new Date().getFullYear()} ImmoDz. Tous droits reserves.
        </div>
      </div>
    </footer>
  );
}
