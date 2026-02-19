"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShopStore } from "../store/useShopStore";

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Props = {
  favoritesOpen: boolean;
  cartOpen: boolean;
  onCloseFavorites: () => void;
  onCloseCart: () => void;
  topOffset: number;
};

export default function ShopPanels({ favoritesOpen, cartOpen, onCloseFavorites, onCloseCart, topOffset }: Props) {
  const { favorites, cart, products, addToCart, removeFromCart, toggleFavorite } = useShopStore();

  const favoritesList = useMemo(() => (Array.isArray(favorites) ? favorites : []), [favorites]);

  const favoritesRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const [favoritesPos, setFavoritesPos] = useState<Point | null>(null);
  const [cartPos, setCartPos] = useState<Point | null>(null);

  const dragRef = useRef<
    | {
        panel: "favorites" | "cart";
        pointerId: number;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
      }
    | null
  >(null);

  useEffect(() => {
    if (!favoritesOpen) return;
    if (typeof window === "undefined") return;
    setFavoritesPos((prev) => {
      if (prev) return prev;
      const width = favoritesRef.current?.offsetWidth ?? 420;
      const x = Math.max(12, window.innerWidth - width - 12);
      const y = Math.max(12, topOffset + 12);
      return { x, y };
    });
  }, [favoritesOpen, topOffset]);

  useEffect(() => {
    if (!cartOpen) return;
    if (typeof window === "undefined") return;
    setCartPos((prev) => {
      if (prev) return prev;
      const width = cartRef.current?.offsetWidth ?? 420;
      const x = Math.max(12, window.innerWidth - width - 12);
      const y = Math.max(12, topOffset + 12);
      return { x, y };
    });
  }, [cartOpen, topOffset]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (e.pointerId !== state.pointerId) return;
      if (typeof window === "undefined") return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      const panelEl = state.panel === "favorites" ? favoritesRef.current : cartRef.current;
      const width = panelEl?.offsetWidth ?? 420;
      const height = panelEl?.offsetHeight ?? 520;

      const minX = 12;
      const minY = Math.max(12, topOffset + 12);
      const maxX = Math.max(minX, window.innerWidth - width - 12);
      const maxY = Math.max(minY, window.innerHeight - height - 12);

      const next: Point = {
        x: clamp(state.originX + dx, minX, maxX),
        y: clamp(state.originY + dy, minY, maxY),
      };

      if (state.panel === "favorites") setFavoritesPos(next);
      else setCartPos(next);
    };

    const onPointerUp = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (e.pointerId !== state.pointerId) return;
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [topOffset]);

  useEffect(() => {
    if (!favoritesOpen && !cartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseFavorites();
        onCloseCart();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [favoritesOpen, cartOpen, onCloseFavorites, onCloseCart]);

  useEffect(() => {
    if (!favoritesOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (favoritesRef.current?.contains(target)) return;
      onCloseFavorites();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [favoritesOpen, onCloseFavorites]);

  useEffect(() => {
    if (!cartOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (cartRef.current?.contains(target)) return;
      onCloseCart();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [cartOpen, onCloseCart]);

  const startDrag = (panel: "favorites" | "cart", e: React.PointerEvent) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 640) return;

    const currentPos = panel === "favorites" ? favoritesPos : cartPos;
    const fallback: Point = { x: 12, y: Math.max(12, topOffset + 12) };
    const origin = currentPos ?? fallback;

    dragRef.current = {
      panel,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: origin.x,
      originY: origin.y,
    };
  };

  const favoritesStyle = {
    left: (favoritesPos?.x ?? 12) + "px",
    top: (favoritesPos?.y ?? Math.max(12, topOffset + 12)) + "px",
  };

  const cartStyle = {
    left: (cartPos?.x ?? 12) + "px",
    top: (cartPos?.y ?? Math.max(12, topOffset + 12)) + "px",
  };

  return (
    <>
      <div
        ref={favoritesRef}
        className={[
          "fixed z-40 w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)]",
          "transition duration-200 ease-out",
          favoritesOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-[110%] pointer-events-none",
        ].join(" ")}
        style={favoritesStyle}
      >
        <div className="rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-2 border-b border-[var(--accent-strong)]/40 select-none touch-none"
            onPointerDown={(e) => startDrag("favorites", e)}
            style={{ cursor: "move" }}
          >
            <div className="flex items-center gap-2">
              <Heart size={18} />
              <h2 className="text-sm font-semibold">Избранное</h2>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition"
              onClick={onCloseFavorites}
              aria-label="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 max-h-[70vh] overflow-auto">
            {favoritesList.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {products
                  .filter((p) => favoritesList.includes(p.id))
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[var(--accent-strong)]/60 p-2 bg-[var(--background)]">
                      <Image src={p.images[0]} alt={p.name} width={72} height={72} className="h-18 w-18 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-[var(--accent)]">{p.price} ₼</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(p.id)}
                          className="rounded-full p-2 border border-[var(--accent-strong)]/60 hover:bg-[var(--accent-strong)]/15 transition"
                          aria-label="Убрать из избранного"
                        >
                          <Heart size={16} />
                        </button>
                        <button
                          onClick={() => addToCart(p.id)}
                          aria-label="Добавить в корзину"
                          title="Добавить в корзину"
                          className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition shadow-sm"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[var(--accent)]">Список избранного пуст.</p>
            )}
          </div>
        </div>
      </div>

      <div
        ref={cartRef}
        className={[
          "fixed z-40 w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)]",
          "transition duration-200 ease-out",
          cartOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-[110%] pointer-events-none",
        ].join(" ")}
        style={cartStyle}
      >
        <div className="rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-2 border-b border-[var(--accent-strong)]/40 select-none touch-none"
            onPointerDown={(e) => startDrag("cart", e)}
            style={{ cursor: "move" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <h2 className="text-sm font-semibold">Корзина</h2>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition"
              onClick={onCloseCart}
              aria-label="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 max-h-[70vh] overflow-auto">
            {Object.keys(cart).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(cart).map(([id, qty]) => {
                  const product = products.find((p) => p.id === id);
                  if (!product) return null;
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-xl border border-[var(--accent-strong)]/60 p-2 bg-[var(--background)]">
                      <Image src={product.images[0]} alt={product.name} width={72} height={72} className="h-18 w-18 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">{product.name}</div>
                        <div className="text-xs text-[var(--accent)]">{product.price} ₼</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(id)} className="rounded-lg border border-[var(--accent-strong)]/60 px-2 py-1" aria-label="Убавить">
                          −
                        </button>
                        <span className="w-8 text-center">{qty}</span>
                        <button onClick={() => addToCart(id)} className="rounded-lg border border-[var(--accent-strong)]/60 px-2 py-1" aria-label="Добавить">
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between border-t border-[var(--accent-strong)]/60 pt-3">
                  <div className="text-sm font-semibold">
                    Итого:{" "}
                    {Object.entries(cart).reduce((sum, [id, qty]) => {
                      const p = products.find((x) => x.id === id);
                      return sum + (p ? p.price * qty : 0);
                    }, 0)}{" "}
                    ₼
                  </div>
                  <Link 
                    href="/checkout" 
                    onClick={onCloseCart}
                    className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-4 py-2 text-sm hover:opacity-90 transition"
                  >
                    Оформить заказ
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-[var(--accent)]">Корзина пуста.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
