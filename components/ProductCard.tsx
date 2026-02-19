"use client";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useShopStore } from "../store/useShopStore";
import type { Product } from "../lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductPopup from "./ProductPopup";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, favorites } = useShopStore();
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.includes(product.id);
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const fallbackSrc = `https://picsum.photos/seed/${product.id}-flowers/600/800`;
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="group rounded-2xl bg-[var(--background)] overflow-hidden shadow-sm hover:shadow-lg transition break-inside-avoid mb-6 relative cursor-pointer"
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
          width={600}
          height={800}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgFailed(true)}
        />
        <button
          aria-label="Добавить в избранное"
          onClick={() => toggleFavorite(product.id)}
          className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 shadow-sm transition ${
            isFav ? "bg-[var(--badge-bg)] text-[var(--badge-fg)] animate-pulseScale" : "border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:scale-105"
          }`}
        >
          <Heart size={18} className={isFav ? "fill-[var(--badge-fg)]" : ""} />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <h3 className="flex-1 text-sm truncate">{product.name}</h3>
          <span className="text-base font-semibold shrink-0">{product.price} ₼</span>
          <button
            onClick={() => { addToCart(product.id); router.push("/cart"); }}
            className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-3 py-2 text-xs hover:opacity-90 transition shadow-sm hover:shadow-md shrink-0"
          >
            Купить
          </button>
          <button
            aria-label="Добавить в корзину"
            title="Добавить в корзину"
            onClick={() => addToCart(product.id)}
            className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition shadow-sm hover:shadow-md shrink-0"
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
