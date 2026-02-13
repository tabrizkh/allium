"use client";
import Header from "../components/Header";
import HeroShowcase from "../components/HeroShowcase";
import Filters from "../components/Filters";

import Categories from "../components/Categories";
import ProductCard from "../components/ProductCard";
import { useFilteredProducts } from "../store/useShopStore";
 
import Features from "../components/Features";
import Trending from "../components/Trending";
import CategoryTiles from "../components/CategoryTiles";

export default function Home() {
  const list = useFilteredProducts();

  
  return (
    <div className="min-h-screen ">
      <Header />
      <CategoryTiles />

      <HeroShowcase />
      <Trending />
      <Categories />
      <Filters />
      <section id="catalog" className="mx-auto max-w-6xl px-4 py-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-x-6">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section id="about">
        <Features />
      </section>
      <a
        href={`${process.env.NEXT_PUBLIC_WHATSAPP_PHONE ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE}` : `https://wa.me/?text=${encodeURIComponent("Здравствуйте! Хочу оформить заказ")}`}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 bg-[#25D366] text-white shadow-lg border border-[var(--accent-strong)]/60 hover:opacity-90 transition"
        aria-label="WhatsApp"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 0 0-8.66 15.1L2 22l4.99-1.31A10 10 0 1 0 12 2Zm5.64 14.3c-.27.77-1.6 1.42-2.2 1.45-.6.03-1.3.04-2.1-.13a9.38 9.38 0 0 1-3.32-1.77 8.51 8.51 0 0 1-2.7-3.3c-.28-.52-.6-1.54-.6-1.54s-.15-.37-.15-.88c0-.5.27-.77.37-.87.1-.1.26-.13.35-.13h.25c.08 0 .18.02.27.21.1.2.33.8.36.86.03.08.05.17.01.27-.04.1-.06.16-.11.24-.06.08-.13.18-.2.28-.06.1-.13.2-.06.36.06.16.26.65.57 1.06.4.55.94 1.1 1.65 1.5.57.31 1.07.5 1.43.64.16.06.3.05.4-.06.1-.11.47-.55.6-.74.13-.19.26-.16.43-.1.17.06 1.09.51 1.28.6.19.09.32.14.37.22.05.08.05.86-.22 1.63Z"/></svg>
      </a>
    </div>
  );
}
