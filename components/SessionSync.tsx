"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useShopStore } from "@/store/useShopStore";
import { getFavoritesAction } from "@/app/actions/user";

export default function SessionSync() {
  const { data: session, status } = useSession();
  const { setUser, setFavorites } = useShopStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
            id: session.user.id || "",
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role || "USER",
            phone: session.user.phone || null,
          });
      
      getFavoritesAction().then((favs) => {
          if (Array.isArray(favs)) {
              setFavorites(favs.map((f: any) => f.productId));
          }
      });
    } else if (status === "unauthenticated") {
      setUser(null);
      setFavorites([]);
    }
  }, [session, status, setUser, setFavorites]);

  return null;
}
