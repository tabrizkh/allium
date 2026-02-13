"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShopStore } from "../store/useShopStore";
import type { Category } from "../lib/types";

type StoryItem = {
  type: "image" | "video";
  src: string;
  headline?: string;
  subline?: string;
};

type Tile = {
  category: Category;
  title: string;
  image: string;
  stories: StoryItem[];
};

const tiles: Tile[] = [
  {
    category: "bouquets",
    title: "Букеты",
    image: "/bukets.webp",
    stories: [
      { type: "image", src: "/bukets.webp", headline: "Букеты", subline: "Свежие композиции на каждый день" },
      { type: "image", src: "/1.webp", headline: "Доставка", subline: "Быстро и аккуратно" },
      { type: "image", src: "/test1.png", headline: "Подбор", subline: "Под повод и бюджет" },
    ],
  },
  {
    category: "gifts",
    title: "Подарки",
    image: "/podarok.webp",
    stories: [
      { type: "image", src: "/podarok.webp", headline: "Подарки", subline: "Добавьте сюрприз к букету" },
      { type: "image", src: "/hero-gifts.svg", headline: "Идея", subline: "Соберите сет за пару кликов" },
      { type: "image", src: "/test2.png", headline: "Упаковка", subline: "Красиво как на фото" },
    ],
  },
  {
    category: "decorations",
    title: "Декор",
    image: "/dekor.jpg",
    stories: [
      { type: "image", src: "/dekor.jpg", headline: "Декор", subline: "Для дома и событий" },
      { type: "image", src: "/hero-premium.svg", headline: "Стиль", subline: "Лаконично и современно" },
      { type: "image", src: "/test333.png", headline: "Акценты", subline: "Мелочи решают" },
    ],
  },
  {
    category: "vases",
    title: "Вазы",
    image: "/vase.webp",
    stories: [
      { type: "image", src: "/vase.webp", headline: "Вазы", subline: "Под любой интерьер" },
      { type: "image", src: "/hero-vases.svg", headline: "Комбо", subline: "Ваза + цветы = готовый подарок" },
      { type: "image", src: "/2.webp", headline: "Формы", subline: "От минимализма до классики" },
    ],
  },
  {
    category: "flowers",
    title: "Цветы",
    image: "/6.webp",
    stories: [
      { type: "image", src: "/6.webp", headline: "Цветы", subline: "Сезонные и премиум" },
      { type: "image", src: "/main.jpg", headline: "Настроение", subline: "Цвет — это эмоция" },
      { type: "image", src: "/4.webp", headline: "Свежесть", subline: "Только лучшие поставки" },
    ],
  },
  {
    category: "sets",
    title: "Сеты",
    image: "/sets.jpg",
    stories: [
      { type: "image", src: "/sets.jpg", headline: "Сеты", subline: "Готовые наборы" },
      { type: "image", src: "/hero-flowers.svg", headline: "Вместе", subline: "Цветы + подарки + декор" },
      { type: "image", src: "/test22.png", headline: "Выгодно", subline: "Комплектом приятнее" },
    ],
  },
];

export default function CategoryTiles() {
  const STORY_MS = 4800;
  const { toggleCategory, clearCategories } = useShopStore();
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const goToCatalog = () => {
    const el = document.querySelector("#catalog");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openStories = useCallback((c: Category) => {
    setOpenCategory(c);
    setStoryIndex(0);
    setStoryProgress(0);
  }, []);

  const closeStories = useCallback(() => {
    setOpenCategory(null);
    setStoryProgress(0);
  }, []);

  const activeTile = useMemo(() => tiles.find((t) => t.category === openCategory) || null, [openCategory]);
  const activeStory = activeTile?.stories?.[storyIndex] || null;

  const goPrev = useCallback(() => {
    setStoryProgress(0);
    setStoryIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    if (!activeTile) return;
    setStoryProgress(0);
    setStoryIndex((i) => {
      const next = i + 1;
      if (next >= activeTile.stories.length) {
        closeStories();
        return i;
      }
      return next;
    });
  }, [activeTile, closeStories]);

  useEffect(() => {
    if (!openCategory) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStories();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCategory, closeStories, goNext, goPrev]);

  useEffect(() => {
    if (!openCategory) return;
    if (!activeTile) return;
    storyStartRef.current = performance.now();

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => goNext(), STORY_MS);

    const tick = () => {
      const elapsed = performance.now() - storyStartRef.current;
      const progress = Math.min(1, Math.max(0, elapsed / STORY_MS));
      setStoryProgress(progress);
      if (progress < 1) rafRef.current = window.requestAnimationFrame(tick);
    };

    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [STORY_MS, activeTile, goNext, openCategory, storyIndex]);

  const goToCategory = useCallback((c: Category) => {
    clearCategories();
    toggleCategory(c);
    closeStories();
    goToCatalog();
  }, [clearCategories, closeStories, toggleCategory]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-2 sm:px-4 mt-3">
        <div className="flex justify-center overflow-x-auto no-scrollbar gap-2 sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible">
          {tiles.map((t) => (
            <button
              key={t.category}
              onClick={() => openStories(t.category)}
              className="group flex flex-col items-center gap-2 cursor-pointer shrink-0"
              aria-label={t.title}
            >
              <span className="inline-block rounded-full overflow-hidden border border-[var(--accent-strong)] bg-[var(--accent-strong)]/10 p-1 shadow-md transition group-hover:scale-[1.03]">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden">
                  <Image src={t.image} alt={t.title} width={160} height={160} className="w-full h-full object-cover" />
                </div>
              </span>
              <span className="text-xs md:text-sm font-medium text-center text-[var(--foreground)]">{t.title}</span>
            </button>
          ))}
        </div>
      </section>

      {openCategory && activeTile && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/55" onClick={closeStories} aria-label="Закрыть истории" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] з-4">
            <div className="rounded-3xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-2xl overflow-hidden p-4">
              <div className="p-3">
                <div className="flex gap-1.5">
                  {activeTile.stories.map((_, i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full bg-[var(--accent-strong)]/25 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--badge-bg)]"
                        style={{
                          width:
                            i < storyIndex
                              ? "100%"
                              : i === storyIndex
                                ? `${Math.round(storyProgress * 100)}%`
                                : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{activeStory?.headline || activeTile.title}</div>
                    {activeStory?.subline && <div className="text-xs text-[var(--accent)] truncate">{activeStory.subline}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={closeStories}
                    className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
                    aria-label="Закрыть"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="relative bg-[var(--background)] rounded-2xl overflow-hidden">
                <div className="relative w-full h-[520px] sm:h-[560px]">
                  {activeStory?.type === "video" ? (
                    <video src={activeStory.src} className="w-full h-full object-cover" autoPlay muted playsInline />
                  ) : (
                    <Image src={activeStory?.src || activeTile.image} alt={activeTile.title} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/20" />
                </div>

                <button
                  type="button"
                  onClick={goPrev}
                  disabled={storyIndex === 0}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)]/80 backdrop-blur transition ${
                    storyIndex === 0 ? "opacity-40" : "hover:opacity-90"
                  }`}
                  aria-label="Предыдущая история"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)]/80 backdrop-blur hover:opacity-90 transition"
                  aria-label="Следующая история"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="absolute left-0 right-0 bottom-0 p-4">
                  <button
                    type="button"
                    onClick={() => goToCategory(activeTile.category)}
                    className="w-full rounded-2xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-4 py-3 text-sm font-semibold hover:opacity-90 transition"
                  >
                    Перейти к {activeTile.title.toLowerCase()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
