export default function EditAnnoncePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Modifier l&apos;annonce {params.id}</h1>
    </main>
  );
}
