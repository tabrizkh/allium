"use client";
import Image from "next/image";
import { useShopStore } from "../store/useShopStore";
import type { Category } from "../lib/types";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

type Tile = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  defaultTitle: string;
  defaultSubtitle: string;
  image: string;
  action:
    | { type: "category"; value: string }
    | { type: "price"; value: [number, number] };
};

const tiles: Tile[] = [
  { id: "t1", titleKey: "hero.tiles.under_50", subtitleKey: "hero.tiles.bouquets", defaultTitle: "До 50 ₼", defaultSubtitle: "Букеты", image: "/1.jpg", action: { type: "price", value: [0, 50] } },
  { id: "t2", titleKey: "hero.tiles.50_100", subtitleKey: "hero.tiles.bouquets", defaultTitle: "50–100 ₼", defaultSubtitle: "Букеты", image: "/2.jpeg", action: { type: "price", value: [50, 100] } },
  { id: "t3", titleKey: "hero.tiles.premium", subtitleKey: "hero.tiles.bouquets", defaultTitle: "Премиум", defaultSubtitle: "Букеты", image: "/3.jpg", action: { type: "category", value: "bouquets" } },
  { id: "t4", titleKey: "hero.tiles.vases", subtitleKey: "hero.tiles.minimalism", defaultTitle: "Вазы", defaultSubtitle: "Минимализм", image: "/vase.webp", action: { type: "category", value: "vases" } },
  { id: "t5", titleKey: "hero.tiles.for_children", subtitleKey: "hero.tiles.delicate", defaultTitle: "Для детей", defaultSubtitle: "Нежные композиции", image: "/1.webp", action: { type: "category", value: "bouquets" } },
  { id: "t6", titleKey: "hero.tiles.gifts", subtitleKey: "hero.tiles.sets", defaultTitle: "Подарки", defaultSubtitle: "Наборы", image: "/4.webp", action: { type: "category", value: "gifts" } },
];

export default function HeroMosaic() {
  const { t } = useTranslation();
  const { setPriceRange, minPrice, maxPrice, toggleCategory, categories } = useShopStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToCatalog = () => {
    const el = document.querySelector("#catalog");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onClick = (t: Tile) => {
    if (t.action.type === "price") {
      const [a, b] = t.action.value;
      const floor = Math.max(minPrice, a);
      const ceil = Math.min(maxPrice, b);
      setPriceRange([floor, ceil]);
    } else {
      const category = categories.find((c) => c.slug === t.action.value);
      if (category) {
        toggleCategory(category);
      }
    }
    goToCatalog();
  };

  return (
    <section className="mx-auto max-w-6xl px-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map((tile, i) => (
          <button
            key={tile.id}
            onClick={() => onClick(tile)}
            className="relative w-full overflow-hidden rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--background)] shadow-sm hover:shadow-md transition group"
            style={{ gridColumn: (i === 1 && typeof window !== 'undefined' && window.innerWidth >= 640) ? "span 2" : undefined }}
          >
            <div className="relative w-full h-40 sm:h-44 lg:h-48 overflow-hidden">
              <Image src={tile.image} alt={mounted ? t(tile.titleKey) : tile.defaultTitle} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute left-4 bottom-4 text-left">
              <div className="text-lg font-semibold text-white drop-shadow-sm">{mounted ? t(tile.titleKey) : tile.defaultTitle}</div>
              <div className="text-sm text-white/80 drop-shadow-sm">{mounted ? t(tile.subtitleKey) : tile.defaultSubtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
