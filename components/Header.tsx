"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingBag, User, Sun, Moon, X, Globe, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShopStore } from "../store/useShopStore";
import ShopPanels from "./ShopPanels";
import AuthPanel from "./AuthPanel";
import MenuPanel from "./MenuPanel";
import BrandLogo from "./BrandLogo";
import ProductPopup from "./ProductPopup";

export default function Header() {
  const { setSearch, favorites, cart, openAuthPanel, user, categories, products, toggleCategory, clearCategories } = useShopStore();
  const { t, i18n } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const filteredCategories = useMemo(() => {
    if (!searchValue.trim()) return [];
    const q = searchValue.toLowerCase();
    const lang = i18n.language;
    return categories.filter(c => {
      const name = lang === 'az' ? c.name_az || c.name : lang === 'en' ? c.name_en || c.name : c.name;
      return name.toLowerCase().includes(q);
    }).slice(0, 5);
  }, [categories, searchValue, i18n.language]);

  const filteredProducts = useMemo(() => {
    if (!searchValue.trim()) return [];
    const q = searchValue.toLowerCase();
    const lang = i18n.language;
    return products.filter(p => {
      const name = lang === 'az' ? p.name_az || p.name : lang === 'en' ? p.name_en || p.name : p.name;
      return name.toLowerCase().includes(q);
    }).slice(0, 5);
  }, [products, searchValue, i18n.language]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    setShowDropdown(val.length > 0);
  };

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const selectCategory = (cat: any) => {
    setSearchValue("");
    setSearch("");
    setShowDropdown(false);
    clearCategories();
    toggleCategory(cat);
    // Reset other filters
    useShopStore.getState().clearRecipients();
    useShopStore.getState().clearOccasions();
    useShopStore.getState().resetPriceRange();
    
    setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const selectProduct = (p: any) => {
    setSearchValue("");
    setShowDropdown(false);
    setSelectedProduct(p);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node) && 
          mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const favCount = Array.isArray(favorites) ? favorites.length : 0;
  const cartCount = Array.isArray(cart) ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const [theme, setTheme] = useState<string>("light");
  const [lang, setLang] = useState<string>("ru");

  useEffect(() => {
    if (typeof document !== "undefined") {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(currentTheme);

      const savedLang = (() => { try { return localStorage.getItem("allium-lang") } catch { return null } })();
      const initialLang = savedLang || "ru";
      document.documentElement.setAttribute("lang", initialLang);
      setLang(initialLang);
    }
  }, []);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    i18n.changeLanguage(l);
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
            aria-label={mounted ? t('header.menu') : "Меню"}
            title={mounted ? t('header.menu') : "Меню"}
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
          >
            <Menu size={20} />
          </button>
          <button
            type="button"
            onClick={openMobileSearch}
            className="sm:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--accent-strong)]/20 transition"
            aria-label={mounted ? t('header.search') : "Поиск..."}
            title={mounted ? t('header.search') : "Поиск..."}
          >
            <Search size={20} />
          </button>
          <div ref={searchContainerRef} className="relative w-full max-w-[160px] md:max-w-xs hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder={mounted ? t('header.search') : "Поиск..."}
              value={searchValue}
              onFocus={() => setShowDropdown(searchValue.length > 0)}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--accent)] pl-10 pr-3 h-9 sm:h-10 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-strong)] focus:border-[var(--accent-strong)]/60"
            />

            {showDropdown && (filteredCategories.length > 0 || filteredProducts.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl p-1 overflow-hidden">
                {filteredCategories.length > 0 && (
                  <div className="p-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-60">{mounted ? t('header.categories') : "Категории"}</div>
                    {filteredCategories.map(cat => {
                      const name = i18n.language === 'az' ? cat.name_az || cat.name : i18n.language === 'en' ? cat.name_en || cat.name : cat.name;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => selectCategory(cat)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--accent-strong)]/15 transition flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-40 group-hover:opacity-100 transition" />
                          <span className="text-sm font-medium">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {filteredProducts.length > 0 && (
                  <div className="p-1 border-t border-[var(--accent-strong)]/30 mt-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-60">{mounted ? t('header.products') : "Товары"}</div>
                    {filteredProducts.map(p => {
                      const name = i18n.language === 'az' ? p.name_az || p.name : i18n.language === 'en' ? p.name_en || p.name : p.name;
                      return (
                        <button
                          key={p.id}
                          onClick={() => selectProduct(p)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--accent-strong)]/15 transition flex items-center gap-3"
                        >
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={p.images[0] || "/placeholder.jpg"} alt={name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{name}</div>
                            <div className="text-xs text-[var(--accent)]">{p.price} ₼</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-0 mx-4">
          <Link href="/" className="inline-flex items-center justify-center hover:opacity-90 transition">
            <BrandLogo className="h-8 sm:h-20 w-24 sm:w-28" />
          </Link>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          {mounted && (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={t('header.theme.light')}
                title={t('header.theme.light')}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition text-[var(--foreground)]"
              >
                {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                <span className="hidden xl:inline text-sm">{theme === "light" ? t('header.theme.light') : t('header.theme.dark')}</span>
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
            </>
          )}
          <button
            onClick={openFavorites}
            className={`relative inline-flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 hover:bg-[var(--accent-strong)]/20 transition ${favCount > 0 ? "bg-[var(--accent-strong)]/15" : ""}`}
            title={mounted ? t('header.favorites') : "Избранное"}
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
            title={mounted ? t('header.cart') : "Корзина"}
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
            title={mounted ? t('header.profile') : "Профиль"}
            aria-haspopup="dialog"
          >
            <User size={20} />
          </button>
        </nav>
      </div>

      {mobileSearchOpen && (
        <div className="fixed left-0 right-0 bottom-0 z-40 bg-[var(--background)]" style={{ top: headerHeight }}>
          <div className="mx-auto max-w-6xl px-3 pt-3">
            <div ref={mobileSearchContainerRef} className="relative">
              <div className="rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] p-2 flex items-center gap-2">
                <span className="text-[var(--accent)]"><Search size={18} /></span>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder={mounted ? t('header.search') : "Поиск..."}
                  value={searchValue}
                  onFocus={() => setShowDropdown(searchValue.length > 0)}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 rounded-md bg-transparent text-[var(--foreground)] placeholder-[var(--accent)] h-10 text-sm outline-none"
                />
                <button type="button" onClick={closeMobileSearch} className="inline-flex items-center justify-center rounded-md p-2 hover:bg-[var(--accent-strong)]/20 transition" aria-label={mounted ? t('packaging_popup.cancel') : "Закрыть"}>
                  <X size={16} />
                </button>
              </div>

              {showDropdown && (filteredCategories.length > 0 || filteredProducts.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-[var(--accent-strong)]/60 bg-[var(--panel-bg)] shadow-xl p-1 overflow-hidden">
                  {filteredCategories.length > 0 && (
                    <div className="p-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-60">{mounted ? t('header.categories') : "Категории"}</div>
                      {filteredCategories.map(cat => {
                        const name = i18n.language === 'az' ? cat.name_az || cat.name : i18n.language === 'en' ? cat.name_en || cat.name : cat.name;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { selectCategory(cat); closeMobileSearch(); }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--accent-strong)]/15 transition flex items-center gap-2 group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-40 group-hover:opacity-100 transition" />
                            <span className="text-sm font-medium">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {filteredProducts.length > 0 && (
                    <div className="p-1 border-t border-[var(--accent-strong)]/30 mt-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-60">{mounted ? t('header.products') : "Товары"}</div>
                      {filteredProducts.map(p => {
                        const name = i18n.language === 'az' ? p.name_az || p.name : i18n.language === 'en' ? p.name_en || p.name : p.name;
                        return (
                          <button
                            key={p.id}
                            onClick={() => { selectProduct(p); closeMobileSearch(); }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--accent-strong)]/15 transition flex items-center gap-3"
                          >
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image src={p.images[0] || "/placeholder.jpg"} alt={name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{name}</div>
                              <div className="text-xs text-[var(--accent)]">{p.price} ₼</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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
      {selectedProduct && (
        <ProductPopup 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </header>
  );
}
