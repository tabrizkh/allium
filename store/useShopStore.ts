"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Category, Recipient, Occasion, User, SliderItem } from "../lib/types";
import { toggleFavoriteAction } from "@/app/actions/user";

type State = {
  products: Product[];
  categories: Category[];
  sliderItems: SliderItem[];
  search: string;
  selectedCategories: Category[];
  selectedRecipients: Recipient[];
  selectedOccasions: Occasion[];
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  favorites: string[]; // product ids
  cart: any[]; // Changed to array of cart items
  user: User | null;
  authPanelOpen: boolean;
  authPanelTab: "login" | "register";
};

type Actions = {
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setSliderItems: (items: SliderItem[]) => void;
  setSearch: (q: string) => void;
  toggleCategory: (c: Category) => void;
  clearCategories: () => void;
  toggleRecipient: (r: Recipient) => void;
  clearRecipients: () => void;
  toggleOccasion: (o: Occasion) => void;
  clearOccasions: () => void;
  setPriceRange: (range: [number, number]) => void;
  resetPriceRange: () => void;
  toggleFavorite: (id: string) => Promise<void>;
  setFavorites: (ids: string[]) => void;
  addToCart: (product: any) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
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
      sliderItems: [],
      search: "",
      selectedCategories: [],
      selectedRecipients: [],
      selectedOccasions: [],
      minPrice: 0,
      maxPrice: 10000,
      priceRange: [0, 10000],
      favorites: [],
      cart: [],
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
      setSliderItems: (sliderItems) => set({ sliderItems }),
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
      toggleFavorite: async (id: string) => {
        const currentFavs = Array.isArray(get().favorites) ? get().favorites : [];
        const isFav = currentFavs.includes(id);
        
        // Optimistic UI update
        const nextFavs = isFav 
          ? currentFavs.filter((fid: string) => fid !== id) 
          : [...currentFavs, id];
        
        set({ favorites: nextFavs });

        // Sync with DB if logged in
        const user = get().user;
        if (user) {
          try {
            await toggleFavoriteAction(id);
          } catch (error) {
            console.error("Failed to sync favorite with DB:", error);
            // Rollback on error
            set({ favorites: currentFavs });
          }
        } else {
          if (!isFav && nextFavs.length === 1) set({ authPanelOpen: true, authPanelTab: "register" });
        }
      },
      setFavorites: (ids) => set({ favorites: ids }),
      addToCart: (productWithChoice: any) => {
        const isIdOnly = typeof productWithChoice === "string";
        const productId = isIdOnly ? productWithChoice : productWithChoice.id;
        const baseProduct = isIdOnly 
          ? get().products.find(p => p.id === productId) 
          : productWithChoice;
        
        if (!baseProduct) {
          console.error("Product not found for ID:", productId);
          return;
        }

        // Normalize options: if string ID passed, options are empty.
        // If object passed, use its selectedOptions.
        const selectedOptions = isIdOnly ? {} : (productWithChoice.selectedOptions || {});
        
        // Consistent ID for the same product with same options
        const cartItemId = `${productId}-${JSON.stringify(selectedOptions)}`;
        
        const currentCart = Array.isArray(get().cart) ? get().cart : [];
        const existingIndex = currentCart.findIndex((item: any) => item.id === cartItemId);
        
        let nextCart = [...currentCart];
        if (existingIndex > -1) {
          nextCart[existingIndex] = { 
            ...nextCart[existingIndex], 
            quantity: nextCart[existingIndex].quantity + 1 
          };
        } else {
          // Ensure price is a Number (Decimal from Prisma can cause issues in state)
          const price = typeof baseProduct.price === 'number' 
            ? baseProduct.price 
            : Number(baseProduct.price);

          let imageUrl = "/placeholder.jpg";
          if (Array.isArray(baseProduct.images) && baseProduct.images.length > 0) {
            imageUrl = baseProduct.images[0];
          } else if (typeof baseProduct.images === 'string') {
            try {
              const parsed = JSON.parse(baseProduct.images);
              if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = parsed[0];
              }
            } catch (e) {}
          }

          const newItem = {
            id: cartItemId,
            productId: productId,
            name: baseProduct.name,
            price: price,
            image: imageUrl || "/placeholder.jpg",
            quantity: 1,
            categoryId: baseProduct.categoryId,
            selectedOptions: selectedOptions
          };
          nextCart.push(newItem);
        }
        
        set({ cart: nextCart });
        
        // Auto-open register if first item and not logged in
        if (!get().user && currentCart.length === 0) {
          set({ authPanelOpen: true, authPanelTab: "register" });
        }
      },
      removeFromCart: (cartItemId) => {
        const currentCart = Array.isArray(get().cart) ? get().cart : [];
        set({ cart: currentCart.filter((item: any) => item.id !== cartItemId) });
      },
      updateCartQuantity: (cartItemId, quantity) => {
        const currentCart = Array.isArray(get().cart) ? get().cart : [];
        set({
          cart: currentCart.map((item: any) => 
            item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        });
      },
      clearCart: () => set({ cart: [] }),
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
          sliderItems: current.sliderItems.length > 0 ? current.sliderItems : (p?.sliderItems || []),
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
