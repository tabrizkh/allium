"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Phone, ShoppingCart, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/types";
import { useShopStore } from "../store/useShopStore";

type Props = {
  product: Product;
  onClose: () => void;
};

type Review = {
  name: string;
  rating: number;
  text: string;
};

export default function ProductPopup({ product, onClose }: Props) {
  const { addToCart, toggleFavorite, favorites } = useShopStore();
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.includes(product.id);

  const images = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return [`https://picsum.photos/seed/${product.id}-flowers/600/800`];
  }, [product.id, product.images]);

  const reviews: Review[] = useMemo(
    () => [
      { name: "Мария", rating: 5, text: "Очень свежие цветы, упаковка аккуратная. Доставка была вовремя." },
      { name: "Айхан", rating: 5, text: "Выглядит как на фото, даже лучше. Сервис отличный." },
      { name: "Наргиз", rating: 4, text: "Красиво, приятный аромат. Хотелось бы чуть больше вариантов упаковки." },
    ],
    []
  );

  const [imgIndex, setImgIndex] = useState(0);
  const [sizes, setSizes] = useState<"S" | "M" | "L">("M");
  const [packaging, setPackaging] = useState<"standard" | "premium">("standard");
  const [addons, setAddons] = useState<{ card: boolean; sweets: boolean }>({ card: true, sweets: false });
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setImgIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setImgIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const modal = document.querySelector("[data-product-popup]");
      if (modal && modal.contains(target)) return;
      onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onClose]);

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE}?text=${encodeURIComponent(`Здравствуйте! Вопрос по товару: ${product.name}`)}`
      : `https://wa.me/?text=${encodeURIComponent(`Здравствуйте! Вопрос по товару: ${product.name}`)}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55" />
      <div
        data-product-popup
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] max-w-[calc(100vw-24px)] flex flex-col overflow-hidden rounded-3xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-2xl my-auto"
      >
        <div className="flex flex-none items-center justify-between px-4 py-3 border-b border-[var(--accent-strong)]/40">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{product.name}</div>
            <div className="text-xs text-[var(--accent)] truncate">{product.price} ₼</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 md:h-full">
            <div className="relative bg-[var(--background)] p-4 md:overflow-y-auto md:h-full pb-8 md:pb-8">
              <div className="relative h-[240px] sm:h-[320px] md:h-[380px] rounded-2xl overflow-hidden">
                <Image src={images[imgIndex]} alt={product.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10 pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-white/30 bg-black/20 text-white backdrop-blur hover:bg-black/30 transition"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-white/30 bg-black/20 text-white backdrop-blur hover:bg-black/30 transition"
                  aria-label="Следующее фото"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="mt-4 px-1 flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={[
                      "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border transition",
                      i === imgIndex ? "border-[var(--accent-strong)]/80" : "border-[var(--accent-strong)]/30 hover:border-[var(--accent-strong)]/60",
                    ].join(" ")}
                    aria-label={`Фото ${i + 1}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--buy-button-bg)] px-3 py-2 text-sm hover:bg-[var(--accent-strong)]/15 transition"
                >
                  <MessageCircle size={16} />
                  Вопрос по товару
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] px-3 py-2 text-sm hover:bg-[var(--accent-strong)]/15 transition"
                  aria-label="Связаться"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>

            <div className="p-4 md:p-5 md:overflow-y-auto md:h-full pb-10 md:pb-10 relative">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-lg font-semibold">{product.price} ₼</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Добавить в избранное"
                    onClick={() => toggleFavorite(product.id)}
                    className={`inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 transition ${
                      isFav ? "bg-[var(--badge-bg)] text-[var(--badge-fg)]" : "bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent-strong)]/15"
                    }`}
                  >
                    <Heart size={18} className={isFav ? "fill-[var(--badge-fg)]" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-strong)]/60 bg-[var(--buy-button-bg)] text-[var(--foreground)] px-4 py-2 text-sm hover:opacity-90 transition"
                  >
                    <ShoppingCart size={16} />
                    В корзину
                  </button>
                </div>
              </div>

              <div className="flex border-b border-[var(--accent-strong)]/20 mb-5">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "info"
                      ? "border-[var(--accent-strong)] text-[var(--foreground)]"
                      : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                  }`}
                >
                  О товаре
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
                    activeTab === "reviews"
                      ? "border-[var(--accent-strong)] text-[var(--foreground)]"
                      : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                  }`}
                >
                  Отзывы
                  <span className="text-xs bg-[var(--accent-strong)]/10 px-1.5 py-0.5 rounded-full ml-1">
                    {reviews.length}
                  </span>
                </button>
              </div>

              {activeTab === "info" ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <div className="text-sm font-semibold">Описание</div>
                    <div className="mt-2 text-sm text-[var(--foreground)]/90 leading-relaxed">{product.description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold">Размер</div>
                      <div className="mt-2 flex gap-2">
                        {(["S", "M", "L"] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSizes(v)}
                            className={`flex-1 rounded-xl border px-1 py-2 text-sm transition ${
                              sizes === v
                                ? "border-[var(--accent-strong)]/70 bg-[var(--accent-strong)]/20"
                                : "border-[var(--accent-strong)]/35 bg-[var(--background)] hover:bg-[var(--accent-strong)]/10"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold">Упаковка</div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPackaging("standard")}
                          className={`rounded-xl border px-1 py-2 text-sm transition truncate ${
                            packaging === "standard"
                              ? "border-[var(--accent-strong)]/70 bg-[var(--accent-strong)]/20"
                              : "border-[var(--accent-strong)]/35 bg-[var(--background)] hover:bg-[var(--accent-strong)]/10"
                          }`}
                        >
                          Стандарт
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackaging("premium")}
                          className={`rounded-xl border px-1 py-2 text-sm transition truncate ${
                            packaging === "premium"
                              ? "border-[var(--accent-strong)]/70 bg-[var(--accent-strong)]/20"
                              : "border-[var(--accent-strong)]/35 bg-[var(--background)] hover:bg-[var(--accent-strong)]/10"
                          }`}
                        >
                          Премиум
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-semibold">Дополнительно</div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAddons((a) => ({ ...a, card: !a.card }))}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                            addons.card
                              ? "border-[var(--accent-strong)]/70 bg-[var(--accent-strong)]/20"
                              : "border-[var(--accent-strong)]/35 bg-[var(--background)] hover:bg-[var(--accent-strong)]/10"
                          }`}
                        >
                          <span>Открытка</span>
                          <span className="text-[var(--accent)]">{addons.card ? "Да" : "Нет"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddons((a) => ({ ...a, sweets: !a.sweets }))}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                            addons.sweets
                              ? "border-[var(--accent-strong)]/70 bg-[var(--accent-strong)]/20"
                              : "border-[var(--accent-strong)]/35 bg-[var(--background)] hover:bg-[var(--accent-strong)]/10"
                          }`}
                        >
                          <span>Сладости</span>
                          <span className="text-[var(--accent)]">{addons.sweets ? "Да" : "Нет"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 mb-2">
                    <Star size={14} className="fill-[var(--accent-strong)] text-[var(--accent-strong)]" />
                    <span className="font-medium text-[var(--foreground)]">4.8</span>
                    <span>•</span>
                    <span>{reviews.length} отзыва</span>
                  </div>
                  {reviews.map((r, i) => (
                    <div key={i} className="rounded-xl border border-[var(--accent-strong)]/35 bg-white/70 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{r.name}</div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, k) => (
                            <Star
                              key={k}
                              size={14}
                              className={
                                k < r.rating ? "fill-[var(--accent-strong)] text-[var(--accent-strong)]" : "text-[var(--accent-strong)]/35"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-[var(--foreground)]/85">{r.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
