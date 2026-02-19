"use client";

import { useRef, useEffect } from "react";
import { useShopStore } from "@/store/useShopStore";
import { Product, Category } from "@/lib/types";

export default function StoreInitializer({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useShopStore.getState().setProducts(products);
      useShopStore.getState().setCategories(categories);
      initialized.current = true;
    }
  }, [products, categories]);

  return null;
}
