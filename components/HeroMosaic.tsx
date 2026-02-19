"use client";
import Image from "next/image";
import { useShopStore } from "../store/useShopStore";
import type { Category } from "../lib/types";

type Tile = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  action:
    | { type: "category"; value: string }
    | { type: "price"; value: [number, number] };
};

const tiles: Tile[] = [
  { id: "t1", title: "До 50 ₼", subtitle: "Букеты", image: "/.jpg", action: { type: "price", value: [0, 50] } },
  { id: "t2", title: "50–100 ₼", subtitle: "Букеты", image: "/.jpg", action: { type: "price", value: [50, 100] } },
  { id: "t3", title: "Премиум", subtitle: "Букеты", image: "/3.jpg", action: { type: "category", value: "bouquets" } },
  { id: "t4", title: "Вазы", subtitle: "Минимализм", image: "/2.jpeg", action: { type: "category", value: "vases" } },
  { id: "t5", title: "Для детей", subtitle: "Нежные композиции", image: "/1.jpg", action: { type: "category", value: "bouquets" } },
  { id: "t6", title: "Подарки", subtitle: "Наборы", image: "/4.webp", action: { type: "category", value: "gifts" } },
];

export default function HeroMosaic() {
  const { setPriceRange, minPrice, maxPrice, toggleCategory, categories } = useShopStore();

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
        {tiles.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onClick(t)}
            className="relative w-full overflow-hidden rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--background)] shadow-sm hover:shadow-md transition"
            style={{ gridColumn: i === 1 ? "span 2" : undefined }}
          >
            <Image src={t.image} alt={t.title} width={640} height={360} className="w-full h-40 sm:h-44 lg:h-48 object-cover" />
            <div className="absolute inset-0 bg-[var(--tile-tint)]" />
            <div className="absolute left-4 bottom-4">
              <div className="text-lg font-semibold">{t.title}</div>
              <div className="text-sm text-[var(--accent)]">{t.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
