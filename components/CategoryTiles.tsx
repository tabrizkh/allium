"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShopStore } from "../store/useShopStore";
import { useTranslation } from "react-i18next";
import type { Category } from "../lib/types";

type StoryItem = {
  type: "image" | "video";
  src: string;
  headline?: string;
  subline?: string;
};

type Tile = {
  slug: string;
  title: string;
  image: string;
  stories: StoryItem[];
};

export default function CategoryTiles() {
  const STORY_MS = 4800;
  const { categories: allCategories, toggleCategory, clearCategories } = useShopStore();
  const { t, i18n } = useTranslation();
  
  const [mounted, setMounted] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tiles = useMemo(() => {
    const lang = i18n.language;
    return allCategories
      .map((c) => {
        // Hydration safety: use default names if not mounted
        const catName = !mounted 
          ? c.name 
          : (lang === 'az' ? c.name_az || c.name : lang === 'en' ? c.name_en || c.name : c.name);
        
        return {
          slug: c.slug,
          title: catName,
          image: c.image || "/placeholder.jpg",
          stories: (c.stories && c.stories.length > 0) 
            ? c.stories.map((s) => ({
                type: s.type,
                src: s.mediaUrl,
                headline: !mounted 
                  ? s.title || catName 
                  : (lang === 'az' ? s.title_az || s.title : lang === 'en' ? s.title_en || s.title : s.title) || catName,
                subline: !mounted 
                  ? s.description || "" 
                  : (lang === 'az' ? s.description_az || s.description : lang === 'en' ? s.description_en || s.description : s.description) || "",
              }))
            : [{
                type: "image",
                src: c.image || "/placeholder.jpg",
                headline: catName,
                subline: "",
              }],
        };
      })
      .sort((a, b) => {
        const order = ["bouquets", "gifts", "decorations", "vases", "flowers", "sets"];
        const idxA = order.indexOf(a.slug);
        const idxB = order.indexOf(b.slug);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
  }, [allCategories, i18n.language, mounted]);

  const goToCatalog = () => {
    const el = document.querySelector("#catalog");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openStories = useCallback((slug: string) => {
    setOpenSlug(slug);
    setStoryIndex(0);
    setStoryProgress(0);
  }, []);

  const closeStories = useCallback(() => {
    setOpenSlug(null);
    setStoryProgress(0);
  }, []);

  const activeTile = useMemo(() => tiles.find((t) => t.slug === openSlug) || null, [openSlug]);
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
    if (!openSlug) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStories();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSlug, closeStories, goNext, goPrev]);

  useEffect(() => {
    if (!openSlug) return;
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
  }, [STORY_MS, activeTile, goNext, openSlug, storyIndex]);

  const goToCategory = useCallback((slug: string) => {
    const cat = allCategories.find(c => c.slug === slug);
    if (cat) {
      clearCategories();
      toggleCategory(cat);
      closeStories();
      goToCatalog();
    }
  }, [allCategories, clearCategories, closeStories, toggleCategory]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-2 sm:px-4 mt-3">
        <div className="flex justify-center overflow-x-auto no-scrollbar gap-2 sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible">
          {tiles.map((t) => (
            <button
              key={t.slug}
              onClick={() => openStories(t.slug)}
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

      {openSlug && activeTile && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/55" onClick={closeStories} aria-label={mounted ? t('packaging_popup.cancel') : "Закрыть"} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] z-50">
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
                    aria-label={mounted ? t('packaging_popup.cancel') : "Закрыть"}
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
                  aria-label={mounted ? t('header.prev') : "Назад"}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)]/80 backdrop-blur hover:opacity-90 transition"
                  aria-label={mounted ? t('header.next') : "Вперед"}
                >
                  <ChevronRight size={18} />
                </button>

                <div className="absolute left-0 right-0 bottom-0 p-4">
                  <button
                    type="button"
                    onClick={() => goToCategory(activeTile.slug)}
                    className="w-full rounded-2xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-4 py-3 text-sm font-semibold hover:opacity-90 transition"
                  >
                    {mounted ? t('header.catalog') : "Перейти"}
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
