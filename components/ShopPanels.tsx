"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShopStore } from "../store/useShopStore";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const { favorites, cart, products, addToCart, removeFromCart, updateCartQuantity, toggleFavorite, categories } = useShopStore();

  const lang = i18n.language;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const favoritesList = useMemo(() => (Array.isArray(favorites) ? favorites : []), [favorites]);

  const favoritesRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const [favoritesPos, setFavoritesPos] = useState<Point | null>(null);
  const [cartPos, setCartPos] = useState<Point | null>(null);

  const cartItems = Array.isArray(cart) ? cart : [];

  const getOptionName = (productId: string, attrId: string, optId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return "";
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) return "";
    const attr = category.attributes?.find(a => a.id === attrId);
    if (!attr) return "";
    const opt = attr.options.find(o => o.id === optId);
    if (!opt) return "";
    return lang === 'az' ? opt.name_az || opt.name : lang === 'en' ? opt.name_en || opt.name : opt.name;
  };

  const getAttributeName = (productId: string, attrId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return "";
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) return "";
    const attr = category.attributes?.find(a => a.id === attrId);
    if (!attr) return "";
    return lang === 'az' ? attr.name_az || attr.name : lang === 'en' ? attr.name_en || attr.name : attr.name;
  };

  const renderOptions = (item: any) => {
    if (!item.selectedOptions) return null;
    
    return Object.entries(item.selectedOptions as Record<string, string | string[]>).map(([attrId, val]) => {
      const attrName = getAttributeName(item.productId, attrId);
      const optIds = Array.isArray(val) ? val : [val];
      
      if (optIds.length === 0) return null;

      return (
        <span key={attrId} className="text-[10px] bg-[var(--accent-strong)]/10 px-1.5 py-0.5 rounded-full text-[var(--foreground)]/70">
          {attrName}: {optIds.map(id => getOptionName(item.productId, attrId, id)).join(", ")}
        </span>
      );
    });
  };

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
              <h2 className="text-sm font-semibold">{mounted ? t('header.favorites') : "Избранное"}</h2>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition"
              onClick={onCloseFavorites}
              aria-label={mounted ? t('packaging_popup.cancel') : "Закрыть"}
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-3 max-h-[70vh] overflow-auto">
            {favoritesList.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {products
                  .filter((p) => favoritesList.includes(p.id))
                  .map((p) => {
                    const name = lang === 'az' ? p.name_az || p.name : lang === 'en' ? p.name_en || p.name : p.name;
                    return (
                      <div key={p.id} className="flex gap-3 items-center group">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={p.images?.[0] || "/placeholder.jpg"} alt={name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{name}</div>
                          <div className="text-xs text-[var(--accent)]">{p.price} ₼</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => addToCart(p.id)}
                            className="p-2 rounded-lg hover:bg-[var(--accent-strong)]/15 transition text-[var(--accent-strong)]"
                            title={mounted ? t('product.add_to_cart') : "В корзину"}
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(p.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition text-red-500"
                            title={mounted ? t('favorites.remove') : "Удалить"}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--accent)] text-sm">
                {mounted ? t('favorites.empty') : "Список избранного пуст"}
              </div>
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
        <div className="rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
          <div
            className="flex items-center justify-between px-3 py-2 border-b border-[var(--accent-strong)]/40 select-none touch-none"
            onPointerDown={(e) => startDrag("cart", e)}
            style={{ cursor: "move" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <h2 className="text-sm font-semibold">{mounted ? t('header.cart') : "Корзина"}</h2>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition"
              onClick={onCloseCart}
              aria-label={mounted ? t('packaging_popup.cancel') : "Закрыть"}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-3">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const p = products.find((x) => x.id === item.productId);
                  if (!p) return null;
                  const name = lang === 'az' ? p.name_az || p.name : lang === 'en' ? p.name_en || p.name : p.name;
                  
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={p.images?.[0] || "/placeholder.jpg"} alt={name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="text-sm font-medium truncate">{name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {renderOptions(item)}
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-[var(--accent-strong)]/10 rounded-lg px-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:text-[var(--accent-strong)] transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:text-[var(--accent-strong)] transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">{p.price * item.quantity} ₼</span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-500 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--accent)]">
                <div className="mb-2 opacity-20 flex justify-center"><ShoppingBag size={48} /></div>
                <div className="text-sm">{mounted ? t('cart.empty') : "Ваша корзина пуста"}</div>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 border-t border-[var(--accent-strong)]/40 bg-[var(--accent-strong)]/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--accent)]">{mounted ? t('checkout.total') : "Итого"}</span>
                <span className="text-xl font-bold">{cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0)} ₼</span>
              </div>
              <Link
                href="/checkout"
                onClick={onCloseCart}
                className="block w-full text-center bg-[var(--accent-strong)] text-white py-3 rounded-xl font-bold shadow-lg hover:brightness-110 transition active:scale-[0.98]"
              >
                {mounted ? t('header.cart') : "Перейти к оформлению"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
