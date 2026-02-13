"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Category, Recipient, Occasion, User } from "../lib/types";
import { products as seed } from "../data/products";

type State = {
  products: Product[];
  search: string;
  selectedCategories: Category[];
  selectedRecipients: Recipient[];
  selectedOccasions: Occasion[];
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  favorites: string[]; // product ids
  cart: Record<string, number>; // product id -> qty
  user: User | null;
  authPanelOpen: boolean;
  authPanelTab: "login" | "register";
};

type Actions = {
  setSearch: (q: string) => void;
  toggleCategory: (c: Category) => void;
  clearCategories: () => void;
  toggleRecipient: (r: Recipient) => void;
  clearRecipients: () => void;
  toggleOccasion: (o: Occasion) => void;
  clearOccasions: () => void;
  setPriceRange: (range: [number, number]) => void;
  resetPriceRange: () => void;
  toggleFavorite: (id: string) => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  login: (email: string) => void;
  logout: () => void;
  register: (name: string, email: string) => void;
  openAuthPanel: (tab?: "login" | "register") => void;
  closeAuthPanel: () => void;
  setAuthPanelTab: (tab: "login" | "register") => void;
};

export const useShopStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      products: seed,
      search: "",
      selectedCategories: [],
      selectedRecipients: [],
      selectedOccasions: [],
      // derive min/max price from seed once
      minPrice: Math.min(...seed.map((p) => p.price)),
      maxPrice: Math.max(...seed.map((p) => p.price)),
      priceRange: [Math.min(...seed.map((p) => p.price)), Math.max(...seed.map((p) => p.price))],
      favorites: [],
      cart: {},
      user: null,
      authPanelOpen: false,
      authPanelTab: "register",
      setSearch: (q) => set({ search: q }),
      toggleCategory: (c) => {
        const arr = get().selectedCategories;
        const next = arr.includes(c)
          ? arr.filter((x) => x !== c)
          : [...arr, c];
        set({ selectedCategories: next });
      },
      clearCategories: () => set({ selectedCategories: [] }),
      toggleRecipient: (r) => {
        const arr = get().selectedRecipients;
        const next = arr.includes(r)
          ? arr.filter((x) => x !== r)
          : [...arr, r];
        set({ selectedRecipients: next });
      },
      clearRecipients: () => set({ selectedRecipients: [] }),
      toggleOccasion: (o) => {
        const arr = get().selectedOccasions;
        const next = arr.includes(o)
          ? arr.filter((x) => x !== o)
          : [...arr, o];
        set({ selectedOccasions: next });
      },
      clearOccasions: () => set({ selectedOccasions: [] }),
      setPriceRange: (range) => {
        const [min, max] = range;
        const floor = get().minPrice;
        const ceil = get().maxPrice;
        const clampedMin = Math.max(floor, Math.min(min, max));
        const clampedMax = Math.min(ceil, Math.max(max, min));
        set({ priceRange: [clampedMin, clampedMax] });
      },
      resetPriceRange: () => {
        set({ priceRange: [get().minPrice, get().maxPrice] });
      },
      toggleFavorite: (id) => {
        const arr = get().favorites;
        const user = get().user;
        const wasIn = arr.includes(id);
        const next = wasIn ? arr.filter((x) => x !== id) : [...arr, id];
        set({ favorites: next });
        if (!user && !wasIn && next.length === 1) set({ authPanelOpen: true, authPanelTab: "register" });
      },
      addToCart: (id) => {
        const prevCart = get().cart;
        const prevCount = Object.values(prevCart).reduce((a, b) => a + b, 0);
        const cart = { ...prevCart };
        cart[id] = (cart[id] || 0) + 1;
        set({ cart });
        if (!get().user && prevCount === 0) set({ authPanelOpen: true, authPanelTab: "register" });
      },
      removeFromCart: (id) => {
        const cart = { ...get().cart };
        if (!cart[id]) return;
        if (cart[id] <= 1) delete cart[id];
        else cart[id] = cart[id] - 1;
        set({ cart });
      },
      login: (email) => {
        const current = get().user;
        const next: User = current?.email === email ? current! : { id: "local", name: "Гость", email };
        set({ user: next, authPanelOpen: false });
      },
      logout: () => set({ user: null }),
      register: (name, email) => {
        const next: User = { id: "local", name, email };
        set({ user: next, authPanelOpen: false });
      },
      openAuthPanel: (tab) => set({ authPanelOpen: true, authPanelTab: tab || get().authPanelTab }),
      closeAuthPanel: () => set({ authPanelOpen: false }),
      setAuthPanelTab: (tab) => set({ authPanelTab: tab }),
    }),
    {
      name: "allium-store",
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<State>;
        const sc = p?.selectedCategories;
        const fav = p?.favorites;
        const sr = p?.selectedRecipients;
        const so = p?.selectedOccasions;
        const pr = p?.priceRange as [number, number] | undefined;
        const u = p?.user as User | undefined;
        const authPanelTab = p?.authPanelTab as State["authPanelTab"] | undefined;
        return {
          // Prefer current seed for products to reflect latest data updates
          ...current,
          ...p,
          products: current.products,
          selectedCategories: Array.isArray(sc) ? (sc as Category[]) : [],
          favorites: Array.isArray(fav) ? (fav as string[]) : [],
          selectedRecipients: Array.isArray(sr) ? (sr as Recipient[]) : [],
          selectedOccasions: Array.isArray(so) ? (so as Occasion[]) : [],
          user: u ? u : null,
          authPanelOpen: false,
          authPanelTab: authPanelTab === "login" || authPanelTab === "register" ? authPanelTab : "register",
          priceRange:
            Array.isArray(pr) && pr.length === 2
              ? pr
              : [current.minPrice, current.maxPrice],
        } as State & Actions;
      },
    }
  )
);

export const useFilteredProducts = () => {
  const { products, search, selectedCategories, selectedRecipients, selectedOccasions, priceRange } = useShopStore();
  const cats = Array.isArray(selectedCategories) ? selectedCategories : [];
  const recs = Array.isArray(selectedRecipients) ? selectedRecipients : [];
  const occs = Array.isArray(selectedOccasions) ? selectedOccasions : [];
  const q = search.trim().toLowerCase();
  return products.filter((p) => {
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const matchesCategory =
      cats.length === 0 || cats.includes(p.category);
    const matchesRecipient =
      recs.length === 0 ||
      (Array.isArray(p.recipients) && p.recipients.some((r) => recs.includes(r)));
    const matchesOccasion =
      occs.length === 0 ||
      (Array.isArray(p.occasions) && p.occasions.some((o) => occs.includes(o)));
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesQuery && matchesCategory && matchesRecipient && matchesOccasion && matchesPrice;
  });
};
