import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { renderLegalMarkdown } from "@/lib/simple-markdown";

export default async function LegalPageView({ slug }: { slug: string }) {
  const page = await db.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  const html = renderLegalMarkdown(page.content);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-black text-gray-900">{page.title}</h1>
          <p className="text-xs text-gray-500 mt-2">
            Dernière mise à jour :{" "}
            {page.updatedAt.toLocaleDateString("fr-DZ", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            · Version {page.version}
          </p>
        </header>
        <article
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
