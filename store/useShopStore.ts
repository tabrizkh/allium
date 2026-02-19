"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Category, Recipient, Occasion, User } from "../lib/types";
import { toggleFavoriteAction } from "@/app/actions/user";

type State = {
  products: Product[];
  categories: Category[];
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
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
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
  setFavorites: (ids: string[]) => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  login: (email: string) => void; // Deprecated, keep for now or remove
  logout: () => void;
  register: (name: string, email: string) => void; // Deprecated
  openAuthPanel: (tab?: "login" | "register") => void;
  closeAuthPanel: () => void;
  setAuthPanelTab: (tab: "login" | "register") => void;
};

export const useShopStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      search: "",
      selectedCategories: [],
      selectedRecipients: [],
      selectedOccasions: [],
      minPrice: 0,
      maxPrice: 10000,
      priceRange: [0, 10000],
      favorites: [],
      cart: {},
      user: null,
      authPanelOpen: false,
      authPanelTab: "register",
      setProducts: (products) => {
        const prices = products.map((p) => p.price);
        const min = prices.length ? Math.min(...prices) : 0;
        const max = prices.length ? Math.max(...prices) : 10000;
        set({
          products,
          minPrice: min,
          maxPrice: max,
          priceRange: [min, max],
        });
      },
      setCategories: (categories) => set({ categories }),
      setSearch: (q) => set({ search: q }),
      toggleCategory: (c) => {
        const arr = get().selectedCategories;
        const exists = arr.find((x) => x.id === c.id);
        const next = exists
          ? arr.filter((x) => x.id !== c.id)
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
        
        if (user) {
          toggleFavoriteAction(id).catch((err) => console.error("Failed to sync favorite", err));
        } else {
          if (!wasIn && next.length === 1) set({ authPanelOpen: true, authPanelTab: "register" });
        }
      },
      setFavorites: (ids) => set({ favorites: ids }),
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
      clearCart: () => set({ cart: {} }),
      setUser: (user) => set({ user }),
      login: (email) => {
        // Deprecated mock login
        console.warn("Using deprecated mock login");
      },
      logout: () => set({ user: null }),
      register: (name, email) => {
        // Deprecated mock register
        console.warn("Using deprecated mock register");
      },
      openAuthPanel: (tab) => set({ authPanelOpen: true, authPanelTab: tab || get().authPanelTab }),
      closeAuthPanel: () => set({ authPanelOpen: false }),
      setAuthPanelTab: (tab) => set({ authPanelTab: tab }),
    }),
    {
      name: "allium-store",
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user, authPanelOpen, authPanelTab, ...rest } = state;
        return rest;
      },
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
          ...current,
          ...p,
          products: current.products.length > 0 ? current.products : (p?.products || []),
          categories: current.categories.length > 0 ? current.categories : (p?.categories || []),
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
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));
    const matchesCategory =
      cats.length === 0 || cats.some((c) => c.id === p.categoryId);
    const matchesRecipient =
      recs.length === 0 ||
      (Array.isArray(p.recipients) && p.recipients.some((r) => recs.includes(r as Recipient)));
    const matchesOccasion =
      occs.length === 0 ||
      (Array.isArray(p.occasions) && p.occasions.some((o) => occs.includes(o as Occasion)));
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesQuery && matchesCategory && matchesRecipient && matchesOccasion && matchesPrice;
  });
};
