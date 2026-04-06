import { Suspense } from "react";
import RechercheContent from "./RechercheContent";

export default function RecherchePage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-80px)] items-center justify-center">Chargement...</div>}>
      <RechercheContent />
    </Suspense>
  );
}
