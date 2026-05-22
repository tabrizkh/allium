"use client";
import { ChevronDown, Check, RotateCcw } from "lucide-react";
import { useShopStore } from "../store/useShopStore";
import { useRef, useEffect, useState } from "react";
import { recipients as recs, occasions as occs } from "../lib/constants";
import { useTranslation } from "react-i18next";

export default function Filters() {
  const { t } = useTranslation();
  const {
    selectedRecipients,
    selectedOccasions,
    toggleRecipient,
    toggleOccasion,
    clearRecipients,
    clearOccasions,
    clearCategories,
    priceRange,
    minPrice,
    maxPrice,
    setPriceRange,
    resetPriceRange,
    setSearch,
  } = useShopStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // локальное состояние открытия дропдаунов
  const [openRecipients, setOpenRecipients] = useState(false);
  const [openOccasions, setOpenOccasions] = useState(false);
  const recRef = useRef<HTMLDivElement>(null);
  const occRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (recRef.current && !recRef.current.contains(target)) setOpenRecipients(false);
      if (occRef.current && !occRef.current.contains(target)) setOpenOccasions(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const resetAll = () => {
    clearRecipients();
    clearOccasions();
    clearCategories();
    resetPriceRange();
    setSearch("");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 mt-6" id="explore">
      <div className="flex items-stretch gap-3 justify-between flex-wrap overflow-visible">
        {/* Кому? комбобокс */}
        <div className="relative flex-1 min-w-[240px]" ref={recRef}>
          <button
            type="button"
            onClick={() => setOpenRecipients((v) => !v)}
            aria-expanded={openRecipients}
            className={`w-full flex items-center justify-between bg-[var(--background)] rounded-xl border px-3 py-2 text-sm transition cursor-pointer ${
              selectedRecipients.length
                ? "border-[var(--accent-strong)]/60 bg-[var(--accent-strong)]/20 text-[var(--foreground)] shadow-sm"
                : "border-[var(--accent-strong)]/60 hover:bg-[var(--accent-strong)]/15 "
            }`}
          >
            <span className="flex-1 text-center">
              {mounted ? t('filters.recipient') : "Кому?"}{selectedRecipients.length ? ` (${selectedRecipients.length})` : ""}
            </span>
            <ChevronDown size={16} className={`transition ${openRecipients ? "rotate-180" : "rotate-0"}`} />
          </button>
          {openRecipients && (
            <div
              className="absolute left-0 top-full mt-2 w-full z-50 rounded-xl border border-[var(--accent-strong)]/60 bg-[#d1c1ae] shadow-lg p-2" 
              role="listbox"
              aria-multiselectable
            >
              {recs.map((r) => {
                const active = selectedRecipients.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleRecipient(r)}
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm transition cursor-pointer ${
                      active ? "bg-[var(--accent-strong)]/20 text-[var(--foreground)]" : "hover:bg-[var(--accent-strong)]/15"
                    }`}
                  >
                    <span>{mounted ? t(`filters.recipients.${r}`) : r}</span>
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Для чего? комбобокс */}
        <div className="relative flex-1 min-w-[240px]" ref={occRef}>
          <button
            type="button"
            onClick={() => setOpenOccasions((v) => !v)}
            aria-expanded={openOccasions}
            className={`w-full flex items-center justify-between bg-[var(--background)] rounded-xl border px-3 py-2 text-sm transition cursor-pointer ${
              selectedOccasions.length
                ? "border-[var(--accent-strong)]/60 bg-[var(--accent-strong)]/20 text-[var(--foreground)] shadow-sm "
                : "border-[var(--accent-strong)]/60 hover:bg-[var(--accent-strong)]/15 "
            }`}
          >
            <span className="flex-1 text-center">
              {mounted ? t('filters.occasion') : "Для чего?"}{selectedOccasions.length ? ` (${selectedOccasions.length})` : ""}
            </span>
            <ChevronDown size={16} className={`transition ${openOccasions ? "rotate-180" : "rotate-0"}`} />
          </button>
          {openOccasions && (
            <div
              className="absolute left-0 top-full mt-2 w-full z-50 rounded-xl border border-[var(--accent-strong)]/60 bg-[#d1c1ae] shadow-lg p-2"
              role="listbox"
              aria-multiselectable
            >
              {occs.map((o) => {
                const active = selectedOccasions.includes(o);
                return (
                  <button
                    key={o}
                    onClick={() => toggleOccasion(o)}
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm transition cursor-pointer ${
                      active ? "bg-[var(--accent-strong)]/20 text-[var(--foreground)]" : "hover:bg-[var(--accent-strong)]/15"
                    }`}
                  >
                    <span>{mounted ? t(`filters.occasions.${o}`) : o}</span>
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Цена компактно */}
        <div className="flex-1 min-w-[240px]">
          <div className="inline-flex w-full items-center justify-between gap-2 rounded-xl  px-2 text-sm">
            <span className="text-[var(--accent)]">{mounted ? t('filters.price') : "Цена"}</span>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => {
                const nextMin = Number(e.target.value || minPrice);
                const clamped = Math.min(nextMin, priceRange[1]);
                setPriceRange([clamped, priceRange[1]]);
              }}
            className="w-20 rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--accent)] px-2 py-2 text-sm focus:outline-none"
          />
          <span>—</span>
          <input
            type="number"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => {
              const nextMax = Number(e.target.value || maxPrice);
              const clamped = Math.max(nextMax, priceRange[0]);
              setPriceRange([priceRange[0], clamped]);
            }}
            className="w-20 rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--accent)] px-2 py-2 text-sm focus:outline-none"
          />
            <span className="text-[var(--accent)]">₼</span>
          </div>
        </div>

        {/* Сбросить — иконка справа */}
        <div className="flex-none">
          <button
            type="button"
            aria-label={mounted ? t('filters.reset') : "Сбросить фильтры"}
            title={mounted ? t('filters.reset') : "Сбросить фильтры"}
            onClick={resetAll}
            className="inline-flex h-full items-center justify-center rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] px-3 py-2 text-sm hover:bg-[var(--accent-strong)]/15 cursor-pointer"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
