"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import ThreadConversation from "./ThreadConversation";

type ThreadListItem = {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  listingThumb: string | null;
  otherUser: { id: string; name: string | null; image: string | null; phone?: string | null };
  unread: boolean;
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  lastMessageAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatRelative(date: string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" });
}

export default function MessagesView({ userId }: { userId: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, mutate, isLoading } = useSWR<{ threads: ThreadListItem[] }>(
    "/api/threads",
    fetcher,
    { refreshInterval: 15000, refreshWhenHidden: false, revalidateOnFocus: true }
  );

  const threads = data?.threads ?? [];

  if (isLoading && threads.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
        <p className="text-gray-500">Chargement…</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300">forum</span>
        <p className="text-gray-500 mt-4 mb-6">Aucune conversation pour l'instant</p>
        <Link
          href="/recherche"
          className="inline-flex items-center gap-2 bg-primary-950 text-white font-bold px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors"
        >
          Parcourir les annonces
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 h-[70vh]">
      {/* Sidebar threads */}
      <aside className="rounded-2xl border border-gray-100 bg-white overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-3 ${
                  activeId === t.id ? "bg-gray-50" : ""
                }`}
              >
                {t.listingThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.listingThumb}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 truncate text-sm">
                      {t.otherUser.name ?? "Utilisateur"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatRelative(t.lastMessageAt)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {t.listingTitle ?? "Annonce supprimée"}
                  </div>
                  <div
                    className={`text-xs truncate mt-1 ${
                      t.unread ? "text-gray-900 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {t.lastMessage?.senderId === userId && "Vous : "}
                    {t.lastMessage?.body ?? "Pas de message"}
                  </div>
                </div>
                {t.unread && (
                  <span className="h-2 w-2 rounded-full bg-primary-950 flex-shrink-0 mt-2" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Conversation */}
      <section className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
        {activeId ? (
          <ThreadConversation
            threadId={activeId}
            currentUserId={userId}
            onMessageSent={() => mutate()}
            onRead={() => mutate()}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Sélectionnez une conversation
          </div>
        )}
      </section>
    </div>
  );
}
