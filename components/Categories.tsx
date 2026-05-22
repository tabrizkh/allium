"use client";
import { useShopStore } from "../store/useShopStore";
import type { Category, Recipient } from "../lib/types";
import { useState, useRef, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

const orderedSlugs = [
  "flowers",
  "vases",
  "decorations",
  "gifts",
  "sets",
  "bouquets",
];

const familyRecipients: Recipient[] = ["wife", "mom", "children"];

export default function Categories() {
  const { t, i18n } = useTranslation();
  const {
    categories: allCategories,
    selectedCategories,
    toggleCategory,
    clearCategories,
    selectedRecipients,
    toggleRecipient,
  } = useShopStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const lang = i18n.language;

  const displayCategories = useMemo(() => {
    const ordered = orderedSlugs
      .map((slug) => allCategories.find((c) => c.slug === slug))
      .filter((c): c is Category => !!c);
    
    const others = allCategories.filter(c => !orderedSlugs.includes(c.slug));
    return [...ordered, ...others];
  }, [allCategories]);

  const [openKey, setOpenKey] = useState<null | string>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenKey(null), 150);
  };

  const isCatActive = (c: Category) => Array.isArray(selectedCategories) && selectedCategories.some(sc => sc.id === c.id);
  const isFamilyActive = familyRecipients.some((r) => selectedRecipients.includes(r));
  const isFriendsActive = selectedRecipients.includes("friend");

  const toggleFamilyGroup = () => {
    const allSelected = familyRecipients.every((r) => selectedRecipients.includes(r));
    familyRecipients.forEach((r) => {
      const shouldToggle = allSelected || !selectedRecipients.includes(r);
      if (shouldToggle) toggleRecipient(r);
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 mt-6">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:gap-2 sm:justify-between">
        {displayCategories.map((c) => {
          const active = isCatActive(c);
          const hasDropdown = c.slug === "decorations" || c.slug === "gifts";
          const catName = !mounted 
            ? c.name 
            : (lang === 'az' ? c.name_az || c.name : lang === 'en' ? c.name_en || c.name : c.name);

          return (
            <div
              key={c.id}
              className="relative group flex-1 min-w-[120px]"
              onMouseEnter={() => {
                cancelClose();
                setOpenKey(hasDropdown ? c.slug : null);
              }}
              onMouseLeave={() => {
                if (hasDropdown) scheduleClose();
              }}
            >
              <button
                onClick={() => {
                  clearCategories();
                  toggleCategory(c);
                }}
                aria-haspopup={hasDropdown ? "menu" : undefined}
                aria-expanded={hasDropdown ? openKey === c.slug : undefined}
                className={`w-full text-center rounded-xl border px-3 py-2 text-sm transition ${
                  active
                    ? "border-[var(--accent-strong)] bg-[var(--accent-strong)]/10 text-[var(--foreground)] font-semibold shadow-inner"
                    : "border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]/5"
                }`}
              >
                {catName}
              </button>

              {hasDropdown && openKey === c.slug && (
                <div
                  className="absolute left-0 top-full mt-2 z-30 w-56 rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-lg p-2"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  {c.slug === "decorations" && (
                    <div>
                      {allCategories.find(x => x.slug === "corporate") && (
                        <button
                          onClick={() => {
                            clearCategories();
                            const cat = allCategories.find(x => x.slug === "corporate");
                            if (cat) toggleCategory(cat);
                          }}
                          className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm transition ${
                            isCatActive(allCategories.find(x => x.slug === "corporate")!) ? "bg-[var(--accent-strong)]/20 text-[var(--foreground)]" : "hover:bg-[var(--accent-strong)]/15"
                          }`}
                        >
                          <span>{mounted ? t('filters.occasions.gift') : "Подарки"}</span>
                          {isCatActive(allCategories.find(x => x.slug === "corporate")!) && <span>✓</span>}
                        </button>
                      )}
                    </div>
                  )}
                  {c.slug === "gifts" && (
                    <div>
                      <button
                        onClick={toggleFamilyGroup}
                        className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm transition ${
                          isFamilyActive ? "bg-[var(--accent-strong)]/20 text-[var(--foreground)]" : "hover:bg-[var(--accent-strong)]/15"
                        }`}
                      >
                        <span>{mounted ? t('filters.recipients.wife') : "Для семьи"}</span>
                        {isFamilyActive && <span>✓</span>}
                      </button>
                      <button
                        onClick={() => toggleRecipient("friend")}
                        className={`mt-1 flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm transition ${
                          isFriendsActive ? "bg-[var(--accent-strong)]/20 text-[var(--foreground)]" : "hover:bg-[var(--accent-strong)]/15"
                        }`}
                      >
                        <span>{mounted ? t('filters.recipients.friend') : "Для друзей"}</span>
                        {isFriendsActive && <span>✓</span>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}