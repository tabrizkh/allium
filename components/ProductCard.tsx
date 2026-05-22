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

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, favorites } = useShopStore();
  const { t, i18n } = useTranslation();
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.includes(product.id);
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const fallbackSrc = `https://picsum.photos/seed/${product.id}-flowers/600/800`;
  const [open, setOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
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
        className="group rounded-2xl bg-[var(--background)] overflow-hidden shadow-sm hover:shadow-lg transition break-inside-avoid mb-6 relative cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={mounted ? `${t('product.about')}: ${name}` : `О товаре: ${name}`}
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
          width={600}
          height={800}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgFailed(true)}
        />
        
        {discountPercent > 0 && (
          <div className="absolute left-3 top-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md z-10">
            -{discountPercent}%
          </div>
        )}

        <button
          aria-label={mounted ? t('header.favorites') : "Избранное"}
          onClick={() => toggleFavorite(product.id)}
          className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 shadow-sm transition z-10 ${
            isFav ? "bg-[var(--badge-bg)] text-[var(--badge-fg)] animate-pulseScale" : "border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:scale-105"
          }`}
        >
          <Heart size={18} className={isFav ? "fill-[var(--badge-fg)]" : ""} />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm truncate">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-semibold text-[var(--foreground)]">{product.price} ₼</span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">{product.oldPrice} ₼</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { 
                addToCart(product.id); 
                toast.success(mounted ? t('product.add_to_cart') : "Добавлено в корзину");
                router.push("/cart"); 
              }}
              className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-3 py-2 text-xs hover:opacity-90 transition shadow-sm hover:shadow-md shrink-0"
            >
              {mounted ? t('product.buy_now') : "Купить"}
            </button>
            <button
              aria-label={mounted ? t('product.add_to_cart') : "В корзину"}
              title={mounted ? t('product.add_to_cart') : "В корзину"}
              onClick={() => {
                addToCart(product.id);
                toast.success(mounted ? t('product.add_to_cart') : "Добавлено в корзину");
              }}
              className="inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:opacity-80 transition shadow-sm hover:shadow-md shrink-0"
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
