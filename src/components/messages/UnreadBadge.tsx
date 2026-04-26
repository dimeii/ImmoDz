"use client";

import useSWR from "swr";
import { Link } from "@/i18n/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UnreadBadge() {
  const { data } = useSWR<{ count: number }>(
    "/api/messages/unread-count",
    fetcher,
    { refreshInterval: 30000, refreshWhenHidden: false }
  );

  const count = data?.count ?? 0;

  return (
    <Link
      href="/dashboard/messages"
      aria-label="Messages"
      className="relative hidden md:inline-flex items-center text-emerald-800/60 hover:text-emerald-900 transition-colors"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
