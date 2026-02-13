"use client";
import Link from "next/link";
import { Heart, Search, ShoppingBag, User, Sun, Moon, X, Globe, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShopStore } from "../store/useShopStore";
import ShopPanels from "./ShopPanels";
import AuthPanel from "./AuthPanel";
import MenuPanel from "./MenuPanel";
import BrandLogo from "./BrandLogo";

export default function Header() {
  const { setSearch, favorites, cart, openAuthPanel, user } = useShopStore();
  const favCount = Array.isArray(favorites) ? favorites.length : 0;
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const [theme, setTheme] = useState<string>(() => (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) || "light");
  const [lang, setLang] = useState<string>(() => {
    if (typeof document !== "undefined") {
      const saved = (() => { try { return localStorage.getItem("allium-lang") } catch { return null } })();
      const initial = saved || "ru";
      document.documentElement.setAttribute("lang", initial);
      return initial;
    }
    return "ru";
  });
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const update = () => setHeaderHeight(headerRef.current ? headerRef.current.offsetHeight : 0);
    update();

    let ro: ResizeObserver | null = null;
    if (typeof window !== "undefined" && headerRef.current && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => update());
      ro.observe(headerRef.current);
    }

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("allium-theme", next); } catch {}
    setTheme(next);
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => mobileSearchRef.current?.focus(), 0);
  };
  const closeMobileSearch = () => setMobileSearchOpen(false);

  const openMenu = () => {
    setMenuOpen(true);
    setFavoritesOpen(false);
    setCartOpen(false);
    setMobileSearchOpen(false);
    setLangOpen(false);
  };
  const closeMenu = () => setMenuOpen(false);

  const openFavorites = () => { setFavoritesOpen(true); setCartOpen(false); setMenuOpen(false); setMobileSearchOpen(false); };
  const closeFavorites = () => setFavoritesOpen(false);
  const openCart = () => { setCartOpen(true); setFavoritesOpen(false); setMenuOpen(false); setMobileSearchOpen(false); };
  const closeCart = () => setCartOpen(false);
  const applyLang = (l: string) => {
    setLang(l);
    if (typeof document !== "undefined") document.documentElement.setAttribute("lang", l);
    try { localStorage.setItem("allium-lang", l); } catch {}
    setLangOpen(false);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-20 bg-[var(--background)] backdrop-blur border-b border-[var(--accent-strong)]/60">
      <div className="mx-auto max-w-6xl px-3 sm:px-4   flex items-center justify-between text-[var(--foreground)]">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-start">
          <button
            type="button"
            onClick={openMenu}
            aria-label="Меню"
            title="Меню"
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
          >
            <Menu size={20} />
          </button>
          <button type="button" onClick={openMobileSearch} className="sm:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition" aria-label="Поиск">
            <Search size={18} />
          </button>
          <div className="relative w-full max-w-[160px] md:max-w-xs hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Поиск..."
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--accent)] pl-10 pr-3 h-9 sm:h-10 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-strong)] focus:border-[var(--accent-strong)]/60"
            />
          </div>
        </div>

        <div className="flex-0 mx-4">
          <Link href="/" className="inline-flex items-center justify-center hover:opacity-90 transition">
            <BrandLogo className="h-8 sm:h-20 w-24 sm:w-28" />
          </Link>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            title="Переключить тему"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition text-[var(--foreground)]"
          >
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            <span className="hidden xl:inline text-sm">{theme === "light" ? "Светлая" : "Тёмная"}</span>
          </button>
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-label="Выбрать язык"
              title="Язык"
              className="inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition text-[var(--foreground)]"
            >
              <Globe size={20} />
              <span className="hidden xl:inline text-sm uppercase">{lang}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-md p-1">
                <button type="button" onClick={() => applyLang("ru")} className={`w-full text-left px-3 py-2 rounded-lg ${lang === "ru" ? "bg-[var(--accent-strong)]/15" : ""}`}>Русский</button>
                <button type="button" onClick={() => applyLang("en")} className={`w-full text-left px-3 py-2 rounded-lg ${lang === "en" ? "bg-[var(--accent-strong)]/15" : ""}`}>English</button>
                <button type="button" onClick={() => applyLang("az")} className={`w-full text-left px-3 py-2 rounded-lg ${lang === "az" ? "bg-[var(--accent-strong)]/15" : ""}`}>Azərbaycanca</button>
              </div>
            )}
          </div>
          <button
            onClick={openFavorites}
            className={`relative inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition ${favCount > 0 ? "bg-[var(--accent-strong)]/15" : ""}`}
            title="Избранное"
            aria-haspopup="dialog"
          >
            <Heart size={20} />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs rounded-full bg-[var(--badge-bg)] text-[var(--badge-fg)] px-1 shadow-sm">
                {favCount}
              </span>
            )}
          </button>
          <button
            onClick={openCart}
            className={`relative inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition ${cartCount > 0 ? "bg-[var(--accent-strong)]/15" : ""}`}
            title="Корзина"
            aria-haspopup="dialog"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs rounded-full bg-[var(--badge-bg)] text-[var(--badge-fg)] px-1 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => openAuthPanel(user ? undefined : favCount > 0 || cartCount > 0 ? "register" : "login")}
            className={`inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition ${!user && (favCount > 0 || cartCount > 0) ? "bg-[var(--accent-strong)]/15" : ""}`}
            title="Профиль"
            aria-haspopup="dialog"
          >
            <User size={20} />
          </button>
        </nav>
      </div>

      {mobileSearchOpen && (
        <div className="fixed left-0 right-0 bottom-0 z-40 bg-[var(--background)]" style={{ top: headerHeight }}>
          <div className="mx-auto max-w-6xl px-3 pt-3">
            <div className="rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] p-2 flex items-center gap-2">
              <span className="text-[var(--accent)]"><Search size={18} /></span>
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Поиск..."
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-md bg-transparent text-[var(--foreground)] placeholder-[var(--accent)] h-10 text-sm outline-none"
              />
              <button type="button" onClick={closeMobileSearch} className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition" aria-label="Закрыть">
                <X size={16} />
              </button>
            </div>
          </div>
          <button className="absolute inset-0" onClick={closeMobileSearch} aria-hidden="true" />
        </div>
      )}

      <MenuPanel open={menuOpen} onClose={closeMenu} topOffset={headerHeight} theme={theme} onToggleTheme={toggleTheme} lang={lang} onApplyLang={applyLang} />

      <ShopPanels
        favoritesOpen={favoritesOpen}
        cartOpen={cartOpen}
        onCloseFavorites={closeFavorites}
        onCloseCart={closeCart}
        topOffset={headerHeight}
      />
      <AuthPanel topOffset={headerHeight} />
    </header>
  );
}
