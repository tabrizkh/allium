"use client";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useShopStore } from "../store/useShopStore";
import type { Product } from "../lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import ProductPopup from "./ProductPopup";

export default function CompactProductCard({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, favorites } = useShopStore();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.includes(product.id);
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const fallbackSrc = `https://picsum.photos/seed/${product.id}-flowers/400/400`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lang = i18n.language;
  const name = !mounted 
    ? product.name 
    : (lang === 'az' ? product.name_az || product.name : lang === 'en' ? product.name_en || product.name : product.name);

  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <>
      <div
        className="group w-56 sm:w-64 flex-none rounded-2xl bg-[var(--background)] overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${mounted ? t('product.about') : "Открыть товар"}: ${name}`}
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
            src={imgFailed ? fallbackSrc : (product.images?.[0] && product.images[0].trim() !== "" ? product.images[0] : fallbackSrc)}
            alt={name}
            width={400}
            height={300}
            className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />

          {discountPercent > 0 && (
            <div className="absolute left-2 top-2 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md z-10">
              -{discountPercent}%
            </div>
          )}

          <button
            aria-label={mounted ? t('header.favorites') : "В избранное"}
            onClick={() => toggleFavorite(product.id)}
            className={`absolute right-2 top-2 inline-flex items-center justify-center rounded-full p-2 shadow-sm transition z-10 ${
              isFav ? "bg-[var(--badge-bg)] text-[var(--badge-fg)]" : "border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)]"
            }`}
          >
            <Heart size={16} className={isFav ? "fill-[var(--badge-fg)]" : ""} />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate">{name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold">{product.price} ₼</span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-[10px] text-gray-400 line-through">{product.oldPrice} ₼</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  addToCart(product.id);
                  toast.success(mounted ? t('product.add_to_cart') : "Добавлено");
                  router.push("/cart");
                }}
                className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-2 py-2 text-xs hover:opacity-90 transition shadow-sm"
              >
                {mounted ? t('product.buy_now') : "Купить"}
              </button>
              <button
                aria-label={mounted ? t('product.add_to_cart') : "В корзину"}
                title={mounted ? t('product.add_to_cart') : "В корзину"}
                onClick={() => {
                  addToCart(product.id);
                  toast.success(mounted ? t('product.add_to_cart') : "Добавлено");
                }}
                className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition shadow-sm"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && <ProductPopup product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
