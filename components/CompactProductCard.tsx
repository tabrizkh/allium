"use client";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useShopStore } from "../store/useShopStore";
import type { Product } from "../lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductPopup from "./ProductPopup";

export default function CompactProductCard({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, favorites } = useShopStore();
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.includes(product.id);
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const fallbackSrc = `https://picsum.photos/seed/${product.id}-flowers/400/400`;
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="group w-56 sm:w-64 flex-none rounded-2xl bg-[var(--background)] overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Открыть товар: ${product.name}`}
        onClick={(e) => {
          const target = e.target as HTMLElement | null;
          if (!target) return;
          if (target.closest("button")) return;
          if (target.closest("a")) return;
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
      >
        <div className="relative">
          <Image
            src={imgFailed ? fallbackSrc : (product.images[0] || fallbackSrc)}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
          <button
            aria-label="Добавить в избранное"
            onClick={() => toggleFavorite(product.id)}
            className={`absolute right-2 top-2 inline-flex items-center justify-center rounded-full p-2 shadow-sm transition ${
              isFav ? "bg-[var(--badge-bg)] text-[var(--badge-fg)]" : "border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)]"
            }`}
          >
            <Heart size={16} className={isFav ? "fill-[var(--badge-fg)]" : ""} />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 text-xs truncate">{product.name}</div>
            <span className="text-sm font-semibold shrink-0">{product.price} ₼</span>
            <button
              onClick={() => {
                addToCart(product.id);
                router.push("/cart");
              }}
              className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-2 py-2 text-xs hover:opacity-90 transition shadow-sm"
            >
              Купить
            </button>
            <button
              aria-label="Добавить в корзину"
              title="Добавить в корзину"
              onClick={() => addToCart(product.id)}
              className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition shadow-sm"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>

      {open && <ProductPopup product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
