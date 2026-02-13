"use client";
import Image from "next/image";
 
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
 

export default function HeroShowcase() {
  const SLIDE_MS = 5200;
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const slides = [
    
    {
      id: "h2",
      title: "Букеты недели",
      caption: "Нежные композиции со скидкой",
      description:
        "Самые популярные букеты недели — идеальны для свидания, дня рождения или просто так, без повода.",
      points: ["Флорист подберёт оттенки", "Свежие поставки ежедневно"],
      image: "/bukets.webp",
      category: "bouquets",
    },
    {
      id: "h3",
      title: "Вазы и декоры",
      caption: "Минимализм и стиль",
      description:
        "Стекло, керамика и фактурные формы — чтобы букет выглядел ещё эффектнее и жил дольше дома.",
      points: ["Подбираем под интерьер", "Можно в подарок вместе с цветами"],
      image: "/vase.webp",
      category: "vases",
    },
    {
      id: "h4",
      title: "Подарочные наборы",
      caption: "Удобно и красиво",
      description:
        "Добавьте к букету подарок: сладости, открытку или милые детали — чтобы впечатление было ещё сильнее.",
      points: ["Соберём набор за вас", "Красиво как на фото"],
      image: "/podarok.webp",
      category: "gifts",
    },
  ];

  const stop = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = 0;
  }, []);

  useEffect(() => {
    stop();
    const remaining = SLIDE_MS - elapsedRef.current;

    if (remaining <= 0) {
      timeoutRef.current = window.setTimeout(() => {
        elapsedRef.current = 0;
        setProgress(0);
        setIndex((i) => (i + 1) % slides.length);
      }, 0);
      return () => stop();
    }

    startRef.current = performance.now();
    timeoutRef.current = window.setTimeout(() => {
      elapsedRef.current = 0;
      setProgress(0);
      setIndex((i) => (i + 1) % slides.length);
    }, remaining);

    const tick = () => {
      if (!startRef.current) return;
      const elapsed = elapsedRef.current + (performance.now() - startRef.current);
      const nextProgress = Math.min(1, Math.max(0, elapsed / SLIDE_MS));
      setProgress(nextProgress);
      if (nextProgress < 1) rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => stop();
  }, [SLIDE_MS, index, slides.length, stop]);

  const goToCatalog = () => {
    const el = document.querySelector("#catalog");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPromos = () => {
    const el = document.querySelector("#promos");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  
  

  return (
    <section className="w-full mt-6 border-y border-[var(--accent-strong)]/60 bg-[var(--background)]">
      <div
        className="relative overflow-hidden bg-[var(--background)] h-[640px] sm:h-[680px] md:h-[440px]"
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-500 ${index === i ? "opacity-100" : "opacity-0"}`}
          >
            <div className="mx-auto max-w-6xl px-0 sm:px-4 h-full">
              <div className="relative h-full flex flex-col md:flex-row overflow-hidden border border-[var(--accent-strong)]/35 bg-[var(--panel-bg)] rounded-none sm:rounded-r-3xl sm:rounded-l-none">
                <div className="absolute left-4 right-4 bottom-4 z-20 flex gap-1.5">
                  {slides.map((_, k) => (
                    <div key={k} className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/70"
                        style={{
                          width:
                            k < index
                              ? "100%"
                              : k === index
                                ? `${Math.round(progress * 100)}%`
                                : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="relative w-full md:w-[58%] h-[380px] sm:h-[420px] md:h-full">
                  <Image src={s.image} alt={s.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 hover:scale-[1.02]" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/0" />
                </div>
                <div className="relative w-full md:w-[42%] p-5 sm:p-8 md:p-12 flex flex-col justify-center items-start">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">{s.title}</h1>
                  <p className="mt-2 text-sm md:text-base text-[var(--accent)]">{s.caption}</p>
                  <p className="mt-4 text-sm md:text-base text-[var(--foreground)]/90 leading-relaxed">
                    {s.description}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-[var(--foreground)]/85">
                    {s.points.map((p: string) => (
                      <div key={p} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => goToCatalog()}
                      className="rounded-full border border-[var(--accent-strong)]/60 bg-[var(--buy-button-bg)] text-[var(--foreground)] px-5 py-2 text-sm hover:opacity-90"
                    >
                      Смотреть каталог
                    </button>
                    <button
                      onClick={() => goToPromos()}
                      className="rounded-full border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] px-5 py-2 text-sm hover:bg-[var(--accent-strong)]/15 transition"
                    >
                      Акции
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto max-w-6xl px-0 sm:px-4 h-full relative">
            <button
              aria-label="Предыдущий слайд"
              onClick={() => {
                elapsedRef.current = 0;
                setProgress(0);
                setIndex((i) => (i - 1 + slides.length) % slides.length);
              }}
              className="pointer-events-auto absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)]/80 backdrop-blur hover:opacity-90 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Следующий слайд"
              onClick={() => {
                elapsedRef.current = 0;
                setProgress(0);
                setIndex((i) => (i + 1) % slides.length);
              }}
              className="pointer-events-auto absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-2 border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)]/80 backdrop-blur hover:opacity-90 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      
    </section>
  );
}
