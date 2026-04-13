"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </NextAuthSessionProvider>
  );
}
