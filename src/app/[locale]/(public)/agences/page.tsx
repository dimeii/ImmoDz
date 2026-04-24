import { Suspense } from "react";
import AgencesContent from "./AgencesContent";

export default function AgencesPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-80px)] items-center justify-center">Chargement...</div>}>
      <AgencesContent />
    </Suspense>
  );
}
