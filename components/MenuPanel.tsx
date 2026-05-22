"use client";

import Link from "next/link";
import { Facebook, Globe, Instagram, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Props = {
  open: boolean;
  onClose: () => void;
  topOffset: number;
  theme: string;
  onToggleTheme: () => void;
  lang: string;
  onApplyLang: (lang: string) => void;
};

export default function MenuPanel({ open, onClose, topOffset, theme, onToggleTheme, lang, onApplyLang }: Props) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Point | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const dragRef = useRef<
    | {
        pointerId: number;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
      }
    | null
  >(null);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    setPos((prev) => {
      if (prev) return prev;
      const width = panelRef.current?.offsetWidth ?? 360;
      const x = Math.max(12, window.innerWidth - width - 12);
      const y = Math.max(12, topOffset + 12);
      return { x, y };
    });
  }, [open, topOffset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onClose, open]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (e.pointerId !== state.pointerId) return;
      if (typeof window === "undefined") return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      const panelEl = panelRef.current;
      const width = panelEl?.offsetWidth ?? 360;
      const height = panelEl?.offsetHeight ?? 520;

      const minX = 12;
      const minY = Math.max(12, topOffset + 12);
      const maxX = Math.max(minX, window.innerWidth - width - 12);
      const maxY = Math.max(minY, window.innerHeight - height - 12);

      const next: Point = {
        x: clamp(state.originX + dx, minX, maxX),
        y: clamp(state.originY + dy, minY, maxY),
      };

      setPos(next);
    };

    const onPointerUp = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (e.pointerId !== state.pointerId) return;
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [topOffset]);

  const startDrag = (e: React.PointerEvent) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 640) return;

    const origin = pos ?? { x: 12, y: Math.max(12, topOffset + 12) };
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: origin.x,
      originY: origin.y,
    };
  };

  const style = {
    left: (pos?.x ?? 12) + "px",
    top: (pos?.y ?? Math.max(12, topOffset + 12)) + "px",
  };

  return (
    <div
      ref={panelRef}
      className={[
        "fixed z-50 w-[320px] sm:w-[360px] max-w-[calc(100vw-24px)]",
        "transition duration-200 ease-out",
        open ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-[110%] pointer-events-none",
      ].join(" ")}
      style={style}
      aria-hidden={!open}
    >
      <div className="rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl overflow-hidden">
        <div
          className="flex items-center justify-between px-3 py-2 border-b border-[var(--accent-strong)]/40 select-none touch-none"
          onPointerDown={startDrag}
          style={{ cursor: "move" }}
        >
          <div className="flex items-center gap-2">
            <Menu size={18} />
            <div className="text-sm font-semibold">{mounted ? t('header.menu') : "Меню"}</div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition"
            onClick={onClose}
            aria-label={mounted ? t('packaging_popup.cancel') : "Закрыть"}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/#catalog"
              onClick={onClose}
              className="rounded-xl border border-[var(--accent-strong)]/60 px-4 py-3 hover:bg-[var(--accent-strong)]/10 transition"
            >
              {mounted ? t('header.catalog') : "Каталог"}
            </Link>
            <Link
              href="/#about"
              onClick={onClose}
              className="rounded-xl border border-[var(--accent-strong)]/60 px-4 py-3 hover:bg-[var(--accent-strong)]/10 transition"
            >
              {mounted ? t('header.about') : "О нас"}
            </Link>
            <Link
              href="/#contacts"
              onClick={onClose}
              className="rounded-xl border border-[var(--accent-strong)]/60 px-4 py-3 hover:bg-[var(--accent-strong)]/10 transition"
            >
              {mounted ? t('header.contacts') : "Контакты"}
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] px-4 py-3 hover:bg-[var(--accent-strong)]/10 transition text-sm font-medium"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "light" 
                ? (mounted ? t('header.theme_toggle.dark') : "Тёмная тема") 
                : (mounted ? t('header.theme_toggle.light') : "Светлая тема")}
            </button>

            <div className="rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Globe size={16} />
                <span>{mounted ? t('header.language') : "Язык"}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onApplyLang("ru")}
                  className={`rounded-xl border border-[var(--accent-strong)]/60 px-3 py-2 text-sm ${lang === "ru" ? "bg-[var(--accent-strong)]/15" : "hover:bg-[var(--accent-strong)]/10"}`}
                >
                  RU
                </button>
                <button
                  type="button"
                  onClick={() => onApplyLang("en")}
                  className={`rounded-xl border border-[var(--accent-strong)]/60 px-3 py-2 text-sm ${lang === "en" ? "bg-[var(--accent-strong)]/15" : "hover:bg-[var(--accent-strong)]/10"}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onApplyLang("az")}
                  className={`rounded-xl border border-[var(--accent-strong)]/60 px-3 py-2 text-sm ${lang === "az" ? "bg-[var(--accent-strong)]/15" : "hover:bg-[var(--accent-strong)]/10"}`}
                >
                  AZ
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-2">
            <Link
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
              aria-label="Facebook"
              title="Facebook"
            >
              <Facebook size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
