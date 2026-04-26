/**
 * Mini-renderer markdown → HTML pour les pages légales.
 * Couvre intentionnellement un sous-ensemble : headings (## / ###), listes,
 * gras / italique, liens, paragraphes. Pas de tables, pas de code blocks.
 * Le contenu est échappé HTML d'abord, puis reformaté.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(s: string): string {
  let out = s;
  // Liens [texte](url) — accepte http(s) et mailto
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    '<a href="$2" class="text-primary-950 hover:underline" target="_blank" rel="noopener">$1</a>'
  );
  // Gras
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italique (évite les ** déjà traités)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return out;
}

export function renderLegalMarkdown(src: string): string {
  const escaped = escapeHtml(src);
  const lines = escaped.split(/\r?\n/);
  const blocks: string[] = [];
  let buffer: string[] = [];
  let listBuffer: string[] = [];

  function flushParagraph() {
    if (buffer.length === 0) return;
    blocks.push(`<p class="mb-3 text-gray-700 leading-relaxed">${renderInline(buffer.join(" "))}</p>`);
    buffer = [];
  }
  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(
      `<ul class="list-disc pl-6 mb-3 space-y-1 text-gray-700">${listBuffer
        .map((item) => `<li>${renderInline(item)}</li>`)
        .join("")}</ul>`
    );
    listBuffer = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h1 = line.match(/^#\s+(.+)$/);
    const li = line.match(/^[-*]\s+(.+)$/);

    if (h1 || h2 || h3) {
      flushParagraph();
      flushList();
      if (h1)
        blocks.push(
          `<h1 class="text-3xl font-black text-gray-900 mt-8 mb-4">${renderInline(h1[1])}</h1>`
        );
      else if (h2)
        blocks.push(
          `<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">${renderInline(h2[1])}</h2>`
        );
      else if (h3)
        blocks.push(
          `<h3 class="text-base font-semibold text-gray-900 mt-4 mb-2">${renderInline(h3[1])}</h3>`
        );
      continue;
    }
    if (li) {
      flushParagraph();
      listBuffer.push(li[1]);
      continue;
    }
    flushList();
    buffer.push(line);
  }
  flushParagraph();
  flushList();

  return blocks.join("\n");
}
