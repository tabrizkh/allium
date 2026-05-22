"use client";
import { useShopStore } from "../store/useShopStore";
import { useMemo, useRef } from "react";
import CompactProductCard from "./CompactProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function Trending() {
  const { t } = useTranslation();
  const { products } = useShopStore();
  const trackRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const list = useMemo(() => products.filter(p => p.isTrending).slice(0, 12), [products]);
  if (list.length === 0) return null;
  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };
  return (
    <section id="promos" className="mx-auto max-w-6xl px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{mounted ? t('hero.tiles.trending') : "Тренды недели"}</h2>
        <div className="inline-flex gap-2">
          <button onClick={() => scrollBy(-1)} className="rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] hover:bg-[var(--accent-strong)]/15 transition"><ChevronLeft size={16} /></button>
          <button onClick={() => scrollBy(1)} className="rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--background)] hover:bg-[var(--accent-strong)]/15 transition"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div ref={trackRef} className="mt-3 overflow-x-auto scroll-smooth pb-4 brand-scrollbar">
        <div className="flex gap-3 justify-between">
          {list.map((p) => (
            <CompactProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
