"use client";

import { useEffect } from "react";

export default function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed:${listingId}`;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/annonces/${listingId}/view`, { method: "POST" }).catch(() => {});
  }, [listingId]);

  return null;
}
