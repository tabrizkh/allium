"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Phone, ShoppingCart, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { Product } from "../lib/types";
import { useShopStore } from "../store/useShopStore";
import { createReview } from "@/app/actions/reviews";

type Props = {
  product: Product & {
    reviews?: any[];
  };
  onClose: () => void;
};

type Review = {
  name: string;
  rating: number;
  text: string;
};

export default function ProductPopup({ product, onClose }: Props) {
  const { addToCart, toggleFavorite, favorites, categories, user } = useShopStore();
  const { t, i18n } = useTranslation();
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.includes(product.id);

  const productCategory = categories.find(c => c.id === product.categoryId);
  
  // productOptions structure: { "AttrID": { "OptID": priceAdjustment } }
  const optionsConfig = useMemo(() => {
    try {
      return JSON.parse(product.productOptions || "{}") as Record<string, Record<string, number>>;
    } catch {
      return {} as Record<string, Record<string, number>>;
    }
  }, [product.productOptions]);

  // State for selected options: { "AttrID": ["OptID1", "OptID2"] }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    if (productCategory?.attributes) {
      productCategory.attributes.forEach(attr => {
        initial[attr.id] = [];
      });
    }
    return initial;
  });

  const totalPrice = useMemo(() => {
    let extra = 0;
    Object.entries(selectedOptions).forEach(([attrId, optIds]) => {
      optIds.forEach(optId => {
        extra += optionsConfig[attrId]?.[optId] || 0;
      });
    });
    return product.price + extra;
  }, [product.price, selectedOptions, optionsConfig]);

  const toggleOption = (attrId: string, optId: string) => {
    setSelectedOptions(prev => {
      const current = prev[attrId] || [];
      const next = current.includes(optId)
        ? current.filter(id => id !== optId)
        : [...current, optId];
      return { ...prev, [attrId]: next };
    });
  };

  const images = useMemo(() => {
    const validImages = (product.images || []).filter(img => img && img.trim() !== "");
    if (validImages.length > 0) return validImages;
    return [`https://picsum.photos/seed/${product.id}-flowers/600/800`];
  }, [product.id, product.images]);

  const [imgIndex, setImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const productReviews = useMemo(() => {
    return (product.reviews || []).filter(r => r.status === "APPROVED");
  }, [product.reviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('reviews.auth_required'));
      return;
    }
    if (!reviewText.trim()) {
      toast.error(t('reviews.text_required'));
      return;
    }

    setIsSubmittingReview(true);
    const result = await createReview(product.id, reviewRating, reviewText);
    setIsSubmittingReview(false);

    if (result.success) {
      toast.success(result.message);
      setReviewText("");
      setReviewRating(5);
    } else {
      toast.error(result.error);
    }
  };

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

  const lang = i18n.language;
  const name = lang === 'az' ? product.name_az || product.name : lang === 'en' ? product.name_en || product.name : product.name;
  const description = lang === 'az' ? product.description_az || product.description : lang === 'en' ? product.description_en || product.description : product.description;

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE}?text=${encodeURIComponent(`Здравствуйте! Вопрос по товару: ${name}`)}`
      : `https://wa.me/?text=${encodeURIComponent(`Здравствуйте! Вопрос по товару: ${name}`)}`;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div
        data-product-popup
        className="relative w-full max-w-[980px] max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex flex-none items-center justify-between px-4 py-3 border-b border-[var(--accent-strong)]/40">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs text-[var(--accent)] truncate">{totalPrice} ₼</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
            aria-label={t('packaging_popup.cancel')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Side: Images & Actions (FIXED) */}
          <div className="w-full md:w-[45%] flex flex-col border-r border-[var(--accent-strong)]/20 bg-[var(--background)] overflow-hidden">
            <div className="p-4 md:p-6 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner bg-gray-50">
                <Image src={images[imgIndex]} alt={name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-white/30 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all active:scale-90"
                  aria-label={t('packaging_popup.cancel')}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-white/30 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all active:scale-90"
                  aria-label={t('packaging_popup.cancel')}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={[
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      i === imgIndex ? "border-[var(--accent-strong)] scale-105" : "border-transparent opacity-60 hover:opacity-100",
                    ].join(" ")}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-strong)]/40 bg-[var(--buy-button-bg)] px-3 py-2.5 text-xs font-medium hover:brightness-95 transition-all active:scale-95 shadow-sm"
                >
                  <MessageCircle size={16} />
                  {t('product.question')}
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--accent-strong)]/40 bg-[var(--background)] px-3 py-2.5 text-sm hover:bg-[var(--accent-strong)]/10 transition-all active:scale-95 shadow-sm"
                  aria-label={t('product.contact')}
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Content & Tabs (SCROLLABLE & COMPACT) */}
          <div className="w-full md:w-[55%] flex flex-col bg-[var(--panel-bg)] overflow-hidden">
            {/* Price & Primary Actions (Fixed) */}
            <div className="p-4 border-b border-[var(--accent-strong)]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="text-xl font-bold text-[var(--foreground)]">{totalPrice} ₼</div>
                  {product.oldPrice && Number(product.oldPrice) > product.price && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-400 line-through font-medium">
                        {Number(product.oldPrice) + (totalPrice - product.price)} ₼
                      </span>
                      <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                        -{Math.round(((Number(product.oldPrice) - product.price) / Number(product.oldPrice)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Добавить в избранное"
                    onClick={() => toggleFavorite(product.id)}
                    className={`inline-flex items-center justify-center rounded-xl p-2.5 border transition-all active:scale-90 ${
                      isFav 
                        ? "bg-red-50 border-red-200 text-red-500 shadow-sm" 
                        : "border-[var(--accent-strong)]/30 bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent-strong)]/10"
                    }`}
                  >
                    <Heart size={18} className={isFav ? "fill-current" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({ ...product, price: totalPrice, selectedOptions });
                      toast.success(t('header.cart') + ": " + t('checkout.guest_notice.title'));
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-strong)] text-white px-4 py-2.5 text-xs font-bold hover:brightness-110 transition-all active:scale-95 shadow-md"
                  >
                    <ShoppingCart size={16} />
                    {t('product.add_to_cart')}
                  </button>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex bg-[var(--accent-strong)]/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === "info"
                      ? "shadow-sm"
                      : " hover:text-[var(--foreground)]"
                  }`}
                >
                  {t('product.about')}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === "reviews"
                      ? "bg-white text-[var(--accent-strong)] shadow-sm"
                      : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
                  }`}
                >
                  {t('product.reviews')}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    activeTab === "reviews" ? "bg-[var(--accent-strong)] text-white" : "bg-[var(--accent-strong)]/10 text-[var(--accent-strong)]"
                  }`}>
                    {productReviews.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Content (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {activeTab === "info" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-strong)]/60">{t('product.description')}</div>
                    <p className="text-xs text-[var(--foreground)]/80 leading-relaxed italic">
                      {description}
                    </p>
                  </div>

                  {/* Dynamic Attributes Selection */}
                  {productCategory?.attributes?.map(attr => {
                    const attrOptionsConfig = optionsConfig[attr.id];
                    if (!attrOptionsConfig) return null;
                    
                    const availableOptions = attr.options.filter(opt => attrOptionsConfig[opt.id] !== undefined);
                    if (availableOptions.length === 0) return null;

                    const currentSelected = selectedOptions[attr.id] || [];
                    const attrName = lang === 'az' ? attr.name_az || attr.name : lang === 'en' ? attr.name_en || attr.name : attr.name;

                    return (
                      <div key={attr.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-strong)]/60">{attrName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {availableOptions.map(opt => {
                            const isSelected = currentSelected.includes(opt.id);
                            const priceAdj = attrOptionsConfig[opt.id] || 0;
                            const optName = lang === 'az' ? opt.name_az || opt.name : lang === 'en' ? opt.name_en || opt.name : opt.name;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => toggleOption(attr.id, opt.id)}
                                className={`group p-2.5 rounded-xl text-left border transition-all flex flex-col gap-0.5 ${
                                  isSelected 
                                    ? "border-[var(--accent-strong)] bg-[var(--accent-strong)]/10 shadow-sm" 
                                    : "border-[var(--accent-strong)]/20 bg-transparent hover:bg-[var(--accent-strong)]/5 text-[var(--foreground)]/60"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold ${isSelected ? "text-[var(--accent-strong)]" : ""}`}>{optName}</span>
                                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                    isSelected ? "bg-[var(--accent-strong)] border-[var(--accent-strong)]" : "border-[var(--accent-strong)]/20"
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                                {priceAdj !== 0 && (
                                  <span className={`text-[9px] font-bold ${isSelected ? "text-[var(--accent-strong)]/70" : "opacity-40"}`}>
                                    {priceAdj > 0 ? "+" : ""}{priceAdj} ₼
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Review Form */}
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="bg-[var(--accent-strong)]/5 rounded-xl p-4 border border-[var(--accent-strong)]/10 shadow-sm space-y-3">
                      <div className="text-xs font-bold text-[var(--foreground)]">{t('product.your_review')}</div>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            className="transition-transform active:scale-125"
                          >
                            <Star
                              size={18}
                              className={i < reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={t('product.review_placeholder')}
                        className="w-full bg-[var(--background)] border border-[var(--accent-strong)]/10 rounded-lg p-3 text-xs h-20 focus:ring-2 focus:ring-[var(--accent-strong)]/20 outline-none transition-all resize-none"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full bg-[var(--accent-strong)] text-white rounded-lg py-2 text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {isSubmittingReview ? t('product.submitting') : t('product.submit_review')}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-[var(--accent-strong)]/5 border border-dashed border-[var(--accent-strong)]/20 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-[var(--foreground)]/60">
                        {t('product.auth_to_review')} <br/>
                        <button onClick={() => useShopStore.getState().openAuthPanel("login")} className="text-[var(--accent-strong)] font-bold hover:underline mt-1">{t('auth.login')}</button>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 border-b border-[var(--accent-strong)]/10 pb-3">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {productReviews.length > 0 
                        ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
                        : "5.0"}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-[9px] text-[var(--foreground)]/40 font-bold uppercase tracking-wider">{productReviews.length} {t('product.reviews').toLowerCase()}</div>
                    </div>
                  </div>

                  {productReviews.length > 0 ? (
                    <div className="space-y-3">
                      {productReviews.map((r) => (
                        <div key={r.id} className="bg-[var(--accent-strong)]/5 rounded-xl p-3 border border-[var(--accent-strong)]/5 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[var(--accent-strong)]/10 flex items-center justify-center text-[var(--accent-strong)] font-bold text-[10px]">
                                {r.user?.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--foreground)]">{r.user?.name || t('reviews.buyer')}</span>
                                <span className="text-[8px] text-[var(--foreground)]/40">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, k) => (
                                <Star
                                  key={k}
                                  size={8}
                                  className={k < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--foreground)]/80 leading-relaxed">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <div className="text-2xl">✨</div>
                      <div className="text-[10px] text-[var(--foreground)]/40 italic">{t('product.be_first')}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
