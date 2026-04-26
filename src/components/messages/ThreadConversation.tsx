"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type ThreadDetail = {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    transactionType: "RENT" | "SALE";
    photos: { url: string }[];
  } | null;
  otherUser: { id: string; name: string | null; image: string | null; phone: string | null };
  messages: Message[];
  unread: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("fr-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWhatsAppLink(phone: string, listingTitle: string | null) {
  const normalized = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const text = listingTitle
    ? `Bonjour, je vous contacte au sujet de l'annonce "${listingTitle}" sur ImmoDz.`
    : "Bonjour, je vous contacte depuis ImmoDz.";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

interface Props {
  threadId: string;
  currentUserId: string;
  onMessageSent: () => void;
  onRead: () => void;
}

export default function ThreadConversation({
  threadId,
  currentUserId,
  onMessageSent,
  onRead,
}: Props) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR<{ thread: ThreadDetail }>(
    `/api/threads/${threadId}`,
    fetcher,
    { refreshInterval: 10000, refreshWhenHidden: false }
  );

  const thread = data?.thread;

  useEffect(() => {
    if (!threadId) return;
    fetch(`/api/threads/${threadId}/read`, { method: "POST" })
      .then(() => onRead())
      .catch(() => {});
  }, [threadId, onRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur d'envoi");
      }
      setDraft("");
      await mutate();
      onMessageSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  }

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-gray-100 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {thread.listing?.photos[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thread.listing.photos[0].url}
              alt=""
              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-200 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">
              {thread.otherUser.name ?? "Utilisateur"}
            </div>
            {thread.listing ? (
              <Link
                href={`/annonces/${thread.listing.id}`}
                className="text-xs text-primary-950 hover:underline truncate block"
              >
                {thread.listing.title}
              </Link>
            ) : (
              <div className="text-xs text-gray-400">Annonce supprimée</div>
            )}
          </div>
        </div>
        {thread.otherUser.phone && (
          <a
            href={buildWhatsAppLink(thread.otherUser.phone, thread.listing?.title ?? null)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            WhatsApp
          </a>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {thread.messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  mine
                    ? "bg-primary-950 text-white rounded-br-sm"
                    : "bg-white text-gray-900 rounded-bl-sm border border-gray-100"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {m.body}
                </div>
                <div
                  className={`text-[10px] mt-1 ${
                    mine ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {formatTime(m.createdAt)}
                  {mine && m.readAt && " ✓✓"}
                  {mine && !m.readAt && " ✓"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-100 p-3 flex gap-2 items-end"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as React.FormEvent);
            }
          }}
          rows={1}
          maxLength={5000}
          placeholder="Écrivez un message…"
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-950/20"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="bg-primary-950 text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {sending ? "…" : "Envoyer"}
        </button>
      </form>
      {error && (
        <div className="px-4 pb-2 text-xs text-red-600">{error}</div>
      )}
    </>
  );
}
