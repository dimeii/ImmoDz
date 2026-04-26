"use client";

import { useState } from "react";
import { renderLegalMarkdown } from "@/lib/simple-markdown";

interface Props {
  slug: string;
  initialTitle: string;
  initialContent: string;
}

export default function LegalEditor({ slug, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title: title.trim(), content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          Page publiée. La nouvelle version est désormais visible publiquement.
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 ${
              tab === "edit"
                ? "border-primary-950 text-primary-950"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Éditer (markdown)
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 ${
              tab === "preview"
                ? "border-primary-950 text-primary-950"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Aperçu
          </button>
        </div>

        {tab === "edit" ? (
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={50000}
              rows={28}
              className="w-full font-mono text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="## Section&#10;Texte du paragraphe…&#10;&#10;- Item liste&#10;- Item liste&#10;&#10;**gras** *italique* [lien](https://...)"
            />
            <p className="text-xs text-gray-500 mt-2">
              Markdown supporté : <code>## titre</code>, <code>### sous-titre</code>,{" "}
              <code>- item</code>, <code>**gras**</code>, <code>*italique*</code>,{" "}
              <code>[lien](url)</code>. {content.length} / 50 000 caractères.
            </p>
          </div>
        ) : (
          <div
            className="p-6 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderLegalMarkdown(content) }}
          />
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || title.trim().length < 3 || content.trim().length < 10}
          className="px-5 py-2.5 rounded-lg bg-primary-950 text-white font-semibold hover:bg-primary-900 disabled:opacity-50 transition-colors"
        >
          {saving ? "Publication…" : "Publier la nouvelle version"}
        </button>
      </div>
    </div>
  );
}
